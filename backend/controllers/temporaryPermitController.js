const TemporaryPermit = require('../models/TemporaryPermit')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const { logError, getUserFriendlyError, getSimplifiedTimestamp } = require('../utils/errorLogger')
const path = require('path')
const fs = require('fs')

// Create new temporary permit
exports.createPermit = async (req, res) => {
  try {
    const permitData = req.body

    // Create new temporary permit without bill reference first
    const newPermit = new TemporaryPermit(permitData)
    await newPermit.save()

    // Create CustomBill document
    const billNumber = await generateCustomBillNumber(CustomBill)
    const vehicleTypeFull = newPermit.vehicleType === 'CV' ? 'Commercial Vehicle' : 'Passenger Vehicle'
    const customBill = new CustomBill({
      billNumber,
      customerName: newPermit.permitHolder,
      billDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      items: [
        {
          description: `Temporary Permit (${vehicleTypeFull})\nPermit No: ${newPermit.permitNumber}\nVehicle No: ${newPermit.vehicleNumber}\nValid From: ${newPermit.validFrom}\nValid To: ${newPermit.validTo}\nPeriod: ${newPermit.validityPeriod} months`,
          quantity: 1,
          rate: newPermit.totalFee,
          amount: newPermit.totalFee
        }
      ],
      totalAmount: newPermit.totalFee
    })
    await customBill.save()

    // Update permit with bill reference
    newPermit.bill = customBill._id
    await newPermit.save()

    // Fire PDF generation in background (don't wait for it)
    generateCustomBillPDF(customBill)
      .then(pdfPath => {
        customBill.billPdfPath = pdfPath
        return customBill.save()
      })
      .then(() => {
        console.log('Bill PDF generated successfully for temporary permit:', newPermit.permitNumber)
      })
      .catch(pdfError => {
        console.error('Error generating PDF (non-critical):', pdfError)
        // Don't fail the permit creation if PDF generation fails
      })

    // Send response immediately without waiting for PDF
    res.status(201).json({
      success: true,
      message: 'Temporary permit created successfully. Bill is being generated in background.',
      data: newPermit
    })
  } catch (error) {
    console.error('Error creating temporary permit:', error)
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(400).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Get all temporary permits
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      vehicleType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const fifteenDaysFromNow = new Date()
    fifteenDaysFromNow.setDate(today.getDate() + 15)
    fifteenDaysFromNow.setHours(23, 59, 59, 999)

    // Determine if we need aggregation pipeline (for date-based status filtering)
    const useDateBasedFilter = status && ['expired', 'expiring_soon', 'active'].includes(status)

    if (useDateBasedFilter) {
      // Use aggregation pipeline for date-based filtering
      const pipeline = []

      // Stage 1: Normalize date separator
      pipeline.push({
        $addFields: {
          validToNormalized: {
            $replaceAll: {
              input: '$validTo',
              find: '-',
              replacement: '/'
            }
          }
        }
      })

      // Stage 2: Add computed date field
      pipeline.push({
        $addFields: {
          validToDateParsed: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $arrayElemAt: [{ $split: ['$validToNormalized', '/'] }, 2] },
                  '-',
                  { $arrayElemAt: [{ $split: ['$validToNormalized', '/'] }, 1] },
                  '-',
                  { $arrayElemAt: [{ $split: ['$validToNormalized', '/'] }, 0] }
                ]
              },
              onError: null,
              onNull: null
            }
          }
        }
      })

      // Stage 3: Add computed status
      pipeline.push({
        $addFields: {
          computedStatus: {
            $switch: {
              branches: [
                { case: { $lt: ['$validToDateParsed', today] }, then: 'expired' },
                {
                  case: {
                    $and: [
                      { $gte: ['$validToDateParsed', today] },
                      { $lte: ['$validToDateParsed', fifteenDaysFromNow] }
                    ]
                  },
                  then: 'expiring_soon'
                }
              ],
              default: 'active'
            }
          }
        }
      })

      // Stage 4: Build match conditions
      const matchConditions = { computedStatus: status }

      // Add search filter (vehicle number only)
      if (search) {
        matchConditions.vehicleNumber = { $regex: search, $options: 'i' }
      }

      // Add vehicle type filter
      if (vehicleType) {
        matchConditions.vehicleType = vehicleType.toUpperCase()
      }

      pipeline.push({ $match: matchConditions })

      // Stage 5: Sort
      const sortOptions = {}
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1
      pipeline.push({ $sort: sortOptions })

      // Stage 6: Lookup bill
      pipeline.push({
        $lookup: {
          from: 'custombills',
          localField: 'bill',
          foreignField: '_id',
          as: 'bill'
        }
      })
      pipeline.push({
        $unwind: {
          path: '$bill',
          preserveNullAndEmptyArrays: true
        }
      })

      // Stage 7: Count total for pagination (use facet to get both data and count)
      pipeline.push({
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
          ]
        }
      })

      const results = await TemporaryPermit.aggregate(pipeline)
      const total = results[0].metadata.length > 0 ? results[0].metadata[0].total : 0
      const permits = results[0].data

      res.status(200).json({
        success: true,
        data: permits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      })
    } else {
      // Use normal query for non-date-based filtering
      const query = {}

      // Search by vehicle number only
      if (search) {
        query.vehicleNumber = { $regex: search, $options: 'i' }
      }

      // Filter by status or pending payment
      if (status) {
        if (status === 'pending') {
          query.balance = { $gt: 0 }
        } else {
          query.status = status
        }
      }

      // Filter by vehicle type
      if (vehicleType) {
        query.vehicleType = vehicleType.toUpperCase()
      }

      const skip = (parseInt(page) - 1) * parseInt(limit)

      // Sort options
      const sortOptions = {}
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

      // Execute query
      const permits = await TemporaryPermit.find(query)
        .populate('bill')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))

      // Get total count for pagination
      const total = await TemporaryPermit.countDocuments(query)

      res.status(200).json({
        success: true,
        data: permits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      })
    }
  } catch (error) {
    console.error('Error fetching temporary permits:', error)
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Get single temporary permit by ID
exports.getPermitById = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await TemporaryPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    res.status(200).json({
      success: true,
      data: permit
    })
  } catch (error) {
    console.error('Error fetching temporary permit:', error)
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Get temporary permit by permit number
exports.getPermitByNumber = async (req, res) => {
  try {
    const { permitNumber } = req.params

    const permit = await TemporaryPermit.findOne({ permitNumber })

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    res.status(200).json({
      success: true,
      data: permit
    })
  } catch (error) {
    console.error('Error fetching temporary permit:', error)
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Update temporary permit
exports.updatePermit = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updatedPermit = await TemporaryPermit.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedPermit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Temporary permit updated successfully',
      data: updatedPermit
    })
  } catch (error) {
    console.error('Error updating temporary permit:', error)
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(400).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Delete temporary permit
exports.deletePermit = async (req, res) => {
  try {
    const { id } = req.params

    const deletedPermit = await TemporaryPermit.findByIdAndDelete(id)

    if (!deletedPermit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Temporary permit deleted successfully',
      data: deletedPermit
    })
  } catch (error) {
    console.error('Error deleting temporary permit:', error)
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const fifteenDaysFromNow = new Date()
    fifteenDaysFromNow.setDate(today.getDate() + 15)
    fifteenDaysFromNow.setHours(23, 59, 59, 999)

    // Use aggregation pipeline to calculate statistics
    const statusPipeline = [
      {
        $addFields: {
          // Normalize separator: replace - with /
          validToNormalized: {
            $replaceAll: {
              input: '$validTo',
              find: '-',
              replacement: '/'
            }
          }
        }
      },
      {
        $addFields: {
          // Convert validTo string to date for comparison
          validToDateParsed: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $arrayElemAt: [{ $split: ['$validToNormalized', '/'] }, 2] }, // year
                  '-',
                  { $arrayElemAt: [{ $split: ['$validToNormalized', '/'] }, 1] }, // month
                  '-',
                  { $arrayElemAt: [{ $split: ['$validToNormalized', '/'] }, 0] }  // day
                ]
              },
              onError: null,
              onNull: null
            }
          }
        }
      },
      {
        $addFields: {
          computedStatus: {
            $switch: {
              branches: [
                {
                  case: { $lt: ['$validToDateParsed', today] },
                  then: 'expired'
                },
                {
                  case: {
                    $and: [
                      { $gte: ['$validToDateParsed', today] },
                      { $lte: ['$validToDateParsed', fifteenDaysFromNow] }
                    ]
                  },
                  then: 'expiring_soon'
                }
              ],
              default: 'active'
            }
          }
        }
      },
      {
        $group: {
          _id: '$computedStatus',
          count: { $sum: 1 }
        }
      }
    ]

    const statusResults = await TemporaryPermit.aggregate(statusPipeline)

    // Convert array to object for easy access
    const statusCounts = {
      active: 0,
      expired: 0,
      expiring_soon: 0
    }

    statusResults.forEach(result => {
      statusCounts[result._id] = result.count
    })

    const totalPermits = await TemporaryPermit.countDocuments()

    // Pending payment aggregation
    const pendingPaymentPipeline = [
      { $match: { balance: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$balance' }
        }
      }
    ]

    const pendingPaymentResults = await TemporaryPermit.aggregate(pendingPaymentPipeline)
    const pendingPaymentCount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].count : 0
    const pendingPaymentAmount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].totalAmount : 0

    // Count by vehicle type
    const cvPermits = await TemporaryPermit.countDocuments({ vehicleType: 'CV' })
    const pvPermits = await TemporaryPermit.countDocuments({ vehicleType: 'PV' })

    // Total fees collected
    const totalRevenue = await TemporaryPermit.aggregate([
      { $group: { _id: null, total: { $sum: '$totalFee' }, paid: { $sum: '$paid' }, balance: { $sum: '$balance' } } }
    ])

    res.status(200).json({
      success: true,
      data: {
        permits: {
          total: totalPermits,
          active: statusCounts.active,
          expiringSoon: statusCounts.expiring_soon,
          expired: statusCounts.expired
        },
        vehicleTypes: {
          cv: cvPermits,
          pv: pvPermits
        },
        revenue: {
          totalFee: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
          paid: totalRevenue.length > 0 ? totalRevenue[0].paid : 0,
          balance: totalRevenue.length > 0 ? totalRevenue[0].balance : 0
        },
        pendingPaymentCount,
        pendingPaymentAmount
      }
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Share permit via WhatsApp
exports.sharePermit = async (req, res) => {
  try {
    const { id } = req.params
    const { phoneNumber } = req.body

    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
        errors: ['Phone number is required'],
        errorCount: 1
      })
    }

    // Get permit details
    const permit = await TemporaryPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    // Generate WhatsApp message
    const message = generatePermitMessage(permit)

    // Format phone number for WhatsApp (add country code if not present)
    const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`

    res.status(200).json({
      success: true,
      message: 'WhatsApp share link generated successfully',
      data: {
        whatsappUrl,
        phoneNumber: formattedPhone,
        permitNumber: permit.permitNumber
      }
    })
  } catch (error) {
    console.error('Error sharing temporary permit:', error)
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Helper function to generate permit message
function generatePermitMessage(permit) {
  const vehicleTypeFull = permit.vehicleType === 'CV' ? 'Commercial Vehicle' : 'Passenger Vehicle'

  return `
*TEMPORARY PERMIT BILL*


*Permit Details:*
=� Permit Number: ${permit.permitNumber}
=d Permit Holder: ${permit.permitHolder}
=� Vehicle Number: ${permit.vehicleNumber}

*Vehicle Type:*
=� ${vehicleTypeFull} (${permit.vehicleType})

*Validity:*
=� Valid From: ${permit.validFrom}
=� Valid To: ${permit.validTo}
� Validity Period: ${permit.validityPeriod} months

*Purpose:*
=� ${permit.purpose || 'Temporary Use'}

*Fees:*
� Total Fee: ₹${permit.totalFee}
� Paid: ₹${permit.paid}
� Balance: ₹${permit.balance}


*Status:* ${permit.status}

Thank you for using our services!
`.trim()
}

// Generate or regenerate bill PDF for a permit
exports.generateBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await TemporaryPermit.findById(id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    let customBill = permit.bill

    // If bill doesn't exist, create it
    if (!customBill) {
      const billNumber = await generateCustomBillNumber(CustomBill)
      const vehicleTypeFull = permit.vehicleType === 'CV' ? 'Commercial Vehicle' : 'Passenger Vehicle'
      customBill = new CustomBill({
        billNumber,
        customerName: permit.permitHolder,
        billDate: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        items: [
          {
            description: `Temporary Permit (${vehicleTypeFull})\nPermit No: ${permit.permitNumber}\nVehicle No: ${permit.vehicleNumber}\nValid From: ${permit.validFrom}\nValid To: ${permit.validTo}\nPeriod: ${permit.validityPeriod} months`,
            quantity: 1,
            rate: permit.totalFee,
            amount: permit.totalFee
          }
        ],
        totalAmount: permit.totalFee
      })
      await customBill.save()

      permit.bill = customBill._id
      await permit.save()
    }

    // Generate or regenerate PDF
    const pdfPath = await generateCustomBillPDF(customBill)
    customBill.billPdfPath = pdfPath
    await customBill.save()

    res.status(200).json({
      success: true,
      message: 'Bill PDF generated successfully',
      data: {
        billNumber: customBill.billNumber,
        pdfPath: pdfPath,
        pdfUrl: `${req.protocol}://${req.get('host')}${pdfPath}`
      }
    })
  } catch (error) {
    console.error('Error generating bill PDF:', error)
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

// Download bill PDF
exports.downloadBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await TemporaryPermit.findById(id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    // Check if bill exists
    if (!permit.bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found. Please generate it first.'
      })
    }

    // Check if PDF exists
    if (!permit.bill.billPdfPath) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF not found. Please generate it first.'
      })
    }

    // Get absolute path to PDF
    const pdfPath = path.join(__dirname, '..', permit.bill.billPdfPath)

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF file not found on server'
      })
    }

    // Set headers for download
    const fileName = `${permit.bill.billNumber}_${permit.permitNumber}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    // Send file
    res.sendFile(pdfPath)
  } catch (error) {
    console.error('Error downloading bill PDF:', error)
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: getSimplifiedTimestamp()
    })
  }
}

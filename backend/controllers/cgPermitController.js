const CgPermit = require('../models/CgPermit')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const { logError, getUserFriendlyError, getSimplifiedTimestamp } = require('../utils/errorLogger')
const path = require('path')
const fs = require('fs')

// Create new CG permit
exports.createPermit = async (req, res) => {
  try {
    const permitData = req.body

    // Create new CG permit without bill reference first
    const newPermit = new CgPermit(permitData)
    await newPermit.save()

    // Create CustomBill document
    const billNumber = await generateCustomBillNumber(CustomBill)
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
          description: `CG Permit\nPermit No: ${newPermit.permitNumber}\nVehicle No: ${newPermit.vehicleNumber}\nValid From: ${newPermit.validFrom}\nValid To: ${newPermit.validTo}\nRoute: Chhattisgarh State`,
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
        console.log('Bill PDF generated successfully for CG permit:', newPermit.permitNumber)
      })
      .catch(pdfError => {
        console.error('Error generating PDF (non-critical):', pdfError)
        // Don't fail the permit creation if PDF generation fails
      })

    // Send response immediately without waiting for PDF
    res.status(201).json({
      success: true,
      message: 'CG permit created successfully. Bill is being generated in background.',
      data: newPermit
    })
  } catch (error) {
    console.error('Error creating CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
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

// Get all CG permits
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
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

      pipeline.push({ $match: matchConditions })

      // Stage 5: Lookup bill
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

      // Stage 6: Sort
      const sortOptions = {}
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1
      pipeline.push({ $sort: sortOptions })

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

      const results = await CgPermit.aggregate(pipeline)
      const total = results[0].metadata.length > 0 ? results[0].metadata[0].total : 0
      const permits = results[0].data

      res.json({
        success: true,
        data: permits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          hasMore: (parseInt(page) - 1) * parseInt(limit) + permits.length < total
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

      const skip = (parseInt(page) - 1) * parseInt(limit)

      // Sort options
      const sortOptions = {}
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

      // Execute query
      const permits = await CgPermit.find(query)
        .populate('bill')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))

      // Get total count for pagination
      const total = await CgPermit.countDocuments(query)

      res.json({
        success: true,
        data: permits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          hasMore: skip + permits.length < total
        }
      })
    }
  } catch (error) {
    console.error('Error fetching CG permits:', error)
    logError(error, req)
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

// Get single CG permit by ID
exports.getPermitById = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await CgPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    res.status(200).json({
      success: true,
      data: permit
    })
  } catch (error) {
    console.error('Error fetching CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
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

// Get CG permit by permit number
exports.getPermitByNumber = async (req, res) => {
  try {
    const { permitNumber } = req.params

    const permit = await CgPermit.findOne({ permitNumber })

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    res.status(200).json({
      success: true,
      data: permit
    })
  } catch (error) {
    console.error('Error fetching CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
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

// Update CG permit
exports.updatePermit = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updatedPermit = await CgPermit.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedPermit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'CG permit updated successfully',
      data: updatedPermit
    })
  } catch (error) {
    console.error('Error updating CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
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

// Delete CG permit
exports.deletePermit = async (req, res) => {
  try {
    const { id } = req.params

    const deletedPermit = await CgPermit.findByIdAndDelete(id)

    if (!deletedPermit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'CG permit deleted successfully',
      data: deletedPermit
    })
  } catch (error) {
    console.error('Error deleting CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
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

    const statusResults = await CgPermit.aggregate(statusPipeline)

    // Convert array to object for easy access
    const statusCounts = {
      active: 0,
      expired: 0,
      expiring_soon: 0
    }

    statusResults.forEach(result => {
      statusCounts[result._id] = result.count
    })

    const total = await CgPermit.countDocuments()

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

    const pendingPaymentResults = await CgPermit.aggregate(pendingPaymentPipeline)
    const pendingPaymentCount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].count : 0
    const pendingPaymentAmount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].totalAmount : 0

    res.json({
      success: true,
      data: {
        total,
        active: statusCounts.active,
        expired: statusCounts.expired,
        expiringSoon: statusCounts.expiring_soon,
        pendingPaymentCount,
        pendingPaymentAmount
      }
    })
  } catch (error) {
    console.error('Error fetching CG permit statistics:', error)
    logError(error, req)
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
    const permit = await CgPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
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
    console.error('Error sharing CG permit:', error)

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
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
  return `
*CG PERMIT BILL*
━━━━━━━━━━━━━━━━━━━━

*Permit Details:*
📋 Permit Number: ${permit.permitNumber}
📝 Permit Type: ${permit.permitType}
👤 Permit Holder: ${permit.permitHolder}
🚛 Vehicle Number: ${permit.vehicleNumber}

*Validity:*
📅 Valid From: ${permit.validFrom}
📅 Valid To: ${permit.validTo}
⏱️ Validity Period: ${permit.validityPeriod} years

*Fees:*
💰 Amount Paid: ₹${permit.fees}

━━━━━━━━━━━━━━━━━━━━
*Status:* ${permit.status}

Thank you for using our services!
`.trim()
}

// Generate or regenerate bill PDF for a permit
exports.generateBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await CgPermit.findById(id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    let customBill = permit.bill

    // If bill doesn't exist, create it
    if (!customBill) {
      const billNumber = await generateCustomBillNumber(CustomBill)
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
            description: `CG Permit\nPermit No: ${permit.permitNumber}\nVehicle No: ${permit.vehicleNumber}\nValid From: ${permit.validFrom}\nValid To: ${permit.validTo}\nRoute: Chhattisgarh State`,
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

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
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

    const permit = await CgPermit.findById(id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
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

    // Log error to file
    logError(error, req)

    // Get user-friendly error message
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

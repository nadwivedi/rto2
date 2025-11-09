const Fitness = require('../models/Fitness')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const path = require('path')
const fs = require('fs')

// helper function to calculate status
const getFitnessStatus = (validTo) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  thirtyDaysFromNow.setHours(23, 59, 59, 999);

  // a little utility function to parse dates consistently
  const parseDate = (dateString) => {
      const parts = dateString.split(/[-/]/);
      // new Date(year, monthIndex, day)
      return new Date(parts[2], parts[1] - 1, parts[0]);
  };

  const validToDate = parseDate(validTo);

  if (validToDate < today) {
    return 'expired';
  } else if (validToDate <= thirtyDaysFromNow) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
};


// Get all fitness records
exports.getAllFitness = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

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

      // Stage 5: Sort
      const sortOptions = {}
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1
      pipeline.push({ $sort: sortOptions })

      // Stage 6: Count total for pagination (use facet to get both data and count)
      pipeline.push({
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
          ]
        }
      })

      const results = await Fitness.aggregate(pipeline)
      const total = results[0].metadata.length > 0 ? results[0].metadata[0].total : 0
      const fitnessRecords = results[0].data

      res.json({
        success: true,
        data: fitnessRecords,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          hasMore: (parseInt(page) - 1) * parseInt(limit) + fitnessRecords.length < total
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
      const fitnessRecords = await Fitness.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))

      // Get total count for pagination
      const total = await Fitness.countDocuments(query)

      res.json({
        success: true,
        data: fitnessRecords,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          hasMore: skip + fitnessRecords.length < total
        }
      })
    }
  } catch (error) {
    console.error('Error fetching fitness records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching fitness records',
      error: error.message
    })
  }
}

// Get single fitness record by ID
exports.getFitnessById = async (req, res) => {
  try {
    const fitness = await Fitness.findById(req.params.id)

    if (!fitness) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      })
    }

    res.json({
      success: true,
      data: fitness
    })
  } catch (error) {
    console.error('Error fetching fitness record:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching fitness record',
      error: error.message
    })
  }
}

// Create new fitness record
exports.createFitness = async (req, res) => {
  try {
    const { vehicleNumber, validFrom, validTo, totalFee, paid, balance } = req.body

    // Validate required fields
    if (!vehicleNumber || !validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number, valid from, and valid to are required'
      })
    }

    // Calculate status
    const status = getFitnessStatus(validTo);

    // Create new fitness record without bill reference first
    const fitness = new Fitness({
      vehicleNumber,
      validFrom,
      validTo,
      totalFee: totalFee || 0,
      paid: paid || 0,
      balance: balance || 0,
      status
    })

    await fitness.save()

    // Create CustomBill document
    const billNumber = await generateCustomBillNumber(CustomBill)
    const customBill = new CustomBill({
      billNumber,
      customerName: `Vehicle: ${fitness.vehicleNumber}`,
      billDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      items: [
        {
          description: `Fitness Certificate\nVehicle No: ${fitness.vehicleNumber}\nValid From: ${fitness.validFrom}\nValid To: ${fitness.validTo}`,
          quantity: 1,
          rate: fitness.totalFee,
          amount: fitness.totalFee
        }
      ],
      totalAmount: fitness.totalFee
    })
    await customBill.save()

    // Update fitness with bill reference
    fitness.bill = customBill._id
    await fitness.save()

    // Fire PDF generation in background (don't wait for it)
    generateCustomBillPDF(customBill)
      .then(pdfPath => {
        customBill.billPdfPath = pdfPath
        return customBill.save()
      })
      .then(() => {
        console.log('Bill PDF generated successfully for fitness:', fitness.vehicleNumber)
      })
      .catch(pdfError => {
        console.error('Error generating PDF (non-critical):', pdfError)
        // Don't fail the fitness creation if PDF generation fails
      })

    // Send response immediately without waiting for PDF
    res.status(201).json({
      success: true,
      message: 'Fitness record created successfully. Bill is being generated in background.',
      data: fitness
    })
  } catch (error) {
    console.error('Error creating fitness record:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating fitness record',
      error: error.message
    })
  }
}

// Update fitness record
exports.updateFitness = async (req, res) => {
  try {
    const { vehicleNumber, validFrom, validTo, totalFee, paid, balance } = req.body

    const fitness = await Fitness.findById(req.params.id)

    if (!fitness) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      })
    }

    // Update fields
    if (vehicleNumber) fitness.vehicleNumber = vehicleNumber
    if (validFrom) fitness.validFrom = validFrom
    if (validTo) {
        fitness.validTo = validTo
        // Recalculate status if validTo is updated
        fitness.status = getFitnessStatus(validTo);
    }
    if (totalFee !== undefined) fitness.totalFee = totalFee
    if (paid !== undefined) fitness.paid = paid
    if (balance !== undefined) fitness.balance = balance

    await fitness.save()

    res.json({
      success: true,
      message: 'Fitness record updated successfully',
      data: fitness
    })
  } catch (error) {
    console.error('Error updating fitness record:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating fitness record',
      error: error.message
    })
  }
}

// Delete fitness record
exports.deleteFitness = async (req, res) => {
  try {
    const fitness = await Fitness.findById(req.params.id)

    if (!fitness) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      })
    }

    await fitness.deleteOne()

    res.json({
      success: true,
      message: 'Fitness record deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting fitness record:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting fitness record',
      error: error.message
    })
  }
}

// Get fitness statistics
exports.getFitnessStatistics = async (req, res) => {
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

    const statusResults = await Fitness.aggregate(statusPipeline)

    // Convert array to object for easy access
    const statusCounts = {
      active: 0,
      expired: 0,
      expiring_soon: 0
    }

    statusResults.forEach(result => {
      statusCounts[result._id] = result.count
    })

    const total = await Fitness.countDocuments()

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

    const pendingPaymentResults = await Fitness.aggregate(pendingPaymentPipeline)
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
    console.error('Error fetching fitness statistics:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching fitness statistics',
      error: error.message
    })
  }
}

// Generate or regenerate bill PDF for a fitness record
exports.generateBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const fitness = await Fitness.findById(id).populate('bill')
    if (!fitness) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      })
    }

    let customBill = fitness.bill

    // If bill doesn't exist, create it
    if (!customBill) {
      const billNumber = await generateCustomBillNumber(CustomBill)
      customBill = new CustomBill({
        billNumber,
        customerName: `Vehicle: ${fitness.vehicleNumber}`,
        billDate: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        items: [
          {
            description: `Fitness Certificate\nVehicle No: ${fitness.vehicleNumber}\nValid From: ${fitness.validFrom}\nValid To: ${fitness.validTo}`,
            quantity: 1,
            rate: fitness.totalFee,
            amount: fitness.totalFee
          }
        ],
        totalAmount: fitness.totalFee
      })
      await customBill.save()

      fitness.bill = customBill._id
      await fitness.save()
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
    res.status(500).json({
      success: false,
      message: 'Failed to generate bill PDF',
      error: error.message
    })
  }
}

// Download bill PDF
exports.downloadBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const fitness = await Fitness.findById(id).populate('bill')
    if (!fitness) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      })
    }

    // Check if bill exists
    if (!fitness.bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found. Please generate it first.'
      })
    }

    // Check if PDF exists
    if (!fitness.bill.billPdfPath) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF not found. Please generate it first.'
      })
    }

    // Get absolute path to PDF
    const pdfPath = path.join(__dirname, '..', fitness.bill.billPdfPath)

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF file not found on server'
      })
    }

    // Set headers for download
    const fileName = `${fitness.bill.billNumber}_${fitness.vehicleNumber}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    // Send file
    res.sendFile(pdfPath)
  } catch (error) {
    console.error('Error downloading bill PDF:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to download bill PDF',
      error: error.message
    })
  }
}

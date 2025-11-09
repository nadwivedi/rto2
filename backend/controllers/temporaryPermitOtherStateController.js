const TemporaryPermitOtherState = require('../models/TemporaryPermitOtherState')
const CustomBill = require('../models/CustomBill')
const { generateCustomBillPDF, generateCustomBillNumber } = require('../utils/customBillGenerator')
const { logError, getUserFriendlyError, getSimplifiedTimestamp } = require('../utils/errorLogger')

// Create new temporary permit (other state)
exports.createPermit = async (req, res) => {
  try {
    const permitData = req.body

    // Create new temporary permit without bill reference first
    const newPermit = new TemporaryPermitOtherState(permitData)
    await newPermit.save()

    // Create CustomBill document if there's payment
    if (newPermit.totalFee > 0) {
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
            description: `Temporary Permit (Other State)\nPermit No: ${newPermit.permitNumber}\nVehicle No: ${newPermit.vehicleNo}\nValid From: ${newPermit.validFrom}\nValid To: ${newPermit.validTo}`,
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
          console.log('Bill PDF generated successfully for temporary permit (other state):', newPermit.permitNumber)
        })
        .catch(pdfError => {
          console.error('Error generating PDF (non-critical):', pdfError)
        })
    }

    // Send response immediately without waiting for PDF
    res.status(201).json({
      success: true,
      message: 'Temporary permit (other state) created successfully.',
      data: newPermit
    })
  } catch (error) {
    console.error('Error creating temporary permit (other state):', error)
    logError(error, req)
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

// Get all temporary permits (other state)
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
                },
                { case: { $gt: ['$validToDateParsed', fifteenDaysFromNow] }, then: 'active' }
              ],
              default: 'active'
            }
          }
        }
      })

      // Stage 4: Match status
      pipeline.push({
        $match: { computedStatus: status }
      })

      // Stage 5: Add search filter if provided
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { permitNumber: { $regex: search, $options: 'i' } },
              { permitHolder: { $regex: search, $options: 'i' } },
              { vehicleNo: { $regex: search, $options: 'i' } },
              { mobileNo: { $regex: search, $options: 'i' } }
            ]
          }
        })
      }

      // Stage 6: Sort
      const sortField = sortBy || 'createdAt'
      const sortDirection = sortOrder === 'asc' ? 1 : -1
      pipeline.push({ $sort: { [sortField]: sortDirection } })

      // Stage 7: Count total
      pipeline.push({
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
          ]
        }
      })

      const result = await TemporaryPermitOtherState.aggregate(pipeline)
      const totalPermits = result[0]?.metadata[0]?.total || 0
      const permits = result[0]?.data || []

      res.json({
        success: true,
        data: permits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPermits / parseInt(limit)),
          totalItems: totalPermits,
          itemsPerPage: parseInt(limit)
        }
      })
    } else {
      // Use simple query for non-date-based filtering
      let query = {}

      // Search filter
      if (search) {
        query.$or = [
          { permitNumber: { $regex: search, $options: 'i' } },
          { permitHolder: { $regex: search, $options: 'i' } },
          { vehicleNo: { $regex: search, $options: 'i' } },
          { mobileNo: { $regex: search, $options: 'i' } }
        ]
      }

      // Pending payment filter
      if (status === 'pending') {
        query.balance = { $gt: 0 }
      }

      // Count total permits
      const totalPermits = await TemporaryPermitOtherState.countDocuments(query)

      // Get permits with pagination and sorting
      const sortField = sortBy || 'createdAt'
      const sortDirection = sortOrder === 'asc' ? 1 : -1

      const permits = await TemporaryPermitOtherState.find(query)
        .sort({ [sortField]: sortDirection })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('bill')

      res.json({
        success: true,
        data: permits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPermits / parseInt(limit)),
          totalItems: totalPermits,
          itemsPerPage: parseInt(limit)
        }
      })
    }
  } catch (error) {
    console.error('Error fetching temporary permits (other state):', error)
    logError(error, req)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temporary permits (other state)',
      error: error.message
    })
  }
}

// Get single permit by ID
exports.getPermitById = async (req, res) => {
  try {
    const permit = await TemporaryPermitOtherState.findById(req.params.id).populate('bill')
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit (other state) not found'
      })
    }
    res.json({ success: true, data: permit })
  } catch (error) {
    console.error('Error fetching temporary permit (other state):', error)
    logError(error, req)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temporary permit (other state)',
      error: error.message
    })
  }
}

// Update permit
exports.updatePermit = async (req, res) => {
  try {
    const updatedPermit = await TemporaryPermitOtherState.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!updatedPermit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit (other state) not found'
      })
    }

    res.json({
      success: true,
      message: 'Temporary permit (other state) updated successfully',
      data: updatedPermit
    })
  } catch (error) {
    console.error('Error updating temporary permit (other state):', error)
    logError(error, req)
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

// Delete permit
exports.deletePermit = async (req, res) => {
  try {
    const deletedPermit = await TemporaryPermitOtherState.findByIdAndDelete(req.params.id)

    if (!deletedPermit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit (other state) not found'
      })
    }

    res.json({
      success: true,
      message: 'Temporary permit (other state) deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting temporary permit (other state):', error)
    logError(error, req)
    res.status(500).json({
      success: false,
      message: 'Failed to delete temporary permit (other state)',
      error: error.message
    })
  }
}

// Get expiring soon count
exports.getExpiringSoonCount = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const fifteenDaysFromNow = new Date()
    fifteenDaysFromNow.setDate(today.getDate() + 15)
    fifteenDaysFromNow.setHours(23, 59, 59, 999)

    const pipeline = [
      {
        $addFields: {
          validToNormalized: {
            $replaceAll: { input: '$validTo', find: '-', replacement: '/' }
          }
        }
      },
      {
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
      },
      {
        $match: {
          $and: [
            { validToDateParsed: { $gte: today } },
            { validToDateParsed: { $lte: fifteenDaysFromNow } }
          ]
        }
      },
      { $count: 'count' }
    ]

    const result = await TemporaryPermitOtherState.aggregate(pipeline)
    const count = result[0]?.count || 0

    res.json({ success: true, count })
  } catch (error) {
    console.error('Error getting expiring soon count:', error)
    logError(error, req)
    res.status(500).json({
      success: false,
      message: 'Failed to get expiring soon count',
      error: error.message
    })
  }
}

const DealerBill = require('../models/DealerBill')
const { generateDealerBillPDF, generateDealerBillNumber } = require('../utils/dealerBillGenerator')
const path = require('path')
const fs = require('fs')

/**
 * Create a new dealer bill
 * POST /api/dealer-bills
 */
exports.createDealerBill = async (req, res) => {
  try {
    const { permit, fitness, registration, totalFees, notes } = req.body

    // Validation
    if (!permit || !permit.permitType) {
      return res.status(400).json({
        success: false,
        message: 'Permit information is required'
      })
    }

    // Validate National Permit fields
    if (permit.permitType === 'National Permit') {
      if (!permit.partANumber || !permit.partBNumber) {
        return res.status(400).json({
          success: false,
          message: 'Part A Number and Part B Number are required for National Permit'
        })
      }
    } else {
      // Validate other permit types
      if (!permit.permitNumber) {
        return res.status(400).json({
          success: false,
          message: 'Permit Number is required'
        })
      }
    }

    if (!fitness || !fitness.certificateNumber) {
      return res.status(400).json({
        success: false,
        message: 'Fitness certificate number is required'
      })
    }

    if (!registration || !registration.registrationNumber) {
      return res.status(400).json({
        success: false,
        message: 'Registration number is required'
      })
    }

    if (!totalFees || totalFees <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total fees must be greater than 0'
      })
    }

    // Generate bill number
    const billNumber = await generateDealerBillNumber(DealerBill)

    // Create dealer bill
    const dealerBill = new DealerBill({
      billNumber,
      permit,
      fitness,
      registration,
      totalFees,
      notes
    })

    await dealerBill.save()

    // Generate PDF in background (non-blocking)
    generateDealerBillPDF(dealerBill)
      .then(async (pdfPath) => {
        dealerBill.billPdfPath = pdfPath
        await dealerBill.save()
        console.log(`PDF generated successfully for dealer bill: ${billNumber}`)
      })
      .catch((error) => {
        console.error(`Error generating PDF for dealer bill ${billNumber}:`, error)
      })

    res.status(201).json({
      success: true,
      message: 'Dealer bill created successfully',
      data: dealerBill
    })
  } catch (error) {
    console.error('Error creating dealer bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create dealer bill',
      error: error.message
    })
  }
}

/**
 * Get all dealer bills with pagination, search, and filters
 * GET /api/dealer-bills
 */
exports.getAllDealerBills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      permitType,
      paymentStatus,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = {}

    // Search across multiple fields
    if (search) {
      query.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { 'permit.permitNumber': { $regex: search, $options: 'i' } },
        { 'permit.partANumber': { $regex: search, $options: 'i' } },
        { 'permit.partBNumber': { $regex: search, $options: 'i' } },
        { 'fitness.certificateNumber': { $regex: search, $options: 'i' } },
        { 'registration.registrationNumber': { $regex: search, $options: 'i' } }
      ]
    }

    // Filters
    if (permitType) {
      query['permit.permitType'] = permitType
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus
    }
    if (status) {
      query.status = status
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

    // Fetch dealer bills
    const dealerBills = await DealerBill.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    // Get total count for pagination
    const totalCount = await DealerBill.countDocuments(query)
    const totalPages = Math.ceil(totalCount / parseInt(limit))

    res.status(200).json({
      success: true,
      data: dealerBills,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching dealer bills:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dealer bills',
      error: error.message
    })
  }
}

/**
 * Get single dealer bill by ID
 * GET /api/dealer-bills/:id
 */
exports.getDealerBillById = async (req, res) => {
  try {
    const { id } = req.params

    const dealerBill = await DealerBill.findById(id)

    if (!dealerBill) {
      return res.status(404).json({
        success: false,
        message: 'Dealer bill not found'
      })
    }

    res.status(200).json({
      success: true,
      data: dealerBill
    })
  } catch (error) {
    console.error('Error fetching dealer bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dealer bill',
      error: error.message
    })
  }
}

/**
 * Update dealer bill
 * PUT /api/dealer-bills/:id
 */
exports.updateDealerBill = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const dealerBill = await DealerBill.findById(id)

    if (!dealerBill) {
      return res.status(404).json({
        success: false,
        message: 'Dealer bill not found'
      })
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        dealerBill[key] = updates[key]
      }
    })

    await dealerBill.save()

    // Regenerate PDF if critical fields changed
    const criticalFields = ['permit', 'fitness', 'registration', 'totalFees']
    const shouldRegeneratePDF = criticalFields.some(field => updates[field] !== undefined)

    if (shouldRegeneratePDF) {
      generateDealerBillPDF(dealerBill)
        .then(async (pdfPath) => {
          dealerBill.billPdfPath = pdfPath
          await dealerBill.save()
          console.log(`PDF regenerated for dealer bill: ${dealerBill.billNumber}`)
        })
        .catch((error) => {
          console.error(`Error regenerating PDF for dealer bill ${dealerBill.billNumber}:`, error)
        })
    }

    res.status(200).json({
      success: true,
      message: 'Dealer bill updated successfully',
      data: dealerBill
    })
  } catch (error) {
    console.error('Error updating dealer bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update dealer bill',
      error: error.message
    })
  }
}

/**
 * Delete dealer bill
 * DELETE /api/dealer-bills/:id
 */
exports.deleteDealerBill = async (req, res) => {
  try {
    const { id } = req.params

    const dealerBill = await DealerBill.findById(id)

    if (!dealerBill) {
      return res.status(404).json({
        success: false,
        message: 'Dealer bill not found'
      })
    }

    // Delete PDF file if exists
    if (dealerBill.billPdfPath) {
      const pdfPath = path.join(__dirname, '..', dealerBill.billPdfPath)
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath)
      }
    }

    await DealerBill.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: 'Dealer bill deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting dealer bill:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete dealer bill',
      error: error.message
    })
  }
}

/**
 * Generate/Regenerate PDF for dealer bill
 * POST /api/dealer-bills/:id/generate-bill-pdf
 */
exports.generateBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const dealerBill = await DealerBill.findById(id)

    if (!dealerBill) {
      return res.status(404).json({
        success: false,
        message: 'Dealer bill not found'
      })
    }

    // Generate PDF
    const pdfPath = await generateDealerBillPDF(dealerBill)
    dealerBill.billPdfPath = pdfPath
    await dealerBill.save()

    res.status(200).json({
      success: true,
      message: 'Bill PDF generated successfully',
      data: {
        billPdfPath: pdfPath
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

/**
 * Download dealer bill PDF
 * GET /api/dealer-bills/:id/download-bill-pdf
 */
exports.downloadBillPDF = async (req, res) => {
  try {
    const { id } = req.params

    const dealerBill = await DealerBill.findById(id)

    if (!dealerBill) {
      return res.status(404).json({
        success: false,
        message: 'Dealer bill not found'
      })
    }

    if (!dealerBill.billPdfPath) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF not found. Please generate the bill first.'
      })
    }

    const pdfPath = path.join(__dirname, '..', dealerBill.billPdfPath)

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill PDF file not found on server'
      })
    }

    res.download(pdfPath, `${dealerBill.billNumber}.pdf`)
  } catch (error) {
    console.error('Error downloading bill PDF:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to download bill PDF',
      error: error.message
    })
  }
}

/**
 * Update payment status
 * PATCH /api/dealer-bills/:id/payment-status
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { paymentStatus, paidAmount } = req.body

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Payment status is required'
      })
    }

    const dealerBill = await DealerBill.findById(id)

    if (!dealerBill) {
      return res.status(404).json({
        success: false,
        message: 'Dealer bill not found'
      })
    }

    dealerBill.paymentStatus = paymentStatus
    if (paidAmount !== undefined) {
      dealerBill.paidAmount = paidAmount
    }

    await dealerBill.save()

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: dealerBill
    })
  } catch (error) {
    console.error('Error updating payment status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    })
  }
}

/**
 * Get dealer bill statistics
 * GET /api/dealer-bills/statistics
 */
exports.getDealerBillStatistics = async (req, res) => {
  try {
    const totalBills = await DealerBill.countDocuments()
    const pendingPayments = await DealerBill.countDocuments({ paymentStatus: 'Pending' })
    const paidBills = await DealerBill.countDocuments({ paymentStatus: 'Paid' })
    const cancelledBills = await DealerBill.countDocuments({ paymentStatus: 'Cancelled' })

    // Calculate total revenue
    const revenueResult = await DealerBill.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalFees' } } }
    ])
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    // Calculate pending amount
    const pendingResult = await DealerBill.aggregate([
      { $match: { paymentStatus: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$balanceAmount' } } }
    ])
    const pendingAmount = pendingResult.length > 0 ? pendingResult[0].total : 0

    // Count by permit type
    const permitTypeStats = await DealerBill.aggregate([
      { $group: { _id: '$permit.permitType', count: { $sum: 1 } } }
    ])

    res.status(200).json({
      success: true,
      data: {
        totalBills,
        pendingPayments,
        paidBills,
        cancelledBills,
        totalRevenue,
        pendingAmount,
        permitTypeStats
      }
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    })
  }
}

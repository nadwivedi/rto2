const Tax = require('../models/Tax')
const VehicleRegistration = require('../models/VehicleRegistration')
const mongoose = require('mongoose')

// helper function to calculate status
const getTaxStatus = (taxTo) => {
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

  const taxToDate = parseDate(taxTo);

  if (taxToDate < today) {
    return 'expired';
  } else if (taxToDate <= thirtyDaysFromNow) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
};

// Get all tax records
exports.getAllTax = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const query = { userId: req.user.id }

    // Search by vehicle number
    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Sort options
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const taxRecords = await Tax.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    // Get total count for pagination
    const total = await Tax.countDocuments(query)

    res.json({
      success: true,
      data: taxRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + taxRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching tax records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching tax records',
      error: error.message
    })
  }
}

// Export all tax records without pagination
exports.exportAllTax = async (req, res) => {
  try {
    const taxRecords = await Tax.find({ userId: req.user.id })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: taxRecords,
      total: taxRecords.length
    })
  } catch (error) {
    console.error('Error exporting tax records:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export tax records',
      error: error.message
    })
  }
}

// Get single tax record by ID
exports.getTaxById = async (req, res) => {
  try {
    const tax = await Tax.findOne({ _id: req.params.id, userId: req.user.id })

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: 'Tax record not found'
      })
    }

    res.json({
      success: true,
      data: tax
    })
  } catch (error) {
    console.error('Error fetching tax record:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching tax record',
      error: error.message
    })
  }
}

// Create new tax record
exports.createTax = async (req, res) => {
  try {
    const { receiptNo, vehicleNumber, ownerName, mobileNumber, totalAmount, paidAmount, balanceAmount, taxAmount, taxFrom, taxTo, partyId: reqPartyId } = req.body

    // Validate required fields
    if (!vehicleNumber || !taxFrom || !taxTo) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number, tax from, and tax to are required'
      })
    }

    if(totalAmount === undefined || totalAmount === null || paidAmount === undefined || paidAmount === null || balanceAmount === undefined || balanceAmount === null){
      return res.status(400).json({success:false , message:'total amount, paid amount, and balance amount are required'})
    }

    // Validate that paid amount can't be greater than total amount
    if(paidAmount > totalAmount){
      return res.status(400).json({success:false , message:'paid amount cannot be greater than total amount'})
    }

    // Validate that balance amount can't be negative
    if(balanceAmount < 0){
      return res.status(400).json({success:false , message:'balance amount cannot be negative'})
    }

    // Calculate status
    const status = getTaxStatus(taxTo);

    // Use partyId from request body if provided, otherwise auto-fetch from vehicle registration
    let partyId = reqPartyId || null
    if (!partyId) {
      const vehicle = await VehicleRegistration.findOne({
        registrationNumber: vehicleNumber.toUpperCase().trim(),
        userId: req.user.id
      }).select('partyId')
      if (vehicle && vehicle.partyId) {
        partyId = vehicle.partyId
      }
    }

    // Mark any existing non-renewed tax records for this vehicle as expired and renewed
    await Tax.updateMany(
      {
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        userId: req.user.id,
        isRenewed: false
      },
      {
        $set: {
          status: 'expired',
          isRenewed: true
        }
      }
    )

    // Create new tax record
    const tax = new Tax({
      receiptNo,
      vehicleNumber,
      ownerName,
      mobileNumber,
      totalAmount,
      paidAmount,
      balanceAmount,
      taxAmount,
      taxFrom,
      taxTo,
      status,
      userId: req.user.id,
      partyId
    })

    await tax.save()

    res.status(201).json({
      success: true,
      message: 'Tax record created successfully',
      data: tax
    })
  } catch (error) {
    console.error('Error creating tax record:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating tax record',
      error: error.message
    })
  }
}

// Update tax record
exports.updateTax = async (req, res) => {
  try {
    const { receiptNo, vehicleNumber, ownerName, mobileNumber, totalAmount, paidAmount, balanceAmount, taxAmount, taxFrom, taxTo, partyId } = req.body

    const tax = await Tax.findOne({ _id: req.params.id, userId: req.user.id })

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: 'Tax record not found'
      })
    }

    // Prepare updated values for validation
    const updatedTotalAmount = totalAmount !== undefined ? totalAmount : tax.totalAmount
    const updatedPaidAmount = paidAmount !== undefined ? paidAmount : tax.paidAmount
    const updatedBalanceAmount = balanceAmount !== undefined ? balanceAmount : tax.balanceAmount

    // Validate that paid amount can't be greater than total amount
    if (updatedPaidAmount > updatedTotalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Paid amount cannot be greater than total amount'
      })
    }

    // Validate that balance amount can't be negative
    if (updatedBalanceAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Balance amount cannot be negative'
      })
    }

    // Update fields
    if (receiptNo) tax.receiptNo = receiptNo
    if (vehicleNumber) tax.vehicleNumber = vehicleNumber
    if (ownerName !== undefined) tax.ownerName = ownerName
    if (mobileNumber !== undefined) tax.mobileNumber = mobileNumber
    if (taxFrom) tax.taxFrom = taxFrom
    if (taxTo) {
        tax.taxTo = taxTo
        // Recalculate status if taxTo is updated
        tax.status = getTaxStatus(taxTo);
    }
    if (totalAmount !== undefined) tax.totalAmount = totalAmount
    if (paidAmount !== undefined) tax.paidAmount = paidAmount
    if (balanceAmount !== undefined) tax.balanceAmount = balanceAmount
    if (taxAmount !== undefined) tax.taxAmount = taxAmount
    if (partyId !== undefined) tax.partyId = partyId

    await tax.save()

    res.json({
      success: true,
      message: 'Tax record updated successfully',
      data: tax
    })
  } catch (error) {
    console.error('Error updating tax record:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating tax record',
      error: error.message
    })
  }
}

// Delete tax record
exports.deleteTax = async (req, res) => {
  try {
    const tax = await Tax.findOne({ _id: req.params.id, userId: req.user.id })

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: 'Tax record not found'
      })
    }

    await tax.deleteOne()

    res.json({
      success: true,
      message: 'Tax record deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting tax record:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting tax record',
      error: error.message
    })
  }
}

// Get tax statistics
exports.getTaxStatistics = async (req, res) => {
  try {
    // Count permits by status (now using the indexed status field)
    const activeTax = await Tax.countDocuments({ status: 'active', userId: req.user.id })

    // For expiring soon and expired, exclude vehicles that also have active tax (renewed vehicles)
    const vehiclesWithActiveTax = await Tax.find({ status: 'active', userId: req.user.id })
      .distinct('vehicleNumber')

    const expiringSoonTax = await Tax.countDocuments({
      status: 'expiring_soon',
      vehicleNumber: { $nin: vehiclesWithActiveTax },
      userId: req.user.id
    })

    const expiredTax = await Tax.countDocuments({
      status: 'expired',
      vehicleNumber: { $nin: vehiclesWithActiveTax },
      userId: req.user.id
    })

    const total = await Tax.countDocuments({ userId: req.user.id })

    // Pending payment aggregation
    const pendingPaymentPipeline = [
      { $match: { balanceAmount: { $gt: 0 }, userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$balanceAmount' }
        }
      }
    ]

    const pendingPaymentResults = await Tax.aggregate(pendingPaymentPipeline)
    const pendingPaymentCount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].count : 0
    const pendingPaymentAmount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].totalAmount : 0

    res.json({
      success: true,
      data: {
        total,
        active: activeTax,
        expired: expiredTax,
        expiringSoon: expiringSoonTax,
        pendingPaymentCount,
        pendingPaymentAmount
      }
    })
  } catch (error) {
    console.error('Error fetching tax statistics:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching tax statistics',
      error: error.message
    })
  }
}

// Get expiring soon tax records
exports.getExpiringSoonTaxes = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'taxTo', sortOrder = 'asc' } = req.query

    // Find all vehicle numbers that have active tax
    // These vehicles have been renewed and should be excluded
    const vehiclesWithActiveTax = await Tax.find({ status: 'active', userId: req.user.id })
      .distinct('vehicleNumber')

    const query = {
      status: 'expiring_soon',
      vehicleNumber: { $nin: vehiclesWithActiveTax },
      userId: req.user.id
    }

    if (search) {
      // Update the vehicleNumber condition to work with search
      query.$and = [
        { vehicleNumber: { $nin: vehiclesWithActiveTax } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ]
      delete query.vehicleNumber
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const taxRecords = await Tax.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Tax.countDocuments(query)

    res.json({
      success: true,
      data: taxRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + taxRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching expiring soon tax records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring soon tax records',
      error: error.message
    })
  }
};

// Get expired tax records
exports.getExpiredTaxes = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'taxTo', sortOrder = 'desc' } = req.query

    // Find all vehicle numbers that have active tax
    // These vehicles have been renewed and should be excluded
    const vehiclesWithActiveTax = await Tax.find({ status: 'active', userId: req.user.id })
      .distinct('vehicleNumber')

    const query = {
      status: 'expired',
      vehicleNumber: { $nin: vehiclesWithActiveTax },
      userId: req.user.id
    }

    if (search) {
      // Update the vehicleNumber condition to work with search
      query.$and = [
        { vehicleNumber: { $nin: vehiclesWithActiveTax } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ]
      delete query.vehicleNumber
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const taxRecords = await Tax.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Tax.countDocuments(query)

    res.json({
      success: true,
      data: taxRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + taxRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching expired tax records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expired tax records',
      error: error.message
    })
  }
};

// Get pending payment tax records
exports.getPendingPaymentTaxes = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const query = { balanceAmount: { $gt: 0 }, userId: req.user.id }

    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const taxRecords = await Tax.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Tax.countDocuments(query)

    res.json({
      success: true,
      data: taxRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + taxRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching pending payment tax records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching pending payment tax records',
      error: error.message
    })
  }
};


// Mark tax as paid
exports.markAsPaid = async (req, res) => {
  try {
    const tax = await Tax.findOne({ _id: req.params.id, userId: req.user.id })

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: 'Tax record not found'
      })
    }

    // Check if there's a balance to pay
    if (!tax.balanceAmount || tax.balanceAmount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending payment for this tax record'
      })
    }

    // Update payment details
    tax.paidAmount = tax.totalAmount || 0
    tax.balanceAmount = 0

    await tax.save()

    res.status(200).json({
      success: true,
      message: 'Payment marked as paid successfully',
      data: tax
    })
  } catch (error) {
    console.error('Error marking payment as paid:', error)
    res.status(500).json({
      success: false,
      message: 'Error marking payment as paid',
      error: error.message
    })
  }
};

// Increment WhatsApp message count
exports.incrementWhatsAppCount = async (req, res) => {
  try {
    const tax = await Tax.findOne({ _id: req.params.id, userId: req.user.id })

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: 'Tax record not found'
      })
    }

    // Increment the WhatsApp message count
    tax.whatsappMessageCount = (tax.whatsappMessageCount || 0) + 1
    tax.lastWhatsappSentAt = new Date()

    await tax.save()

    res.status(200).json({
      success: true,
      message: 'WhatsApp message count updated successfully',
      data: {
        whatsappMessageCount: tax.whatsappMessageCount,
        lastWhatsappSentAt: tax.lastWhatsappSentAt
      }
    })
  } catch (error) {
    console.error('Error incrementing WhatsApp count:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating WhatsApp message count',
      error: error.message
    })
  }
};

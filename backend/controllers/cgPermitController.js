const CgPermit = require('../models/CgPermit')

// Create new CG permit
exports.createPermit = async (req, res) => {
  try {
    const permitData = req.body

    // Create new CG permit
    const newPermit = new CgPermit(permitData)
    await newPermit.save()

    res.status(201).json({
      success: true,
      message: 'CG permit created successfully',
      data: newPermit
    })
  } catch (error) {
    console.error('Error creating CG permit:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to create CG permit',
      error: error.message
    })
  }
}

// Get all CG permits
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = {}

    // Search by permit number, permit holder, vehicle number
    if (search) {
      query.$or = [
        { permitNumber: { $regex: search, $options: 'i' } },
        { permitHolder: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ]
    }

    // Filter by status
    if (status) {
      query.status = status
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const permits = await CgPermit.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await CgPermit.countDocuments(query)

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
  } catch (error) {
    console.error('Error fetching CG permits:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CG permits',
      error: error.message
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CG permit',
      error: error.message
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CG permit',
      error: error.message
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
    res.status(400).json({
      success: false,
      message: 'Failed to update CG permit',
      error: error.message
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
    res.status(500).json({
      success: false,
      message: 'Failed to delete CG permit',
      error: error.message
    })
  }
}

// Update permit status
exports.updatePermitStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const permit = await CgPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    permit.status = status
    if (notes) {
      permit.notes = notes
    }

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'CG permit status updated successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error updating CG permit status:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to update CG permit status',
      error: error.message
    })
  }
}

// Add renewal entry to permit
exports.addRenewal = async (req, res) => {
  try {
    const { id } = req.params
    const { date, amount, status } = req.body

    const permit = await CgPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    permit.renewalHistory.push({
      date,
      amount,
      status: status || 'Completed'
    })

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'Renewal added successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error adding renewal:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to add renewal',
      error: error.message
    })
  }
}

// Update insurance details
exports.updateInsurance = async (req, res) => {
  try {
    const { id } = req.params
    const { policyNumber, company, validUpto } = req.body

    const permit = await CgPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    permit.insuranceDetails = {
      policyNumber: policyNumber || permit.insuranceDetails.policyNumber,
      company: company || permit.insuranceDetails.company,
      validUpto: validUpto || permit.insuranceDetails.validUpto
    }

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'Insurance details updated successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error updating insurance:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to update insurance details',
      error: error.message
    })
  }
}

// Update tax details
exports.updateTax = async (req, res) => {
  try {
    const { id } = req.params
    const { taxPaidUpto, taxAmount } = req.body

    const permit = await CgPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'CG permit not found'
      })
    }

    permit.taxDetails = {
      taxPaidUpto: taxPaidUpto || permit.taxDetails.taxPaidUpto,
      taxAmount: taxAmount || permit.taxDetails.taxAmount
    }

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'Tax details updated successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error updating tax details:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to update tax details',
      error: error.message
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalPermits = await CgPermit.countDocuments()
    const activePermits = await CgPermit.countDocuments({ status: 'Active' })
    const expiringSoonPermits = await CgPermit.countDocuments({ status: 'Expiring Soon' })
    const pendingRenewalPermits = await CgPermit.countDocuments({ status: 'Pending Renewal' })
    const expiredPermits = await CgPermit.countDocuments({ status: 'Expired' })
    const suspendedPermits = await CgPermit.countDocuments({ status: 'Suspended' })

    // Total fees collected
    const totalRevenue = await CgPermit.aggregate([
      { $group: { _id: null, total: { $sum: '$fees' } } }
    ])

    res.status(200).json({
      success: true,
      data: {
        permits: {
          total: totalPermits,
          active: activePermits,
          expiringSoon: expiringSoonPermits,
          pendingRenewal: pendingRenewalPermits,
          expired: expiredPermits,
          suspended: suspendedPermits
        },
        revenue: {
          total: totalRevenue.length > 0 ? totalRevenue[0].total : 0
        }
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

// Get expiring permits (within specified days)
exports.getExpiringPermits = async (req, res) => {
  try {
    const { days = 30 } = req.query

    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + parseInt(days))

    const expiringPermits = await CgPermit.find({
      status: { $in: ['Active', 'Expiring Soon'] }
    })

    // Filter permits that are expiring within the specified days
    const filteredPermits = expiringPermits.filter(permit => {
      const validToDate = new Date(permit.validTo)
      return validToDate >= today && validToDate <= futureDate
    })

    res.status(200).json({
      success: true,
      data: filteredPermits,
      count: filteredPermits.length
    })
  } catch (error) {
    console.error('Error fetching expiring permits:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring permits',
      error: error.message
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
        message: 'Phone number is required'
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
    res.status(500).json({
      success: false,
      message: 'Failed to share CG permit',
      error: error.message
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
🛣️ Route: ${permit.route}

*Vehicle Information:*
🚗 Vehicle Type: ${permit.vehicleType || 'N/A'}
🏭 Model: ${permit.vehicleModel || 'N/A'}
⚙️ Engine No: ${permit.engineNumber || 'N/A'}
🔢 Chassis No: ${permit.chassisNumber || 'N/A'}

*Goods Type:*
📦 ${permit.goodsType || 'General Goods'}

*Fees:*
💰 Amount Paid: ₹${permit.fees}

━━━━━━━━━━━━━━━━━━━━
*Status:* ${permit.status}
📍 Issuing Authority: ${permit.issuingAuthority}

Thank you for using our services!
`.trim()
}

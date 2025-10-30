const TemporaryPermit = require('../models/TemporaryPermit')

// Create new temporary permit
exports.createPermit = async (req, res) => {
  try {
    const permitData = req.body

    // Create new temporary permit
    const newPermit = new TemporaryPermit(permitData)
    await newPermit.save()

    res.status(201).json({
      success: true,
      message: 'Temporary permit created successfully',
      data: newPermit
    })
  } catch (error) {
    console.error('Error creating temporary permit:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to create temporary permit',
      error: error.message
    })
  }
}

// Get all temporary permits
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      vehicleType,
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

    // Filter by vehicle type
    if (vehicleType) {
      query.vehicleType = vehicleType.toUpperCase()
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const permits = await TemporaryPermit.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

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
  } catch (error) {
    console.error('Error fetching temporary permits:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temporary permits',
      error: error.message
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temporary permit',
      error: error.message
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temporary permit',
      error: error.message
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
    res.status(400).json({
      success: false,
      message: 'Failed to update temporary permit',
      error: error.message
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
    res.status(500).json({
      success: false,
      message: 'Failed to delete temporary permit',
      error: error.message
    })
  }
}

// Update permit status
exports.updatePermitStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const permit = await TemporaryPermit.findById(id)

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    permit.status = status
    if (notes) {
      permit.notes = notes
    }

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'Temporary permit status updated successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error updating temporary permit status:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to update temporary permit status',
      error: error.message
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalPermits = await TemporaryPermit.countDocuments()
    const activePermits = await TemporaryPermit.countDocuments({ status: 'Active' })
    const expiringSoonPermits = await TemporaryPermit.countDocuments({ status: 'Expiring Soon' })
    const expiredPermits = await TemporaryPermit.countDocuments({ status: 'Expired' })
    const cancelledPermits = await TemporaryPermit.countDocuments({ status: 'Cancelled' })

    // Count by vehicle type
    const cvPermits = await TemporaryPermit.countDocuments({ vehicleType: 'CV' })
    const pvPermits = await TemporaryPermit.countDocuments({ vehicleType: 'PV' })

    // Total fees collected
    const totalRevenue = await TemporaryPermit.aggregate([
      { $group: { _id: null, total: { $sum: '$fees' } } }
    ])

    res.status(200).json({
      success: true,
      data: {
        permits: {
          total: totalPermits,
          active: activePermits,
          expiringSoon: expiringSoonPermits,
          expired: expiredPermits,
          cancelled: cancelledPermits
        },
        vehicleTypes: {
          cv: cvPermits,
          pv: pvPermits
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
    const { days = 7 } = req.query

    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + parseInt(days))

    const expiringPermits = await TemporaryPermit.find({
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
    res.status(500).json({
      success: false,
      message: 'Failed to share temporary permit',
      error: error.message
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
=Ë Permit Number: ${permit.permitNumber}
=d Permit Holder: ${permit.permitHolder}
=› Vehicle Number: ${permit.vehicleNumber}

*Vehicle Type:*
=— ${vehicleTypeFull} (${permit.vehicleType})

*Validity:*
=Å Valid From: ${permit.validFrom}
=Å Valid To: ${permit.validTo}
ñ Validity Period: ${permit.validityPeriod} months

*Purpose:*
=Ì ${permit.purpose || 'Temporary Use'}

*Fees:*
=° Amount Paid: ¹${permit.fees}


*Status:* ${permit.status}

Thank you for using our services!
`.trim()
}

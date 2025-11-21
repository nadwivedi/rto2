const NationalPermitPartA = require('../models/NationalPermitPartA')
const NationalPermitPartB = require('../models/NationalPermitPartB')

// Helper function to parse date from string (DD-MM-YYYY or DD/MM/YYYY format)
function parsePermitDate(dateString) {
  if (!dateString) return null

  // Handle both DD-MM-YYYY and DD/MM/YYYY formats
  const parts = dateString.split(/[-/]/)
  if (parts.length !== 3) return null

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed in JS
  const year = parseInt(parts[2], 10)

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null

  return new Date(year, month, day)
}

// Create new national permit (Part A + Part B together with combined bill)
exports.createPermit = async (req, res) => {
  try {
    const {
      vehicleNumber,
      permitNumber,
      permitHolder,
      fatherName,
      address,
      mobileNumber,
      email,
      partAValidFrom,
      partAValidTo,
      partBNumber,
      partBValidFrom,
      partBValidTo,
      totalFee,
      paid,
      balance,
      partAImage,
      partBImage,
      notes
    } = req.body

    // Validate required fields
    if (!vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number is required'
      })
    }

    if (!permitNumber) {
      return res.status(400).json({
        success: false,
        message: 'Permit number is required'
      })
    }

    if (!permitHolder) {
      return res.status(400).json({
        success: false,
        message: 'Permit holder name is required'
      })
    }

    if (!partAValidFrom || !partAValidTo) {
      return res.status(400).json({
        success: false,
        message: 'Part A valid from and valid to dates are required'
      })
    }

    if (!partBNumber) {
      return res.status(400).json({
        success: false,
        message: 'Part B number is required'
      })
    }

    if (!partBValidFrom || !partBValidTo) {
      return res.status(400).json({
        success: false,
        message: 'Part B valid from and valid to dates are required'
      })
    }

    // Validate payment fields
    if (totalFee === undefined || totalFee === null || paid === undefined || paid === null || balance === undefined || balance === null) {
      return res.status(400).json({
        success: false,
        message: 'Total fee, paid amount, and balance are required'
      })
    }

    // Validate that paid amount can't be greater than total fee
    if (paid > totalFee) {
      return res.status(400).json({
        success: false,
        message: 'Paid amount cannot be greater than total fee'
      })
    }

    // Validate that balance amount can't be negative
    if (balance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Balance amount cannot be negative'
      })
    }

    // Create Part A
    const newPartA = new NationalPermitPartA({
      vehicleNumber,
      permitNumber,
      permitHolder,
      fatherName,
      address,
      mobileNumber,
      email,
      validFrom: partAValidFrom,
      validTo: partAValidTo,
      totalFee,
      paid,
      balance,
      documents: {
        partAImage: partAImage || ''
      },
      notes: notes || '',
      userId: req.user.id
    })
    await newPartA.save()

    // Create Part B
    const newPartB = new NationalPermitPartB({
      vehicleNumber,
      permitNumber,
      partBNumber,
      permitHolder,
      validFrom: partBValidFrom,
      validTo: partBValidTo,
      documents: {
        partBImage: partBImage || ''
      },
      userId: req.user.id
    })
    await newPartB.save()

    res.status(201).json({
      success: true,
      message: 'National permit created successfully',
      data: {
        partA: newPartA,
        partB: newPartB
      }
    })
  } catch (error) {
    console.error('Error creating permit:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to create permit',
      error: error.message
    })
  }
}

// Get all national permits (returns combined Part A and Part B data)
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      dateFilter,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = { userId: req.user.id }

    // Search by permit number, permit holder, vehicle number
    if (search) {
      query.$or = [
        { permitNumber: { $regex: search, $options: 'i' } },
        { permitHolder: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ]
    }

    // Filter by status or pending payment
    if (status) {
      if (status === 'pending') {
        query.balance = { $gt: 0 }
      } else {
        query.status = status
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query to get all Part A records
    let partARecords = await NationalPermitPartA.find(query)
      .sort(sortOptions)

    // Apply date filtering if specified
    if (dateFilter) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      partARecords = partARecords.filter(partA => {
        const validToDate = parsePermitDate(partA.validTo)
        if (!validToDate) return false

        const diffTime = validToDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        switch (dateFilter) {
          case 'Expiring30Days':
            return diffDays >= 0 && diffDays <= 30
          case 'Expiring60Days':
            return diffDays >= 0 && diffDays <= 60
          case 'Expired':
            return diffDays < 0
          default:
            return true
        }
      })
    }

    // For each Part A, get the active Part B
    const permits = await Promise.all(
      partARecords.map(async (partA) => {
        const activePartB = await NationalPermitPartB.findOne({
          userId: req.user.id,
          vehicleNumber: partA.vehicleNumber,
          permitNumber: partA.permitNumber,
          status: 'active'
        })
        .sort({ createdAt: -1 })

        return {
          _id: partA._id,
          partA: partA,
          partB: activePartB,
          vehicleNumber: partA.vehicleNumber,
          permitNumber: partA.permitNumber,
          permitHolder: partA.permitHolder,
          createdAt: partA.createdAt
        }
      })
    )

    // Apply pagination after filtering
    const total = permits.length
    const paginatedPermits = permits.slice(skip, skip + parseInt(limit))

    res.status(200).json({
      success: true,
      data: paginatedPermits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching permits:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permits',
      error: error.message
    })
  }
}

// Export all national permits without pagination (for data export functionality)
exports.exportAllPermits = async (req, res) => {
  try {
    // Execute query to get all Part A records without pagination
    const partARecords = await NationalPermitPartA.find({ userId: req.user.id })
      .sort({ createdAt: -1 })

    // For each Part A, get the active Part B
    const permits = await Promise.all(
      partARecords.map(async (partA) => {
        const activePartB = await NationalPermitPartB.findOne({
          userId: req.user.id,
          vehicleNumber: partA.vehicleNumber,
          permitNumber: partA.permitNumber,
          status: 'active'
        })
        .sort({ createdAt: -1 })

        return {
          _id: partA._id,
          vehicleNumber: partA.vehicleNumber,
          permitNumber: partA.permitNumber,
          permitHolder: partA.permitHolder,
          fatherName: partA.fatherName,
          address: partA.address,
          mobileNumber: partA.mobileNumber,
          email: partA.email,
          partAValidFrom: partA.validFrom,
          partAValidTo: partA.validTo,
          partAImage: partA.partAImage,
          partBNumber: activePartB?.number || '',
          partBValidFrom: activePartB?.validFrom || '',
          partBValidTo: activePartB?.validTo || '',
          partBImage: activePartB?.partBImage || '',
          totalFee: partA.totalFee,
          paid: partA.paid,
          balance: partA.balance,
          status: partA.status,
          notes: partA.notes,
          createdAt: partA.createdAt,
          updatedAt: partA.updatedAt
        }
      })
    )

    res.status(200).json({
      success: true,
      data: permits,
      total: permits.length
    })
  } catch (error) {
    console.error('Error exporting permits:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export permits',
      error: error.message
    })
  }
}

// Delete national permit (deletes all Part A and Part B records and bills)
exports.deletePermit = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Permit ID is required'
      })
    }

    // Find the Part A record to get vehicle number and permit number
    const partA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })

    if (!partA) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    const { vehicleNumber, permitNumber } = partA

    // Find all Part A records
    const partARecords = await NationalPermitPartA.find({ vehicleNumber, permitNumber, userId: req.user.id })

    // Find all Part B records
    const partBRecords = await NationalPermitPartB.find({ vehicleNumber, permitNumber, userId: req.user.id })

    // Delete all Part A records
    await NationalPermitPartA.deleteMany({ vehicleNumber, permitNumber, userId: req.user.id })

    // Delete all Part B records
    await NationalPermitPartB.deleteMany({ vehicleNumber, permitNumber, userId: req.user.id })

    res.status(200).json({
      success: true,
      message: 'Permit and all associated records deleted successfully',
      data: {
        permitNumber,
        vehicleNumber,
        partADeleted: partARecords.length,
        partBDeleted: partBRecords.length
      }
    })
  } catch (error) {
    console.error('Error deleting permit:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete permit',
      error: error.message
    })
  }
}

// Renew Part A (creates new Part A document)
exports.renewPartA = async (req, res) => {
  try {
    const { id } = req.params
    const {
      validFrom,
      validTo,
      totalFee,
      paid,
      balance,
      notes,
      partBNumber,
      partBValidFrom,
      partBValidTo
    } = req.body

    // Validate required fields
    if (!validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: 'Valid From and Valid To dates are required'
      })
    }

    if (totalFee === undefined || paid === undefined || balance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Total fee, paid, and balance are required'
      })
    }

    // Get the original Part A for reference
    const originalPartA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })

    if (!originalPartA) {
      return res.status(404).json({
        success: false,
        message: 'Original permit not found'
      })
    }

    const { vehicleNumber, permitNumber } = originalPartA

    // Mark old Part A as expired
    await NationalPermitPartA.updateMany(
      { vehicleNumber, permitNumber, status: 'active' },
      { status: 'expired' }
    )

    // Check if there's an active Part B
    const activePartB = await NationalPermitPartB.findOne({
      vehicleNumber,
      permitNumber,
      status: 'active'
    }).sort({ createdAt: -1 })

    let newPartB = null

    if (!activePartB) {
      // Scenario 2: No active Part B - Create Part A + Part B together
      console.log('No active Part B, creating Part A + Part B')

      if (!partBNumber || !partBValidFrom || !partBValidTo) {
        return res.status(400).json({
          success: false,
          message: 'Part B details (partBNumber, partBValidFrom, partBValidTo) are required when no active Part B exists'
        })
      }
    }

    // Create new Part A
    const newPartA = new NationalPermitPartA({
      vehicleNumber,
      permitNumber,
      permitHolder: originalPartA.permitHolder,
      fatherName: originalPartA.fatherName,
      address: originalPartA.address,
      mobileNumber: originalPartA.mobileNumber,
      email: originalPartA.email,
      validFrom,
      validTo,
      totalFee,
      paid,
      balance,
      status: 'active',
      notes: notes || 'Part A renewal'
    })
    await newPartA.save()

    // Create new Part B ONLY if no active Part B exists
    if (!activePartB) {
      // Mark old Part B as expired if exists
      await NationalPermitPartB.updateMany(
        { vehicleNumber, permitNumber, status: 'active' },
        { status: 'expired' }
      )

      newPartB = new NationalPermitPartB({
        vehicleNumber,
        permitNumber,
        partBNumber,
        permitHolder: originalPartA.permitHolder,
        validFrom: partBValidFrom,
        validTo: partBValidTo,
        status: 'active'
      })
      await newPartB.save()
    }

    res.status(200).json({
      success: true,
      message: activePartB
        ? 'Part A renewed successfully. Active Part B continues.'
        : 'Part A renewed successfully with new Part B',
      data: {
        partA: newPartA,
        partB: newPartB || activePartB,
        usedExistingPartB: !!activePartB
      }
    })
  } catch (error) {
    console.error('Error renewing Part A:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to renew Part A',
      error: error.message
    })
  }
}

// Renew Part B (creates new Part B document with its own bill)
exports.renewPartB = async (req, res) => {
  try {
    const { id } = req.params
    const {
      partBNumber,
      validFrom,
      validTo,
      totalFee = 5000,
      paid,
      balance,
      notes
    } = req.body

    // Validate required fields
    if (!partBNumber) {
      return res.status(400).json({
        success: false,
        message: 'Part B number is required'
      })
    }

    if (!validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: 'Valid From and Valid To dates are required'
      })
    }

    if (paid === undefined || balance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Paid and balance are required'
      })
    }

    // Get the original Part A for reference
    const originalPartA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })

    if (!originalPartA) {
      return res.status(404).json({
        success: false,
        message: 'Original permit not found'
      })
    }

    const { vehicleNumber, permitNumber } = originalPartA

    // Mark old Part B as expired
    await NationalPermitPartB.updateMany(
      { vehicleNumber, permitNumber, status: 'active' },
      { status: 'expired' }
    )

    // Create new Part B
    const newPartB = new NationalPermitPartB({
      vehicleNumber,
      permitNumber,
      partBNumber,
      permitHolder: originalPartA.permitHolder,
      validFrom,
      validTo,
      totalFee,
      paid,
      balance,
      status: 'active',
      notes: notes || 'Part B renewal'
    })
    await newPartB.save()

    res.status(200).json({
      success: true,
      message: 'Part B renewed successfully',
      data: {
        partB: newPartB
      }
    })
  } catch (error) {
    console.error('Error renewing Part B:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to renew Part B',
      error: error.message
    })
  }
}

// Get Part A expiring soon
exports.getPartAExpiringSoon = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active Part A records for the logged-in user
    const allPartA = await NationalPermitPartA.find({ status: 'active', userId: req.user.id })

    // Filter Part A expiring in next 30 days
    const expiringPartA = allPartA.filter(partA => {
      const validToDate = parsePermitDate(partA.validTo)
      if (!validToDate) return false

      const diffTime = validToDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return diffDays >= 0 && diffDays <= 30
    })

    // Sort by expiry date
    expiringPartA.sort((a, b) => {
      const dateA = parsePermitDate(a.validTo)
      const dateB = parsePermitDate(b.validTo)
      return dateA - dateB
    })

    // Apply pagination
    const total = expiringPartA.length
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const paginatedPartA = expiringPartA.slice(skip, skip + parseInt(limit))

    res.status(200).json({
      success: true,
      data: paginatedPartA,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching Part A expiring soon:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Part A expiring soon',
      error: error.message
    })
  }
}

// Get Part B expiring soon
exports.getPartBExpiringSoon = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active Part B records for the logged-in user
    const allPartB = await NationalPermitPartB.find({ status: 'active', userId: req.user.id })

    // Filter Part B expiring in next 30 days
    const expiringPartB = allPartB.filter(partB => {
      const validToDate = parsePermitDate(partB.validTo)
      if (!validToDate) return false

      const diffTime = validToDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return diffDays >= 0 && diffDays <= 30
    })

    // Sort by expiry date
    expiringPartB.sort((a, b) => {
      const dateA = parsePermitDate(a.validTo)
      const dateB = parsePermitDate(b.validTo)
      return dateA - dateB
    })

    // Apply pagination
    const total = expiringPartB.length
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const paginatedPartB = expiringPartB.slice(skip, skip + parseInt(limit))

    res.status(200).json({
      success: true,
      data: paginatedPartB,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching Part B expiring soon:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Part B expiring soon',
      error: error.message
    })
  }
}

// Get Part A renewal history
exports.getPartARenewalHistory = async (req, res) => {
  try {
    const { id } = req.params

    // Get the Part A record to find vehicle number and permit number
    const partA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })

    if (!partA) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    const { vehicleNumber, permitNumber } = partA

    const partAHistory = await NationalPermitPartA.find({
      vehicleNumber,
      permitNumber,
      userId: req.user.id
    })
    .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: partAHistory,
      count: partAHistory.length
    })
  } catch (error) {
    console.error('Error fetching Part A renewal history:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Part A renewal history',
      error: error.message
    })
  }
}

// Get Part B renewal history
exports.getPartBRenewalHistory = async (req, res) => {
  try {
    const { id } = req.params

    // Get the Part A record to find vehicle number and permit number
    const partA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })

    if (!partA) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    const { vehicleNumber, permitNumber } = partA

    const partBHistory = await NationalPermitPartB.find({
      vehicleNumber,
      permitNumber,
      userId: req.user.id
    })
    .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: partBHistory,
      count: partBHistory.length
    })
  } catch (error) {
    console.error('Error fetching Part B renewal history:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Part B renewal history',
      error: error.message
    })
  }
}

// Update permit (updates Part A)
exports.updatePermit = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const partA = await NationalPermitPartA.findOne({ _id: id, userId: req.user.id })
    if (!partA) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      })
    }

    // Validate payment fields if provided
    const updatedTotalFee = updateData.totalFee !== undefined ? updateData.totalFee : partA.totalFee
    const updatedPaid = updateData.paid !== undefined ? updateData.paid : partA.paid
    const updatedBalance = updateData.balance !== undefined ? updateData.balance : partA.balance

    if (updatedPaid > updatedTotalFee) {
      return res.status(400).json({
        success: false,
        message: 'Paid amount cannot be greater than total fee'
      })
    }

    if (updatedBalance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Balance amount cannot be negative'
      })
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        partA[key] = updateData[key]
      }
    })

    await partA.save()

    res.status(200).json({
      success: true,
      message: 'Permit updated successfully',
      data: partA
    })
  } catch (error) {
    console.error('Error updating permit:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to update permit',
      error: error.message
    })
  }
}

// Mark national permit as paid
exports.markAsPaid = async (req, res) => {
  try {
    const permit = await NationalPermitPartA.findOne({ _id: req.params.id, userId: req.user.id })

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'National permit not found'
      })
    }

    // Check if there's a balance to pay
    if (!permit.balance || permit.balance === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending payment for this national permit'
      })
    }

    // Update payment details
    permit.paid = permit.totalFee || 0
    permit.balance = 0

    await permit.save()

    res.status(200).json({
      success: true,
      message: 'Payment marked as paid successfully',
      data: permit
    })
  } catch (error) {
    console.error('Error marking payment as paid:', error)
    res.status(500).json({
      success: false,
      message: 'Error marking payment as paid',
      error: error.message
    })
  }
}

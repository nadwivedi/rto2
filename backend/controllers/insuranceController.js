const Insurance = require('../models/Insurance')

// helper function to calculate status
const getInsuranceStatus = (validTo) => {
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

// Create new insurance record
exports.createInsurance = async (req, res) => {
  try {
    const insuranceData = req.body

    // Calculate status
    const status = getInsuranceStatus(insuranceData.validTo);
    insuranceData.status = status;

    // Create new insurance record
    const newInsurance = new Insurance(insuranceData)
    await newInsurance.save()

    res.status(201).json({
      success: true,
      message: 'Insurance record created successfully',
      data: newInsurance
    })
  } catch (error) {
    console.error('Error creating insurance record:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to create insurance record',
      error: error.message
    })
  }
}

// Get all insurance records with pagination and filters
exports.getAllInsurance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = {}

    // Search by policy number, vehicle number, owner name
    if (search) {
      query.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const insuranceRecords = await Insurance.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Insurance.countDocuments(query)

    res.status(200).json({
      success: true,
      data: insuranceRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + insuranceRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching insurance records:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance records',
      error: error.message
    })
  }
}

// Get expiring soon insurance records
exports.getExpiringSoonInsurance = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'validTo', sortOrder = 'asc' } = req.query

    const query = { status: 'expiring_soon' }

    if (search) {
      query.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const insuranceRecords = await Insurance.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Insurance.countDocuments(query)

    res.json({
      success: true,
      data: insuranceRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + insuranceRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching expiring soon insurance records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring soon insurance records',
      error: error.message
    })
  }
}

// Get expired insurance records
exports.getExpiredInsurance = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'validTo', sortOrder = 'desc' } = req.query

    const query = { status: 'expired' }

    if (search) {
      query.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const insuranceRecords = await Insurance.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Insurance.countDocuments(query)

    res.json({
      success: true,
      data: insuranceRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + insuranceRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching expired insurance records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expired insurance records',
      error: error.message
    })
  }
}

// Get pending payment insurance records
exports.getPendingInsurance = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const query = { balance: { $gt: 0 } }

    if (search) {
      query.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const insuranceRecords = await Insurance.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Insurance.countDocuments(query)

    res.json({
      success: true,
      data: insuranceRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + insuranceRecords.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching pending payment insurance records:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching pending payment insurance records',
      error: error.message
    })
  }
}

// Get single insurance record by ID
exports.getInsuranceById = async (req, res) => {
  try {
    const { id } = req.params

    const insurance = await Insurance.findById(id)

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance record not found'
      })
    }

    res.status(200).json({
      success: true,
      data: insurance
    })
  } catch (error) {
    console.error('Error fetching insurance record:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance record',
      error: error.message
    })
  }
}

// Get insurance by policy number
exports.getInsuranceByPolicyNumber = async (req, res) => {
  try {
    const { policyNumber } = req.params

    const insurance = await Insurance.findOne({ policyNumber })

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance record not found'
      })
    }

    res.status(200).json({
      success: true,
      data: insurance
    })
  } catch (error) {
    console.error('Error fetching insurance record:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance record',
      error: error.message
    })
  }
}

// Update insurance record
exports.updateInsurance = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    if (updateData.validTo) {
        // Recalculate status if validTo is updated
        updateData.status = getInsuranceStatus(updateData.validTo);
    }

    const updatedInsurance = await Insurance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedInsurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance record not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Insurance record updated successfully',
      data: updatedInsurance
    })
  } catch (error) {
    console.error('Error updating insurance record:', error)
    res.status(400).json({
      success: false,
      message: 'Failed to update insurance record',
      error: error.message
    })
  }
}

// Delete insurance record
exports.deleteInsurance = async (req, res) => {
  try {
    const { id } = req.params

    const deletedInsurance = await Insurance.findByIdAndDelete(id)

    if (!deletedInsurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance record not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Insurance record deleted successfully',
      data: deletedInsurance
    })
  } catch (error) {
    console.error('Error deleting insurance record:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete insurance record',
      error: error.message
    })
  }
}

// Helper function to parse date from string (DD-MM-YYYY or DD/MM/YYYY format)
function parseInsuranceDate(dateString) {
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

// Get expiring insurance records (within specified days) - with pagination
exports.getExpiringInsurance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      days = 30
    } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all insurance records
    const allInsurance = await Insurance.find()

    // Filter insurance records where policy is expiring in next N days
    const expiringInsurance = allInsurance.filter(insurance => {
      const validToDate = parseInsuranceDate(insurance.validTo)
      if (!validToDate) return false

      const diffTime = validToDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Between 0 and specified days (not expired yet)
      return diffDays >= 0 && diffDays <= parseInt(days)
    })

    // Sort by expiry date (earliest first)
    expiringInsurance.sort((a, b) => {
      const dateA = parseInsuranceDate(a.validTo)
      const dateB = parseInsuranceDate(b.validTo)
      return dateA - dateB
    })

    // Apply pagination
    const total = expiringInsurance.length
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const paginatedInsurance = expiringInsurance.slice(skip, skip + parseInt(limit))

    res.status(200).json({
      success: true,
      data: paginatedInsurance,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasMore: skip + parseInt(limit) < total
      }
    })
  } catch (error) {
    console.error('Error fetching expiring insurance records:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring insurance records',
      error: error.message
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalInsurance = await Insurance.countDocuments()
    const activeInsurance = await Insurance.countDocuments({ status: 'active' })
    const expiringSoonInsurance = await Insurance.countDocuments({ status: 'expiring_soon' })
    const expiredInsurance = await Insurance.countDocuments({ status: 'expired' })
    const cancelledInsurance = await Insurance.countDocuments({ status: 'cancelled' })

    // Total fees collected
    const totalRevenue = await Insurance.aggregate([
      { $group: { _id: null, total: { $sum: '$totalFee' } } }
    ])

    // Pending payment count and amount
    const pendingPayments = await Insurance.aggregate([
      { $match: { balance: { $gt: 0 } } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$balance' } } }
    ])

    res.status(200).json({
      success: true,
      data: {
        insurance: {
          total: totalInsurance,
          active: activeInsurance,
          expiringSoon: expiringSoonInsurance,
          expired: expiredInsurance,
          cancelled: cancelledInsurance
        },
        revenue: {
          total: totalRevenue.length > 0 ? totalRevenue[0].total : 0
        },
        pendingPayments: {
          count: pendingPayments.length > 0 ? pendingPayments[0].count : 0,
          amount: pendingPayments.length > 0 ? pendingPayments[0].total : 0
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


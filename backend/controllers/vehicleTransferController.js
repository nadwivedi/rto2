const VehicleTransfer = require('../models/vehicleTransfer')
const { logError, getUserFriendlyError, getSimplifiedTimestamp } = require('../utils/errorLogger')

// Create new vehicle transfer
exports.createTransfer = async (req, res) => {
  try {
    const transferData = req.body

    // Create new vehicle transfer
    const newTransfer = new VehicleTransfer(transferData)
    await newTransfer.save()

    res.status(201).json({
      success: true,
      message: 'Vehicle transfer created successfully',
      data: newTransfer
    })
  } catch (error) {
    console.error('Error creating vehicle transfer:', error)

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

// Get all vehicle transfers
exports.getAllTransfers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    let query = {}

    // Search filter
    if (search) {
      query.$or = [
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { currentOwnerName: { $regex: search, $options: 'i' } },
        { newOwnerName: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }

    // Execute query with pagination
    const transfers = await VehicleTransfer.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)

    // Get total count
    const total = await VehicleTransfer.countDocuments(query)

    res.json({
      success: true,
      data: transfers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching vehicle transfers:', error)

    // Log error to file
    logError(error, req)

    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle transfers',
      error: error.message
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const total = await VehicleTransfer.countDocuments()

    // Payment statistics - count transfers with balance (pending payment)
    const pendingPayments = await VehicleTransfer.countDocuments({ balance: { $gt: 0 } })

    res.json({
      success: true,
      data: {
        total,
        pendingPayments
      }
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)

    // Log error to file
    logError(error, req)

    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    })
  }
}

// Get single vehicle transfer by ID
exports.getTransferById = async (req, res) => {
  try {
    const transfer = await VehicleTransfer.findById(req.params.id)

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle transfer not found'
      })
    }

    res.json({
      success: true,
      data: transfer
    })
  } catch (error) {
    console.error('Error fetching vehicle transfer:', error)

    // Log error to file
    logError(error, req)

    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle transfer',
      error: error.message
    })
  }
}

// Update vehicle transfer
exports.updateTransfer = async (req, res) => {
  try {
    const transferData = req.body

    const updatedTransfer = await VehicleTransfer.findByIdAndUpdate(
      req.params.id,
      transferData,
      { new: true, runValidators: true }
    )

    if (!updatedTransfer) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle transfer not found'
      })
    }

    res.json({
      success: true,
      message: 'Vehicle transfer updated successfully',
      data: updatedTransfer
    })
  } catch (error) {
    console.error('Error updating vehicle transfer:', error)

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

// Delete vehicle transfer
exports.deleteTransfer = async (req, res) => {
  try {
    const deletedTransfer = await VehicleTransfer.findByIdAndDelete(req.params.id)

    if (!deletedTransfer) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle transfer not found'
      })
    }

    res.json({
      success: true,
      message: 'Vehicle transfer deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting vehicle transfer:', error)

    // Log error to file
    logError(error, req)

    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle transfer',
      error: error.message
    })
  }
}

// Get transfers by vehicle number
exports.getTransfersByVehicle = async (req, res) => {
  try {
    const { vehicleNumber } = req.params

    const transfers = await VehicleTransfer.find({
      vehicleNumber: vehicleNumber.toUpperCase()
    }).sort({ createdAt: -1 })

    res.json({
      success: true,
      data: transfers,
      count: transfers.length
    })
  } catch (error) {
    console.error('Error fetching transfers by vehicle:', error)

    // Log error to file
    logError(error, req)

    res.status(500).json({
      success: false,
      message: 'Error fetching transfers by vehicle',
      error: error.message
    })
  }
}

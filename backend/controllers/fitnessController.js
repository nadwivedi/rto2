const Fitness = require('../models/Fitness')

// Get all fitness records
exports.getAllFitness = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    // Build query
    const query = {}

    // Search by vehicle number
    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    // Filter by status
    if (status) {
      query.status = status
    }

    // Calculate pagination
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
    const { vehicleNumber, validFrom, validTo, fee } = req.body

    // Validate required fields
    if (!vehicleNumber || !validFrom || !validTo || !fee) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number, valid from, valid to, and fee are required'
      })
    }

    // Create new fitness record
    const fitness = new Fitness({
      vehicleNumber,
      validFrom,
      validTo,
      fee,
      status: 'active'
    })

    await fitness.save()

    res.status(201).json({
      success: true,
      message: 'Fitness record created successfully',
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
    const { vehicleNumber, validFrom, validTo, fee, status } = req.body

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
    if (validTo) fitness.validTo = validTo
    if (fee) fitness.fee = fee
    if (status) fitness.status = status

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
    const total = await Fitness.countDocuments()
    const active = await Fitness.countDocuments({ status: 'active' })
    const expired = await Fitness.countDocuments({ status: 'expired' })
    const expiring = await Fitness.countDocuments({ status: 'expiring_soon' })

    res.json({
      success: true,
      data: {
        total,
        active,
        expired,
        expiringSoon: expiring
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

const TemporaryPermit = require('../models/TemporaryPermit')
const mongoose = require('mongoose')

// helper function to calculate status
const getTemporaryPermitStatus = (validTo) => {
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

// Create new temporary permit
exports.createPermit = async (req, res) => {
  try {
    // Destructure all fields from request body
    const {
      permitNumber,
      permitHolder,
      vehicleNumber,
      vehicleType,
      validFrom,
      validTo,
      fatherName,
      address,
      mobileNumber,
      email,
      chassisNumber,
      engineNumber,
      ladenWeight,
      unladenWeight,
      totalFee,
      paid,
      balance,
      notes
    } = req.body

    // 1. Validate required fields
    if (!permitNumber || permitNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Permit number is required'
      })
    }

    if (!permitHolder || permitHolder.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Permit holder name is required'
      })
    }

    if (!vehicleNumber || vehicleNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number is required'
      })
    }

    if (!vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle type is required'
      })
    }

    if (!validFrom) {
      return res.status(400).json({
        success: false,
        message: 'Valid from date is required'
      })
    }

    if (!validTo) {
      return res.status(400).json({
        success: false,
        message: 'Valid to date is required'
      })
    }

    if (totalFee === undefined || totalFee === null) {
      return res.status(400).json({
        success: false,
        message: 'Total fee is required'
      })
    }

    // 2. Check if permit number already exists
    const existingPermit = await TemporaryPermit.findOne({ permitNumber: permitNumber.trim() })
    if (existingPermit) {
      return res.status(400).json({
        success: false,
        message: 'Permit number already exists'
      })
    }

    // 3. Validate vehicle number format (should be 10 characters)
    const cleanVehicleNumber = vehicleNumber.trim().replace(/\s+/g, '')
    if (cleanVehicleNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number must be exactly 10 characters'
      })
    }

    // Additional validation: Vehicle number should follow pattern (e.g., CG01AB1234)
    const vehicleNumberPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/
    if (!vehicleNumberPattern.test(cleanVehicleNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number format is invalid (e.g., CG01AB1234)'
      })
    }

    // 4. Validate vehicle type
    if (!['CV', 'PV'].includes(vehicleType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle type must be either CV or PV'
      })
    }

    // 5. Validate totalFee
    if (isNaN(totalFee) || Number(totalFee) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total fee must be greater than zero'
      })
    }

    // 6. Validate paid amount
    if (paid !== undefined && paid !== null) {
      if (isNaN(paid) || Number(paid) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Paid amount cannot be negative'
        })
      }
      if (Number(paid) > Number(totalFee)) {
        return res.status(400).json({
          success: false,
          message: 'Paid amount cannot be greater than total fee'
        })
      }
    }

    // 7. Validate balance
    if (balance !== undefined && balance !== null) {
      if (isNaN(balance) || Number(balance) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Balance cannot be negative'
        })
      }
    }

    // 8. Validate mobile number (if provided)
    if (mobileNumber && mobileNumber.trim() !== '') {
      const cleanMobile = mobileNumber.trim().replace(/\s+/g, '')
      if (!/^[0-9]{10}$/.test(cleanMobile)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be exactly 10 digits'
        })
      }
    }

    // 9. Validate email format (if provided)
    if (email && email.trim() !== '') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        })
      }
    }

    // 10. Validate weight values (if provided)
    if (ladenWeight !== undefined && ladenWeight !== null) {
      if (isNaN(ladenWeight) || Number(ladenWeight) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Laden weight must be a positive number'
        })
      }
    }

    if (unladenWeight !== undefined && unladenWeight !== null) {
      if (isNaN(unladenWeight) || Number(unladenWeight) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Unladen weight must be a positive number'
        })
      }
    }

    // Calculate status
    const status = getTemporaryPermitStatus(validTo);

    // Prepare permit data with validated values
    const permitData = {
      permitNumber: permitNumber.trim(),
      permitHolder: permitHolder.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType: vehicleType.toUpperCase(),
      validFrom,
      validTo,
      totalFee: Number(totalFee),
      paid: paid !== undefined ? Number(paid) : 0,
      balance: balance !== undefined ? Number(balance) : Number(totalFee) - (paid !== undefined ? Number(paid) : 0),
      status,
      userId: req.user.id
    }

    // Add optional fields if provided
    if (fatherName && fatherName.trim() !== '') permitData.fatherName = fatherName.trim()
    if (address && address.trim() !== '') permitData.address = address.trim()
    if (mobileNumber && mobileNumber.trim() !== '') permitData.mobileNumber = mobileNumber.trim()
    if (email && email.trim() !== '') permitData.email = email.trim().toLowerCase()
    if (chassisNumber && chassisNumber.trim() !== '') permitData.chassisNumber = chassisNumber.trim().toUpperCase()
    if (engineNumber && engineNumber.trim() !== '') permitData.engineNumber = engineNumber.trim().toUpperCase()
    if (ladenWeight !== undefined && ladenWeight !== null) permitData.ladenWeight = Number(ladenWeight)
    if (unladenWeight !== undefined && unladenWeight !== null) permitData.unladenWeight = Number(unladenWeight)
    if (notes && notes.trim() !== '') permitData.notes = notes.trim()

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

    // Handle MongoDB duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Permit number already exists'
      })
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0].message
      return res.status(400).json({
        success: false,
        message: firstError
      })
    }

    // Handle all other errors
    res.status(500).json({
      success: false,
      message: 'Failed to create temporary permit'
    })
  }
}

// Get all temporary permits
exports.getAllPermits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      vehicleType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = { userId: req.user.id }

    // Search by vehicle number only
    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    // Filter by vehicle type
    if (vehicleType) {
      query.vehicleType = vehicleType.toUpperCase()
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Sort options
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const permits = await TemporaryPermit.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    // Get total count for pagination
    const total = await TemporaryPermit.countDocuments(query)

    res.status(200).json({
      success: true,
      data: permits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total
      }
    })
  } catch (error) {
    console.error('Error fetching temporary permits:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temporary permits'
    })
  }
}

// Export all temporary permits without pagination
exports.exportAllPermits = async (req, res) => {
  try {
    // Get all permits without pagination
    const permits = await TemporaryPermit.find({ userId: req.user.id })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: permits,
      total: permits.length
    })
  } catch (error) {
    console.error('Error exporting temporary permits:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export temporary permits'
    })
  }
}

// Get expiring soon temporary permits
exports.getExpiringSoonPermits = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'validTo', sortOrder = 'asc' } = req.query

    // Find all vehicle numbers that have active permits
    // These vehicles have been renewed and should be excluded
    const vehiclesWithActivePermits = await TemporaryPermit.find({ status: 'active', userId: req.user.id })
      .distinct('vehicleNumber')

    const query = {
      userId: req.user.id,
      status: 'expiring_soon',
      vehicleNumber: { $nin: vehiclesWithActivePermits }
    }

    if (search) {
      // Update the vehicleNumber condition to work with search
      query.$and = [
        { vehicleNumber: { $nin: vehiclesWithActivePermits } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ]
      delete query.vehicleNumber
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const permits = await TemporaryPermit.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await TemporaryPermit.countDocuments(query)

    res.json({
      success: true,
      data: permits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total
      }
    })
  } catch (error) {
    console.error('Error fetching expiring soon permits:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring soon permits',
      error: error.message
    })
  }
}

// Get expired temporary permits
exports.getExpiredPermits = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'validTo', sortOrder = 'desc' } = req.query

    // Find all vehicle numbers that have active permits
    // These vehicles have been renewed and should be excluded
    const vehiclesWithActivePermits = await TemporaryPermit.find({ status: 'active', userId: req.user.id })
      .distinct('vehicleNumber')

    const query = {
      userId: req.user.id,
      status: 'expired',
      vehicleNumber: { $nin: vehiclesWithActivePermits }
    }

    if (search) {
      // Update the vehicleNumber condition to work with search
      query.$and = [
        { vehicleNumber: { $nin: vehiclesWithActivePermits } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ]
      delete query.vehicleNumber
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const permits = await TemporaryPermit.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await TemporaryPermit.countDocuments(query)

    res.json({
      success: true,
      data: permits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total
      }
    })
  } catch (error) {
    console.error('Error fetching expired permits:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expired permits',
      error: error.message
    })
  }
}

// Get pending payment temporary permits
exports.getPendingPermits = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const query = { userId: req.user.id, balance: { $gt: 0 } }

    if (search) {
      query.vehicleNumber = { $regex: search, $options: 'i' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const permits = await TemporaryPermit.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await TemporaryPermit.countDocuments(query)

    res.json({
      success: true,
      data: permits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total
      }
    })
  } catch (error) {
    console.error('Error fetching pending permits:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching pending permits',
      error: error.message
    })
  }
}


// Get single temporary permit by ID
exports.getPermitById = async (req, res) => {
  try {
    const { id } = req.params

    const permit = await TemporaryPermit.findOne({ _id: id, userId: req.user.id })

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
      message: 'Failed to fetch temporary permit'
    })
  }
}

// Get temporary permit by permit number
exports.getPermitByNumber = async (req, res) => {
  try {
    const { permitNumber } = req.params

    const permit = await TemporaryPermit.findOne({ permitNumber, userId: req.user.id })

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
      message: 'Operation failed'
      
      
      
    })
  }
}

// Update temporary permit
exports.updatePermit = async (req, res) => {
  try {
    const { id } = req.params

    // Destructure all fields from request body
    const {
      permitNumber,
      permitHolder,
      vehicleNumber,
      vehicleType,
      validFrom,
      validTo,
      fatherName,
      address,
      mobileNumber,
      email,
      chassisNumber,
      engineNumber,
      ladenWeight,
      unladenWeight,
      totalFee,
      paid,
      balance,
      notes
    } = req.body

    // 1. Validate required fields
    if (permitNumber && permitNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Permit number cannot be empty'
      })
    }

    if (permitHolder && permitHolder.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Permit holder name cannot be empty'
      })
    }

    if (vehicleNumber && vehicleNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number cannot be empty'
      })
    }

    // 2. Check if permit number already exists (if being changed)
    if (permitNumber && permitNumber.trim() !== '') {
      const existingPermit = await TemporaryPermit.findOne({
        permitNumber: permitNumber.trim(),
        _id: { $ne: id } // Exclude current document
      })
      if (existingPermit) {
        return res.status(400).json({
          success: false,
          message: 'Permit number already exists'
        })
      }
    }

    // 3. Validate vehicle number format (if provided)
    if (vehicleNumber && vehicleNumber.trim() !== '') {
      const cleanVehicleNumber = vehicleNumber.trim().replace(/\s+/g, '')
      if (cleanVehicleNumber.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle number must be exactly 10 characters'
        })
      }

      const vehicleNumberPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/
      if (!vehicleNumberPattern.test(cleanVehicleNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle number format is invalid (e.g., CG01AB1234)'
        })
      }
    }

    // 4. Validate vehicle type (if provided)
    if (vehicleType && !['CV', 'PV'].includes(vehicleType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle type must be either CV or PV'
      })
    }

    // 5. Validate totalFee (if provided)
    if (totalFee !== undefined && totalFee !== null) {
      if (isNaN(totalFee) || Number(totalFee) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Total fee must be greater than zero'
        })
      }
    }

    // 6. Validate paid amount (if provided)
    if (paid !== undefined && paid !== null) {
      if (isNaN(paid) || Number(paid) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Paid amount cannot be negative'
        })
      }
      if (totalFee !== undefined && Number(paid) > Number(totalFee)) {
        return res.status(400).json({
          success: false,
          message: 'Paid amount cannot be greater than total fee'
        })
      }
    }

    // 7. Validate balance (if provided)
    if (balance !== undefined && balance !== null) {
      if (isNaN(balance) || Number(balance) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Balance cannot be negative'
        })
      }
    }

    // 8. Validate mobile number (if provided)
    if (mobileNumber && mobileNumber.trim() !== '') {
      const cleanMobile = mobileNumber.trim().replace(/\s+/g, '')
      if (!/^[0-9]{10}$/.test(cleanMobile)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be exactly 10 digits'
        })
      }
    }

    // 9. Validate email format (if provided)
    if (email && email.trim() !== '') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        })
      }
    }

    // 10. Validate weight values (if provided)
    if (ladenWeight !== undefined && ladenWeight !== null) {
      if (isNaN(ladenWeight) || Number(ladenWeight) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Laden weight must be a positive number'
        })
      }
    }

    if (unladenWeight !== undefined && unladenWeight !== null) {
      if (isNaN(unladenWeight) || Number(unladenWeight) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Unladen weight must be a positive number'
        })
      }
    }

    // Prepare update data
    const updateData = {}
    if (permitNumber) updateData.permitNumber = permitNumber.trim()
    if (permitHolder) updateData.permitHolder = permitHolder.trim()
    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber.trim().toUpperCase()
    if (vehicleType) updateData.vehicleType = vehicleType.toUpperCase()
    if (validFrom) updateData.validFrom = validFrom
    if (validTo) {
        updateData.validTo = validTo;
        // Recalculate status if validTo is updated
        updateData.status = getTemporaryPermitStatus(validTo);
    }
    if (totalFee !== undefined) updateData.totalFee = Number(totalFee)
    if (paid !== undefined) updateData.paid = Number(paid)
    if (balance !== undefined) updateData.balance = Number(balance)
    if (fatherName !== undefined) updateData.fatherName = fatherName ? fatherName.trim() : ''
    if (address !== undefined) updateData.address = address ? address.trim() : ''
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber ? mobileNumber.trim() : ''
    if (email !== undefined) updateData.email = email ? email.trim().toLowerCase() : ''
    if (chassisNumber !== undefined) updateData.chassisNumber = chassisNumber ? chassisNumber.trim().toUpperCase() : ''
    if (engineNumber !== undefined) updateData.engineNumber = engineNumber ? engineNumber.trim().toUpperCase() : ''
    if (ladenWeight !== undefined) updateData.ladenWeight = ladenWeight ? Number(ladenWeight) : null
    if (unladenWeight !== undefined) updateData.unladenWeight = unladenWeight ? Number(unladenWeight) : null
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : ''
    // Note: status is managed by cron job and should not be manually updated

    const updatedPermit = await TemporaryPermit.findOneAndUpdate(
      { _id: id, userId: req.user.id },
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

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Permit number already exists'
      })
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0].message
      return res.status(400).json({
        success: false,
        message: firstError
      })
    }

    // Handle all other errors
    res.status(500).json({
      success: false,
      message: 'Failed to update temporary permit'
    })
  }
}

// Delete temporary permit
exports.deletePermit = async (req, res) => {
  try {
    const { id } = req.params

    const deletedPermit = await TemporaryPermit.findOneAndDelete({ _id: id, userId: req.user.id })

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
      message: 'Operation failed'
      
      
      
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    // Count permits by status (now using the indexed status field)
    const activePermits = await TemporaryPermit.countDocuments({ status: 'active', userId: req.user.id })

    // For expiring soon and expired, exclude vehicles that also have active permits (renewed vehicles)
    const vehiclesWithActivePermits = await TemporaryPermit.find({ status: 'active', userId: req.user.id })
      .distinct('vehicleNumber')

    const expiringPermits = await TemporaryPermit.countDocuments({
      userId: req.user.id,
      status: 'expiring_soon',
      vehicleNumber: { $nin: vehiclesWithActivePermits }
    })

    const expiredPermits = await TemporaryPermit.countDocuments({
      userId: req.user.id,
      status: 'expired',
      vehicleNumber: { $nin: vehiclesWithActivePermits }
    })

    const totalPermits = await TemporaryPermit.countDocuments({ userId: req.user.id })

    // Pending payment aggregation
    const pendingPaymentPipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), balance: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$balance' }
        }
      }
    ]

    const pendingPaymentResults = await TemporaryPermit.aggregate(pendingPaymentPipeline)
    const pendingPaymentCount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].count : 0
    const pendingPaymentAmount = pendingPaymentResults.length > 0 ? pendingPaymentResults[0].totalAmount : 0

    // Count by vehicle type
    const cvPermits = await TemporaryPermit.countDocuments({ vehicleType: 'CV', userId: req.user.id })
    const pvPermits = await TemporaryPermit.countDocuments({ vehicleType: 'PV', userId: req.user.id })



    res.status(200).json({
      success: true,
      data: {
        permits: {
          total: totalPermits,
          active: activePermits,
          expiringSoon: expiringPermits,
          expired: expiredPermits
        },
        pendingPaymentCount,
        pendingPaymentAmount
      }
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)


    res.status(500).json({
      success: false,
      message: 'Operation failed'



    })
  }
}

// Renew temporary permit
exports.renewPermit = async (req, res) => {
  try {
    const {
      oldPermitId,
      permitNumber,
      permitHolder,
      vehicleNumber,
      vehicleType,
      validFrom,
      validTo,
      fatherName,
      address,
      mobileNumber,
      email,
      chassisNumber,
      engineNumber,
      ladenWeight,
      unladenWeight,
      totalFee,
      paid,
      balance,
      notes
    } = req.body

    // Validate required fields
    if (!oldPermitId) {
      return res.status(400).json({
        success: false,
        message: 'Old permit ID is required for renewal'
      })
    }

    if (!permitNumber || !permitHolder || !vehicleNumber || !vehicleType || !validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: 'Permit number, permit holder, vehicle number, vehicle type, valid from, and valid to are required'
      })
    }

    if (totalFee === undefined || totalFee === null) {
      return res.status(400).json({
        success: false,
        message: 'Total fee is required'
      })
    }

    // Find the old permit
    const oldPermit = await TemporaryPermit.findOne({ _id: oldPermitId, userId: req.user.id })
    if (!oldPermit) {
      return res.status(404).json({
        success: false,
        message: 'Old permit record not found'
      })
    }

    // Mark old permit as renewed
    oldPermit.isRenewed = true
    await oldPermit.save()

    // Calculate status for new permit
    const status = getTemporaryPermitStatus(validTo)

    // Prepare new permit data
    const newPermitData = {
      permitNumber: permitNumber.trim(),
      permitHolder: permitHolder.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType: vehicleType.toUpperCase(),
      validFrom,
      validTo,
      totalFee: Number(totalFee),
      paid: paid !== undefined ? Number(paid) : 0,
      balance: balance !== undefined ? Number(balance) : Number(totalFee) - (paid !== undefined ? Number(paid) : 0),
      status,
      isRenewed: false,  // New permit is not renewed yet
      userId: req.user.id
    }

    // Add optional fields if provided
    if (fatherName && fatherName.trim() !== '') newPermitData.fatherName = fatherName.trim()
    if (address && address.trim() !== '') newPermitData.address = address.trim()
    if (mobileNumber && mobileNumber.trim() !== '') newPermitData.mobileNumber = mobileNumber.trim()
    if (email && email.trim() !== '') newPermitData.email = email.trim().toLowerCase()
    if (chassisNumber && chassisNumber.trim() !== '') newPermitData.chassisNumber = chassisNumber.trim().toUpperCase()
    if (engineNumber && engineNumber.trim() !== '') newPermitData.engineNumber = engineNumber.trim().toUpperCase()
    if (ladenWeight !== undefined && ladenWeight !== null) newPermitData.ladenWeight = Number(ladenWeight)
    if (unladenWeight !== undefined && unladenWeight !== null) newPermitData.unladenWeight = Number(unladenWeight)
    if (notes && notes.trim() !== '') newPermitData.notes = notes.trim()

    // Create new permit
    const newPermit = new TemporaryPermit(newPermitData)
    await newPermit.save()

    // Return success with both old and new permits
    res.status(201).json({
      success: true,
      message: 'Temporary permit renewed successfully',
      data: {
        oldPermit,
        newPermit
      }
    })
  } catch (error) {
    console.error('Error renewing temporary permit:', error)
    res.status(500).json({
      success: false,
      message: 'Error renewing temporary permit',
      error: error.message
    })
  }
}

// Mark temporary permit as paid
exports.markAsPaid = async (req, res) => {
  try {
    const permit = await TemporaryPermit.findOne({ _id: req.params.id, userId: req.user.id })

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Temporary permit not found'
      })
    }

    // Check if there's a balance to pay
    if (!permit.balance || permit.balance === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending payment for this temporary permit'
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
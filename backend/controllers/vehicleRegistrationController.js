const VehicleRegistration = require('../models/VehicleRegistration')
const { logError, getUserFriendlyError } = require('../utils/errorLogger')

// Get all vehicle registrations
exports.getAllRegistrations = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query
    // Filter by logged-in user
    let query = { userId: req.user.id }

    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { chassisNumber: { $regex: search, $options: 'i' } },
        { engineNumber: { $regex: search, $options: 'i' } }
      ]
    }

    if (status) {
      query.status = status
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)
    const skip = (pageNum - 1) * limitNum

    // Get total count for pagination
    const totalRecords = await VehicleRegistration.countDocuments(query)
    const totalPages = Math.ceil(totalRecords / limitNum)

    // Get paginated results
    const registrations = await VehicleRegistration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords,
        limit: limitNum
      }
    })
  } catch (error) {
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Export all vehicle registrations without pagination
exports.exportAllRegistrations = async (req, res) => {
  try {
    // Get all registrations without pagination (only user's own data)
    const registrations = await VehicleRegistration.find({ userId: req.user.id })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: registrations,
      total: registrations.length
    })
  } catch (error) {
    logError(error, req)
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Get single vehicle registration by ID
exports.getRegistrationById = async (req, res) => {
  try {
    const registration = await VehicleRegistration.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle registration not found'
      })
    }

    res.json({
      success: true,
      data: registration
    })
  } catch (error) {
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Get vehicle registration by registration number
exports.getRegistrationByNumber = async (req, res) => {
  try {
    const registration = await VehicleRegistration.findOne({
      registrationNumber: req.params.registrationNumber.toUpperCase(),
      userId: req.user.id
    })

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle registration not found'
      })
    }

    res.json({
      success: true,
      data: registration
    })
  } catch (error) {
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Create new vehicle registration
exports.createRegistration = async (req, res) => {
  try {
    const {
      registrationNumber,
      dateOfRegistration,
      chassisNumber,
      engineNumber,
      ownerName,
      sonWifeDaughterOf,
      address,
      mobileNumber,
      email,
      makerName,
      makerModel,
      colour,
      seatingCapacity,
      vehicleClass,
      vehicleType,
      ladenWeight,
      unladenWeight,
      manufactureYear,
      vehicleCategory,
      purchaseDeliveryDate,
      saleAmount
    } = req.body

    // Validate required fields
    if (!registrationNumber) {
      return res.status(400).json({
        success: false,
        message: 'Registration number is required'
      })
    }

    if (!chassisNumber) {
      return res.status(400).json({
        success: false,
        message: 'Chassis number is required'
      })
    }

    // Create vehicle registration with userId
    const registration = await VehicleRegistration.create({
      userId: req.user.id,
      registrationNumber,
      dateOfRegistration,
      chassisNumber,
      engineNumber,
      ownerName,
      sonWifeDaughterOf,
      address,
      mobileNumber,
      email,
      makerName,
      makerModel,
      colour,
      seatingCapacity,
      vehicleClass,
      vehicleType,
      ladenWeight,
      unladenWeight,
      manufactureYear,
      vehicleCategory,
      purchaseDeliveryDate,
      saleAmount
    })

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully',
      data: registration
    })
  } catch (error) {
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(400).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Update vehicle registration
exports.updateRegistration = async (req, res) => {
  try {
    const {
      registrationNumber,
      dateOfRegistration,
      chassisNumber,
      engineNumber,
      ownerName,
      sonWifeDaughterOf,
      address,
      mobileNumber,
      email,
      makerName,
      makerModel,
      colour,
      seatingCapacity,
      vehicleClass,
      vehicleType,
      ladenWeight,
      unladenWeight,
      manufactureYear,
      vehicleCategory,
      purchaseDeliveryDate,
      saleAmount
    } = req.body

    const registration = await VehicleRegistration.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle registration not found'
      })
    }

    // Update fields
    if (registrationNumber !== undefined) registration.registrationNumber = registrationNumber
    if (dateOfRegistration !== undefined) registration.dateOfRegistration = dateOfRegistration
    if (chassisNumber !== undefined) registration.chassisNumber = chassisNumber
    if (engineNumber !== undefined) registration.engineNumber = engineNumber
    if (ownerName !== undefined) registration.ownerName = ownerName
    if (sonWifeDaughterOf !== undefined) registration.sonWifeDaughterOf = sonWifeDaughterOf
    if (address !== undefined) registration.address = address
    if (mobileNumber !== undefined) registration.mobileNumber = mobileNumber
    if (email !== undefined) registration.email = email
    if (makerName !== undefined) registration.makerName = makerName
    if (makerModel !== undefined) registration.makerModel = makerModel
    if (colour !== undefined) registration.colour = colour
    if (seatingCapacity !== undefined) registration.seatingCapacity = seatingCapacity
    if (vehicleClass !== undefined) registration.vehicleClass = vehicleClass
    if (vehicleType !== undefined) registration.vehicleType = vehicleType
    if (ladenWeight !== undefined) registration.ladenWeight = ladenWeight
    if (unladenWeight !== undefined) registration.unladenWeight = unladenWeight
    if (manufactureYear !== undefined) registration.manufactureYear = manufactureYear
    if (vehicleCategory !== undefined) registration.vehicleCategory = vehicleCategory
    if (purchaseDeliveryDate !== undefined) registration.purchaseDeliveryDate = purchaseDeliveryDate
    if (saleAmount !== undefined) registration.saleAmount = saleAmount

    await registration.save()

    res.json({
      success: true,
      message: 'Vehicle registration updated successfully',
      data: registration
    })
  } catch (error) {
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(400).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Delete vehicle registration
exports.deleteRegistration = async (req, res) => {
  try {
    const registration = await VehicleRegistration.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle registration not found'
      })
    }

    res.json({
      success: true,
      message: 'Vehicle registration deleted successfully'
    })
  } catch (error) {
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Update registration status
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body

    const registration = await VehicleRegistration.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true, runValidators: true }
    )

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle registration not found'
      })
    }

    res.json({
      success: true,
      message: 'Registration status updated successfully',
      data: registration
    })
  } catch (error) {
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(400).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const total = await VehicleRegistration.countDocuments()
    const active = await VehicleRegistration.countDocuments({ status: 'Active' })
    const transferred = await VehicleRegistration.countDocuments({ status: 'Transferred' })
    const cancelled = await VehicleRegistration.countDocuments({ status: 'Cancelled' })

    res.json({
      success: true,
      data: {
        total,
        active,
        transferred,
        cancelled
      }
    })
  } catch (error) {
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}

// Share registration via WhatsApp
exports.shareRegistration = async (req, res) => {
  try {
    const registration = await VehicleRegistration.findOne({ _id: req.params.id, userId: req.user.id })

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle registration not found'
      })
    }

    const message = `*VEHICLE REGISTRATION CERTIFICATE*\n\n` +
      `Registration No: ${registration.registrationNumber}\n` +
      `Date of Registration: ${registration.dateOfRegistration || 'N/A'}\n\n` +
      `*Vehicle Details*\n` +
      `Chassis No: ${registration.chassisNumber}\n` +
      `Engine No: ${registration.engineNumber || 'N/A'}\n` +
      `Maker: ${registration.makerName || 'N/A'}\n` +
      `Model: ${registration.modelName || 'N/A'}\n` +
      `Maker Model: ${registration.makerModel || 'N/A'}\n` +
      `Colour: ${registration.colour || 'N/A'}\n` +
      `Seating Capacity: ${registration.seatingCapacity || 'N/A'}\n` +
      `Vehicle Class: ${registration.vehicleClass || 'N/A'}\n` +
      `Vehicle Category: ${registration.vehicleCategory || 'N/A'}\n` +
      `Laden Weight: ${registration.ladenWeight || 'N/A'} kg\n` +
      `Unladen Weight: ${registration.unladenWeight || 'N/A'} kg\n` +
      `Manufacture Year: ${registration.manufactureYear || 'N/A'}\n` +
      `Purchase/Delivery Date: ${registration.purchaseDeliveryDate || 'N/A'}\n` +
      `Sale Amount: ${registration.saleAmount ? '₹' + registration.saleAmount : 'N/A'}\n\n` +
      `*Owner Details*\n` +
      `Name: ${registration.ownerName || 'N/A'}\n` +
      `S/W/D of: ${registration.sonWifeDaughterOf || 'N/A'}\n` +
      `Address: ${registration.address || 'N/A'}\n\n` +
      `Status: ${registration.status}\n\n` +
      `---\n` +
      `Regional Transport Office`

    const { phoneNumber } = req.body

    res.json({
      success: true,
      message: 'Registration details prepared for sharing',
      data: {
        phoneNumber,
        message,
        whatsappUrl: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
      }
    })
  } catch (error) {
    logError(error, req) // Fire and forget
    const userError = getUserFriendlyError(error)
    res.status(500).json({
      success: false,
      message: userError.message,
      errors: userError.details,
      errorCount: userError.errorCount,
      timestamp: new Date().toISOString()
    })
  }
}

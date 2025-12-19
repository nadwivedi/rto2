const express = require('express')
const router = express.Router()
const VehicleRegistration = require('../models/VehicleRegistration')

// GET all vehicle registrations
router.get('/', async (req, res) => {
  try {
    const registrations = await VehicleRegistration.find().sort({ createdAt: -1 })
    res.json({
      success: true,
      data: registrations
    })
  } catch (error) {
    console.error('Error fetching vehicle registrations:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle registrations'
    })
  }
})

// POST - Create vehicle registration from JSON
router.post('/create-from-json', async (req, res) => {
  try {
    const vehicleData = req.body

    // Validate required fields
    if (!vehicleData.userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      })
    }

    if (!vehicleData.registrationNumber) {
      return res.status(400).json({
        success: false,
        message: 'registrationNumber is required'
      })
    }

    if (!vehicleData.chassisNumber) {
      return res.status(400).json({
        success: false,
        message: 'chassisNumber is required'
      })
    }

    // Check if vehicle registration already exists for this user
    const existingRegistration = await VehicleRegistration.findOne({
      userId: vehicleData.userId,
      registrationNumber: vehicleData.registrationNumber.toUpperCase()
    })

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'Vehicle registration already exists for this user'
      })
    }

    // Create new vehicle registration
    const newRegistration = new VehicleRegistration(vehicleData)
    await newRegistration.save()

    res.status(201).json({
      success: true,
      message: 'Vehicle registration created successfully',
      data: newRegistration
    })
  } catch (error) {
    console.error('Error creating vehicle registration:', error)

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      })
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Vehicle registration already exists'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle registration'
    })
  }
})

// DELETE vehicle registration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deletedRegistration = await VehicleRegistration.findByIdAndDelete(id)

    if (!deletedRegistration) {
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
    console.error('Error deleting vehicle registration:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle registration'
    })
  }
})

module.exports = router

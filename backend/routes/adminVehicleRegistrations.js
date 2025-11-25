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

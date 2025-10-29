const express = require('express')
const router = express.Router()
const {
  getVehicleProfile,
  getVehicleProfileWithVirtuals,
  getExpiringDocuments,
  searchVehicles
} = require('../controllers/vehicleProfileController')

// Get complete vehicle profile
router.get('/profile/:vehicleNumber', getVehicleProfile)

// Get complete vehicle profile using virtuals
router.get('/profile-virtuals/:vehicleNumber', getVehicleProfileWithVirtuals)

// Get all expiring documents for a vehicle
router.get('/expiring/:vehicleNumber', getExpiringDocuments)

// Search vehicles
router.get('/search', searchVehicles)

module.exports = router

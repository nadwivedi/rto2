const express = require('express')
const router = express.Router()
const vehicleRegistrationController = require('../controllers/vehicleRegistrationController')

// GET export all registrations (must be before '/')
router.get('/export', vehicleRegistrationController.exportAllRegistrations)

// GET all vehicle registrations
router.get('/', vehicleRegistrationController.getAllRegistrations)

// GET statistics
router.get('/statistics', vehicleRegistrationController.getStatistics)

// POST share registration via WhatsApp (must be before /:id route)
router.post('/:id/share', vehicleRegistrationController.shareRegistration)

// GET single vehicle registration by ID
router.get('/:id', vehicleRegistrationController.getRegistrationById)

// GET vehicle registration by registration number
router.get('/number/:registrationNumber', vehicleRegistrationController.getRegistrationByNumber)

// POST create new vehicle registration
router.post('/', vehicleRegistrationController.createRegistration)

// PUT update vehicle registration
router.put('/:id', vehicleRegistrationController.updateRegistration)

// DELETE vehicle registration
router.delete('/:id', vehicleRegistrationController.deleteRegistration)

// PATCH update registration status
router.patch('/:id/status', vehicleRegistrationController.updateRegistrationStatus)

module.exports = router

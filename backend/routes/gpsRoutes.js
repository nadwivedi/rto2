const express = require('express')
const router = express.Router()
const gpsController = require('../controllers/gpsController')

// Get all GPS records
router.get('/', gpsController.getAllGps)

// Export all GPS records
router.get('/export', gpsController.exportAllGps)

// Get expiring soon GPS records
router.get('/expiring-soon', gpsController.getExpiringSoonGps)

// Get expired GPS records
router.get('/expired', gpsController.getExpiredGps)

// Get pending payment GPS records
router.get('/pending', gpsController.getPendingPaymentGps)

// Get GPS statistics
router.get('/statistics', gpsController.getGpsStatistics)

// Get single GPS record by ID
router.get('/id/:id', gpsController.getGpsById)

// Create new GPS record
router.post('/', gpsController.createGps)

// Update GPS record
router.put('/id/:id', gpsController.updateGps)

// Delete GPS record
router.delete('/id/:id', gpsController.deleteGps)

// Mark GPS as paid
router.patch('/id/:id/mark-paid', gpsController.markAsPaid)

module.exports = router

const express = require('express')
const router = express.Router()
const nationalPermitController = require('../controllers/nationalPermitController')

// GET export all permits (must be before '/' to avoid conflicts)
router.get('/export', nationalPermitController.exportAllPermits)

// GET all national permits
router.get('/', nationalPermitController.getAllPermits)

// GET statistics
router.get('/statistics', nationalPermitController.getStatistics)

// GET pending payment permits
router.get('/pending', nationalPermitController.getPendingPermits)

// GET Part A expiring soon
router.get('/part-a-expiring', nationalPermitController.getPartAExpiringSoon)

// GET Part B expiring soon
router.get('/part-b-expiring', nationalPermitController.getPartBExpiringSoon)

// GET Part A expired
router.get('/part-a-expired', nationalPermitController.getPartAExpired)

// GET Part B expired
router.get('/part-b-expired', nationalPermitController.getPartBExpired)

// GET Part A renewal history
router.get('/:id/part-a-history', nationalPermitController.getPartARenewalHistory)

// GET Part B renewal history
router.get('/:id/part-b-history', nationalPermitController.getPartBRenewalHistory)

// GET check existing permit by vehicle number
router.get('/check-existing/:vehicleNumber', nationalPermitController.checkExistingPermit)

// POST create new national permit
router.post('/', nationalPermitController.createPermit)


// PUT update national permit
router.put('/:id', nationalPermitController.updatePermit)

// PATCH mark national permit as paid
router.patch('/:id/mark-as-paid', nationalPermitController.markAsPaid)

// PATCH increment WhatsApp message count
router.patch('/:id/whatsapp-increment', nationalPermitController.incrementWhatsAppCount)

// DELETE national permit
router.delete('/:id', nationalPermitController.deletePermit)

module.exports = router

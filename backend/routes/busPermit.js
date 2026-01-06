const express = require('express')
const router = express.Router()
const busPermitController = require('../controllers/busPermitController')

// GET export all permits (must be before '/')
router.get('/export', busPermitController.exportAllPermits)

// GET all Bus permits
router.get('/', busPermitController.getAllPermits)

// GET statistics
router.get('/statistics', busPermitController.getStatistics)

// GET expiring soon permits
router.get('/expiring-soon', busPermitController.getExpiringSoonPermits)

// GET expired permits
router.get('/expired', busPermitController.getExpiredPermits)

// GET pending payment permits
router.get('/pending', busPermitController.getPendingPermits)


// GET single Bus permit by ID
router.get('/:id', busPermitController.getPermitById)

// GET Bus permit by permit number
router.get('/number/:permitNumber', busPermitController.getPermitByNumber)

// POST create new Bus permit
router.post('/', busPermitController.createPermit)


// PUT update Bus permit
router.put('/:id', busPermitController.updatePermit)

// PATCH mark Bus permit as paid
router.patch('/:id/mark-as-paid', busPermitController.markAsPaid)

// PATCH increment WhatsApp message count
router.patch('/:id/whatsapp-increment', busPermitController.incrementWhatsAppCount)

// DELETE Bus permit
router.delete('/:id', busPermitController.deletePermit)


module.exports = router

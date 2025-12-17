const express = require('express')
const router = express.Router()
const cgPermitController = require('../controllers/cgPermitController')

// GET export all permits (must be before '/')
router.get('/export', cgPermitController.exportAllPermits)

// GET all CG permits
router.get('/', cgPermitController.getAllPermits)

// GET statistics
router.get('/statistics', cgPermitController.getStatistics)

// GET expiring soon permits
router.get('/expiring-soon', cgPermitController.getExpiringSoonPermits)

// GET expired permits
router.get('/expired', cgPermitController.getExpiredPermits)

// GET pending payment permits
router.get('/pending', cgPermitController.getPendingPermits)


// GET single CG permit by ID
router.get('/:id', cgPermitController.getPermitById)

// GET CG permit by permit number
router.get('/number/:permitNumber', cgPermitController.getPermitByNumber)

// POST create new CG permit
router.post('/', cgPermitController.createPermit)


// PUT update CG permit
router.put('/:id', cgPermitController.updatePermit)

// PATCH mark CG permit as paid
router.patch('/:id/mark-as-paid', cgPermitController.markAsPaid)

// PATCH increment WhatsApp message count
router.patch('/:id/whatsapp-increment', cgPermitController.incrementWhatsAppCount)

// DELETE CG permit
router.delete('/:id', cgPermitController.deletePermit)


module.exports = router

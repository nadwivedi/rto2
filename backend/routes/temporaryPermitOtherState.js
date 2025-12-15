const express = require('express')
const router = express.Router()
const temporaryPermitOtherStateController = require('../controllers/temporaryPermitOtherStateController')

// GET all temporary permits (other state)
router.get('/', temporaryPermitOtherStateController.getAllPermits)

// GET statistics
router.get('/statistics', temporaryPermitOtherStateController.getStatistics)

// GET expiring soon count
router.get('/expiring-soon-count', temporaryPermitOtherStateController.getExpiringSoonCount)

// GET expiring soon permits
router.get('/expiring-soon', temporaryPermitOtherStateController.getExpiringSoonPermits)

// GET expired permits
router.get('/expired', temporaryPermitOtherStateController.getExpiredPermits)

// GET pending payment permits
router.get('/pending', temporaryPermitOtherStateController.getPendingPermits)

// GET single temporary permit by ID
router.get('/:id', temporaryPermitOtherStateController.getPermitById)

// POST create new temporary permit (other state)
router.post('/', temporaryPermitOtherStateController.createPermit)


// PUT update temporary permit (other state)
router.put('/:id', temporaryPermitOtherStateController.updatePermit)

// PATCH mark temporary permit (other state) as paid
router.patch('/:id/mark-as-paid', temporaryPermitOtherStateController.markAsPaid)

// DELETE temporary permit (other state)
router.delete('/:id', temporaryPermitOtherStateController.deletePermit)

module.exports = router

const express = require('express')
const router = express.Router()
const nationalPermitController = require('../controllers/nationalPermitController')

// GET export all permits (must be before '/' to avoid conflicts)
router.get('/export', nationalPermitController.exportAllPermits)

// GET all national permits
router.get('/', nationalPermitController.getAllPermits)

// GET Part A expiring in next 30 days
router.get('/part-a-expiring-soon', nationalPermitController.getPartAExpiringSoon)

// GET Part B expiring in next 35 days
router.get('/part-b-expiring-soon', nationalPermitController.getPartBExpiringSoon)


// POST create new national permit
router.post('/', nationalPermitController.createPermit)

// PUT update national permit
router.put('/:id', nationalPermitController.updatePermit)

// PATCH mark national permit as paid
router.patch('/:id/mark-as-paid', nationalPermitController.markAsPaid)

// DELETE national permit
router.delete('/:id', nationalPermitController.deletePermit)

// POST renew Part A (National Permit)
router.post('/:id/renew-part-a', nationalPermitController.renewPartA)

// GET Part A renewal history
router.get('/:id/part-a-history', nationalPermitController.getPartARenewalHistory)


// ========== Part B Renewal Routes ==========

// POST renew Part B authorization
router.post('/:id/renew-part-b', nationalPermitController.renewPartB)

// GET Part B renewal history
router.get('/:id/part-b-history', nationalPermitController.getPartBRenewalHistory)


module.exports = router

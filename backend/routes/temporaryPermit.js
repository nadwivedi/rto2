const express = require('express')
const router = express.Router()
const temporaryPermitController = require('../controllers/temporaryPermitController')

// GET all temporary permits
router.get('/', temporaryPermitController.getAllPermits)

// GET statistics
router.get('/statistics', temporaryPermitController.getStatistics)

// GET expiring permits
router.get('/expiring', temporaryPermitController.getExpiringPermits)

// POST share permit via WhatsApp (must be before /:id route)
router.post('/:id/share', temporaryPermitController.sharePermit)

// GET single temporary permit by ID
router.get('/:id', temporaryPermitController.getPermitById)

// GET temporary permit by permit number
router.get('/number/:permitNumber', temporaryPermitController.getPermitByNumber)

// POST create new temporary permit
router.post('/', temporaryPermitController.createPermit)

// PUT update temporary permit
router.put('/:id', temporaryPermitController.updatePermit)

// DELETE temporary permit
router.delete('/:id', temporaryPermitController.deletePermit)

// PATCH update permit status
router.patch('/:id/status', temporaryPermitController.updatePermitStatus)

module.exports = router

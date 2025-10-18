const express = require('express')
const router = express.Router()
const nationalPermitController = require('../controllers/nationalPermitController')

// GET all national permits
router.get('/', nationalPermitController.getAllPermits)

// GET statistics
router.get('/statistics', nationalPermitController.getStatistics)

// POST add demo data (15 national permits)
router.post('/demo-data', nationalPermitController.addDemoData)

// GET expiring permits
router.get('/expiring', nationalPermitController.getExpiringPermits)

// POST share permit via WhatsApp (must be before /:id route)
router.post('/:id/share', nationalPermitController.sharePermit)

// GET single national permit by ID
router.get('/:id', nationalPermitController.getPermitById)

// GET national permit by permit number
router.get('/number/:permitNumber', nationalPermitController.getPermitByNumber)

// POST create new national permit
router.post('/', nationalPermitController.createPermit)

// PUT update national permit
router.put('/:id', nationalPermitController.updatePermit)

// DELETE national permit
router.delete('/:id', nationalPermitController.deletePermit)

// PATCH update permit status
router.patch('/:id/status', nationalPermitController.updatePermitStatus)

// PATCH add renewal entry
router.patch('/:id/renewal', nationalPermitController.addRenewal)

// PATCH update insurance details
router.patch('/:id/insurance', nationalPermitController.updateInsurance)

// PATCH update tax details
router.patch('/:id/tax', nationalPermitController.updateTax)

module.exports = router

const express = require('express')
const router = express.Router()
const cgPermitController = require('../controllers/cgPermitController')

// GET all CG permits
router.get('/', cgPermitController.getAllPermits)

// GET statistics
router.get('/statistics', cgPermitController.getStatistics)

// GET expiring permits
router.get('/expiring', cgPermitController.getExpiringPermits)

// POST share permit via WhatsApp (must be before /:id route)
router.post('/:id/share', cgPermitController.sharePermit)

// GET single CG permit by ID
router.get('/:id', cgPermitController.getPermitById)

// GET CG permit by permit number
router.get('/number/:permitNumber', cgPermitController.getPermitByNumber)

// POST create new CG permit
router.post('/', cgPermitController.createPermit)

// PUT update CG permit
router.put('/:id', cgPermitController.updatePermit)

// DELETE CG permit
router.delete('/:id', cgPermitController.deletePermit)

// PATCH update permit status
router.patch('/:id/status', cgPermitController.updatePermitStatus)

// PATCH add renewal entry
router.patch('/:id/renewal', cgPermitController.addRenewal)

// PATCH update insurance details
router.patch('/:id/insurance', cgPermitController.updateInsurance)

// PATCH update tax details
router.patch('/:id/tax', cgPermitController.updateTax)

// POST generate bill PDF
router.post('/:id/generate-bill-pdf', cgPermitController.generateBillPDF)

// GET download bill PDF
router.get('/:id/download-bill-pdf', cgPermitController.downloadBillPDF)

module.exports = router

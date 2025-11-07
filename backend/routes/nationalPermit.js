const express = require('express')
const router = express.Router()
const nationalPermitController = require('../controllers/nationalPermitController')

// GET all national permits
router.get('/', nationalPermitController.getAllPermits)

// GET statistics
router.get('/statistics', nationalPermitController.getStatistics)


// GET expiring permits
router.get('/expiring', nationalPermitController.getExpiringPermits)

// GET Part A expiring in next 30 days
router.get('/part-a-expiring-soon', nationalPermitController.getPartAExpiringSoon)

// GET Part B expiring in next 35 days
router.get('/part-b-expiring-soon', nationalPermitController.getPartBExpiringSoon)

// POST share permit via WhatsApp (must be before /:id route)
router.post('/:id/share', nationalPermitController.sharePermit)

// POST generate bill PDF for a permit
router.post('/:id/generate-bill-pdf', nationalPermitController.generateBillPDF)

// GET download bill PDF for a permit
router.get('/:id/download-bill-pdf', nationalPermitController.downloadBillPDF)

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




// POST renew Part A (National Permit)
router.post('/:id/renew-part-a', nationalPermitController.renewPartA)

// GET Part A renewal history
router.get('/:id/part-a-history', nationalPermitController.getPartARenewalHistory)

// GET download Part A renewal bill PDF
router.get('/:id/part-a-renewals/:renewalId/download-pdf', nationalPermitController.downloadPartARenewalPDF)

// ========== Part B Renewal Routes ==========

// POST renew Part B authorization
router.post('/:id/renew-part-b', nationalPermitController.renewPartB)

// GET Part B renewal history
router.get('/:id/part-b-history', nationalPermitController.getPartBRenewalHistory)

// GET download Part B renewal bill PDF
router.get('/:id/part-b-renewals/:renewalId/download-pdf', nationalPermitController.downloadPartBRenewalPDF)

module.exports = router

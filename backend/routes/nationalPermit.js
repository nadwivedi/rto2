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

// POST generate bill PDF for a permit
router.post('/:id/generate-bill-pdf', nationalPermitController.generateBillPDF)

// GET download bill PDF for a permit
router.get('/:id/download-bill-pdf', nationalPermitController.downloadBillPDF)

// POST create new national permit
router.post('/', nationalPermitController.createPermit)

// PUT update national permit
router.put('/:id', nationalPermitController.updatePermit)

// DELETE national permit
router.delete('/:id', nationalPermitController.deletePermit)

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

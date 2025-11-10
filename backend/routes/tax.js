const express = require('express')
const router = express.Router()
const taxController = require('../controllers/taxController')

// Get all tax records
router.get('/', taxController.getAllTax)

// Get tax statistics
router.get('/statistics', taxController.getTaxStatistics)

// Get expiring soon tax records
router.get('/expiring-soon', taxController.getExpiringSoonTaxes);

// Get expired tax records
router.get('/expired', taxController.getExpiredTaxes);

// Get pending payment tax records
router.get('/pending-payment', taxController.getPendingPaymentTaxes);

// Get single tax record by ID
router.get('/:id', taxController.getTaxById)

// Create new tax record
router.post('/', taxController.createTax)

// Update tax record
router.put('/:id', taxController.updateTax)

// Delete tax record
router.delete('/:id', taxController.deleteTax)

// POST generate bill PDF
router.post('/:id/generate-bill-pdf', taxController.generateBillPDF)

// GET download bill PDF
router.get('/:id/download-bill-pdf', taxController.downloadBillPDF)

module.exports = router
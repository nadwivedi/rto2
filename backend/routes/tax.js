const express = require('express')
const router = express.Router()
const taxController = require('../controllers/taxController')

// GET export all tax records (must be before '/')
router.get('/export', taxController.exportAllTax)

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

// PATCH mark tax as paid
router.patch('/:id/mark-as-paid', taxController.markAsPaid)

// PATCH increment WhatsApp message count
router.patch('/:id/whatsapp-increment', taxController.incrementWhatsAppCount)

// Delete tax record
router.delete('/:id', taxController.deleteTax)


module.exports = router
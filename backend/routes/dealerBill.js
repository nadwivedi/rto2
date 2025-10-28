const express = require('express')
const router = express.Router()
const dealerBillController = require('../controllers/dealerBillController')

// Statistics (must be before :id routes)
router.get('/statistics', dealerBillController.getDealerBillStatistics)

// CRUD Operations
router.post('/', dealerBillController.createDealerBill)
router.get('/', dealerBillController.getAllDealerBills)
router.get('/:id', dealerBillController.getDealerBillById)
router.put('/:id', dealerBillController.updateDealerBill)
router.delete('/:id', dealerBillController.deleteDealerBill)

// Bill PDF Operations
router.post('/:id/generate-bill-pdf', dealerBillController.generateBillPDF)
router.get('/:id/download-bill-pdf', dealerBillController.downloadBillPDF)

// Payment Status
router.patch('/:id/payment-status', dealerBillController.updatePaymentStatus)

module.exports = router

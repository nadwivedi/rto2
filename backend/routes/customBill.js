const express = require('express')
const router = express.Router()
const customBillController = require('../controllers/customBillController')

// POST /api/custom-bills - Create new custom bill
router.post('/', customBillController.createCustomBill)

// GET /api/custom-bills - Get all custom bills
router.get('/', customBillController.getAllCustomBills)

// GET /api/custom-bills/:id - Get custom bill by ID
router.get('/:id', customBillController.getCustomBillById)

// DELETE /api/custom-bills/:id - Delete custom bill
router.delete('/:id', customBillController.deleteCustomBill)

module.exports = router

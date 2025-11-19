const express = require('express')
const router = express.Router()
const vehicleTransferController = require('../controllers/vehicleTransferController')

// GET all vehicle transfers
router.get('/', vehicleTransferController.getAllTransfers)

// GET statistics
router.get('/statistics', vehicleTransferController.getStatistics)

// GET single vehicle transfer by ID
router.get('/:id', vehicleTransferController.getTransferById)

// GET transfers by vehicle number
router.get('/vehicle/:vehicleNumber', vehicleTransferController.getTransfersByVehicle)

// POST create new vehicle transfer
router.post('/', vehicleTransferController.createTransfer)

// PUT update vehicle transfer
router.put('/:id', vehicleTransferController.updateTransfer)

// PATCH mark vehicle transfer as paid
router.patch('/:id/mark-as-paid', vehicleTransferController.markAsPaid)

// DELETE vehicle transfer
router.delete('/:id', vehicleTransferController.deleteTransfer)

module.exports = router

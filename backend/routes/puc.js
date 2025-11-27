const express = require('express')
const router = express.Router()
const pucController = require('../controllers/pucController')

// GET export all PUC records (must be before '/')
router.get('/export', pucController.exportAllPuc)

// Get all PUC records
router.get('/', pucController.getAllPuc)

// Get PUC statistics
router.get('/statistics', pucController.getPucStatistics)

// Get expiring soon PUC records
router.get('/expiring-soon', pucController.getExpiringSoonPuc)

// Get expired PUC records
router.get('/expired', pucController.getExpiredPuc)

// Get active PUC records
router.get('/active', pucController.getActivePuc)

// Get pending PUC records
router.get('/pending', pucController.getPendingPuc)

// Get single PUC record by ID
router.get('/id/:id', pucController.getPucById)

// Create new PUC record
router.post('/', pucController.createPuc)

// Renew PUC record
router.post('/renew', pucController.renewPuc)

// Update PUC record
router.put('/id/:id', pucController.updatePuc)

// PATCH mark PUC as paid
router.patch('/id/:id/mark-as-paid', pucController.markAsPaid)

// Delete PUC record
router.delete('/id/:id', pucController.deletePuc)


module.exports = router

const express = require('express')
const router = express.Router()
const insuranceController = require('../controllers/insuranceController')

// IMPORTANT: Specific routes must come BEFORE parameterized routes

// Get statistics (must be before /:id)
router.get('/statistics', insuranceController.getStatistics)

// Get expiring insurance records (must be before /:id)
router.get('/expiring', insuranceController.getExpiringInsurance)

// Get expiring soon insurance records
router.get('/expiring-soon', insuranceController.getExpiringSoonInsurance)

// Get expired insurance records
router.get('/expired', insuranceController.getExpiredInsurance)

// Get pending payment insurance records
router.get('/pending', insuranceController.getPendingInsurance)

// Get insurance by policy number (must be before general /:id)
router.get('/policy/:policyNumber', insuranceController.getInsuranceByPolicyNumber)

// Get all insurance records with pagination and filters
router.get('/', insuranceController.getAllInsurance)

// Create new insurance record
router.post('/', insuranceController.createInsurance)

// Get single insurance record by ID
router.get('/:id', insuranceController.getInsuranceById)

// Update insurance record
router.put('/:id', insuranceController.updateInsurance)

// Delete insurance record
router.delete('/:id', insuranceController.deleteInsurance)

module.exports = router

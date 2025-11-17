const express = require('express')
const router = express.Router()
const fitnessController = require('../controllers/fitnessController')

// GET export all fitness records (must be before '/')
router.get('/export', fitnessController.exportAllFitness)

// Get all fitness records
router.get('/', fitnessController.getAllFitness)

// Get fitness statistics
router.get('/statistics', fitnessController.getFitnessStatistics)

// Get expiring soon fitness records
router.get('/expiring-soon', fitnessController.getExpiringSoonFitness)

// Get expired fitness records
router.get('/expired', fitnessController.getExpiredFitness)

// Get active fitness records
router.get('/active', fitnessController.getActiveFitness)

// Get pending fitness records
router.get('/pending', fitnessController.getPendingFitness)

// Get single fitness record by ID
router.get('/id/:id', fitnessController.getFitnessById)

// Create new fitness record
router.post('/', fitnessController.createFitness)

// Renew fitness record
router.post('/renew', fitnessController.renewFitness)

// Update fitness record
router.put('/id/:id', fitnessController.updateFitness)

// Delete fitness record
router.delete('/id/:id', fitnessController.deleteFitness)


module.exports = router

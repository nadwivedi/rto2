const express = require('express')
const router = express.Router()
const fitnessController = require('../controllers/fitnessController')

// Get all fitness records
router.get('/', fitnessController.getAllFitness)

// Get fitness statistics
router.get('/statistics', fitnessController.getFitnessStatistics)

// Get single fitness record by ID
router.get('/:id', fitnessController.getFitnessById)

// Create new fitness record
router.post('/', fitnessController.createFitness)

// Update fitness record
router.put('/:id', fitnessController.updateFitness)

// Delete fitness record
router.delete('/:id', fitnessController.deleteFitness)

module.exports = router

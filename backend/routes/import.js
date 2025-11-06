const express = require('express')
const router = express.Router()
const importController = require('../controllers/importController')

// Get supported data types
router.get('/data-types', importController.getDataTypes)

// Get sample structure for a data type
router.get('/sample/:dataType', importController.getSampleStructure)

// Validate data before import
router.post('/validate', importController.validateData)

// Import data
router.post('/', importController.importData)

module.exports = router

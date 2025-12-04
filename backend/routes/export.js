const express = require('express')
const router = express.Router()
const exportController = require('../controllers/exportController')

// Get export statistics
router.get('/statistics', exportController.getExportStatistics)

// Export all data combined in one zip file
router.get('/all-combined', exportController.exportAllDataCombined)

// Export all data organized by user in separate folders
router.get('/all-user-wise', exportController.exportAllDataUserWise)

module.exports = router

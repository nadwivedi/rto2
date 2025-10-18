const express = require('express')
const router = express.Router()
const drivingLicenseController = require('../controllers/drivingLicenseController')

// GET all driving license applications
router.get('/', drivingLicenseController.getAllApplications)

// GET statistics
router.get('/statistics', drivingLicenseController.getStatistics)

// POST add demo data (15 driving licenses)
router.post('/demo-data', drivingLicenseController.addDemoData)

// GET single driving license application by ID
router.get('/:id', drivingLicenseController.getApplicationById)

// POST create new driving license application
router.post('/', drivingLicenseController.createApplication)

// PUT update driving license application
router.put('/:id', drivingLicenseController.updateApplication)

// DELETE driving license application
router.delete('/:id', drivingLicenseController.deleteApplication)

// PATCH add payment to application
router.patch('/:id/payment', drivingLicenseController.addPayment)

// PATCH update application status
router.patch('/:id/status', drivingLicenseController.updateApplicationStatus)

// PATCH update license status (learning to full)
router.patch('/:id/license-status', drivingLicenseController.updateLicenseStatus)

module.exports = router

const express = require('express')
const router = express.Router()
const drivingLicenseController = require('../controllers/drivingLicenseController')

// GET export all applications (must be before '/')
router.get('/export', drivingLicenseController.exportAllApplications)

// GET all driving license applications
router.get('/', drivingLicenseController.getAllApplications)

// GET statistics
router.get('/statistics', drivingLicenseController.getStatistics)

// GET license expiry report
router.get('/expiry-report', drivingLicenseController.getLicenseExpiryReport)

// GET learning licenses expiring in next 30 days
router.get('/ll-expiring-soon', drivingLicenseController.getLearningLicensesExpiringSoon)

// GET driving licenses expiring in next 30 days
router.get('/dl-expiring-soon', drivingLicenseController.getDrivingLicensesExpiringSoon)

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

// PATCH mark driving license as paid
router.patch('/:id/mark-as-paid', drivingLicenseController.markAsPaid)

// PATCH update application status
router.patch('/:id/status', drivingLicenseController.updateApplicationStatus)

// PATCH update license status (learning to full)
router.patch('/:id/license-status', drivingLicenseController.updateLicenseStatus)

module.exports = router

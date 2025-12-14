const express = require('express')
const router = express.Router()
const uploadController = require('../controllers/uploadController')

// POST upload RC image/PDF (base64, max 12MB)
router.post('/rc-image', uploadController.uploadRCImage)

// DELETE RC image
router.delete('/rc-image', uploadController.deleteRCImage)

// POST upload Aadhar image/PDF (base64, max 12MB)
router.post('/aadhar-image', uploadController.uploadAadharImage)

// POST upload PAN image/PDF (base64, max 12MB)
router.post('/pan-image', uploadController.uploadPanImage)

// POST upload Insurance Document image/PDF (base64, max 12MB)
router.post('/insurance-document', uploadController.uploadInsuranceDocument)

module.exports = router

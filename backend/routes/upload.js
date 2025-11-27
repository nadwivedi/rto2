const express = require('express')
const router = express.Router()
const uploadController = require('../controllers/uploadController')

// POST upload RC image (base64 WebP, max 12MB)
router.post('/rc-image', uploadController.uploadRCImage)

// DELETE RC image
router.delete('/rc-image', uploadController.deleteRCImage)

module.exports = router

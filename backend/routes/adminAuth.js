const express = require('express')
const router = express.Router()
const adminAuthController = require('../controllers/adminAuthController')
const adminAuthMiddleware = require('../middleware/adminAuth')

// Admin authentication routes
router.post('/login', adminAuthController.login)
router.get('/profile', adminAuthMiddleware, adminAuthController.getProfile)
router.post('/logout', adminAuthMiddleware, adminAuthController.logout)

module.exports = router

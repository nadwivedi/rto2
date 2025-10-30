const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authMiddleware = require('../middleware/auth')

// Login route
router.post('/login', authController.login)

// Verify token route (protected)
router.get('/verify', authMiddleware, authController.verifyToken)

// Logout route (protected)
router.post('/logout', authMiddleware, authController.logout)

module.exports = router

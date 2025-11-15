const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authMiddleware = require('../middleware/auth')
const userAuthMiddleware = require('../middleware/userAuth')

// Admin login routes
router.post('/login', authController.login)

// Verify token route (protected)
router.get('/verify', authMiddleware, authController.verifyToken)

// Logout route (protected)
router.post('/logout', authMiddleware, authController.logout)

// User login routes
router.post('/user/login', authController.userLogin)

// Verify user token route (protected)
router.get('/user/verify', userAuthMiddleware, authController.verifyUserToken)

module.exports = router

const express = require('express')
const router = express.Router()
const adminUserController = require('../controllers/adminUserController')

// Get user statistics
router.get('/statistics', adminUserController.getUserStatistics)

// Get all users
router.get('/', adminUserController.getAllUsers)

// Get single user by ID
router.get('/:id', adminUserController.getUserById)

// Create new user
router.post('/', adminUserController.createUser)

// Update user
router.put('/:id', adminUserController.updateUser)

// Delete user
router.delete('/:id', adminUserController.deleteUser)

module.exports = router

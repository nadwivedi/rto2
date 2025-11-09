const express = require('express')
const router = express.Router()
const temporaryPermitOtherStateController = require('../controllers/temporaryPermitOtherStateController')

// GET all temporary permits (other state)
router.get('/', temporaryPermitOtherStateController.getAllPermits)

// GET expiring soon count
router.get('/expiring-soon-count', temporaryPermitOtherStateController.getExpiringSoonCount)

// GET single temporary permit by ID
router.get('/:id', temporaryPermitOtherStateController.getPermitById)

// POST create new temporary permit (other state)
router.post('/', temporaryPermitOtherStateController.createPermit)

// PUT update temporary permit (other state)
router.put('/:id', temporaryPermitOtherStateController.updatePermit)

// DELETE temporary permit (other state)
router.delete('/:id', temporaryPermitOtherStateController.deletePermit)

module.exports = router

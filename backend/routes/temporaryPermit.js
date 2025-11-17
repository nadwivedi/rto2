const express = require('express')
const router = express.Router()
const temporaryPermitController = require('../controllers/temporaryPermitController')

// GET export all permits (must be before '/')
router.get('/export', temporaryPermitController.exportAllPermits)

// GET all temporary permits
router.get('/', temporaryPermitController.getAllPermits)

// GET statistics
router.get('/statistics', temporaryPermitController.getStatistics)

// GET expiring soon permits
router.get('/expiring-soon', temporaryPermitController.getExpiringSoonPermits)

// GET expired permits
router.get('/expired', temporaryPermitController.getExpiredPermits)

// GET pending payment permits
router.get('/pending', temporaryPermitController.getPendingPermits)


// GET single temporary permit by ID
router.get('/:id', temporaryPermitController.getPermitById)

// GET temporary permit by permit number
router.get('/number/:permitNumber', temporaryPermitController.getPermitByNumber)

// POST create new temporary permit
router.post('/', temporaryPermitController.createPermit)

// POST renew temporary permit
router.post('/renew', temporaryPermitController.renewPermit)

// PUT update temporary permit
router.put('/:id', temporaryPermitController.updatePermit)

// DELETE temporary permit
router.delete('/:id', temporaryPermitController.deletePermit)


module.exports = router

const express = require('express')
const router = express.Router()
const nocController = require('../controllers/nocController')

router.get('/', nocController.getAllNoc)
router.get('/statistics', nocController.getNocStatistics)
router.get('/pending', nocController.getPendingNoc)
router.get('/:id', nocController.getNocById)
router.post('/', nocController.createNoc)
router.put('/:id', nocController.updateNoc)
router.patch('/:id/mark-as-paid', nocController.markAsPaid)
router.delete('/:id', nocController.deleteNoc)

module.exports = router

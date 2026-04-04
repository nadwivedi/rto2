const express = require('express')
const { getDayBook } = require('../controllers/dayBookController')

const router = express.Router()

router.get('/', getDayBook)

module.exports = router

const express = require('express');
const router = express.Router();
const { rcOcr, taxOcr, fitnessOcr, pucOcr } = require('../controllers/rcOcrController');

// POST /api/ocr/rc
router.post('/rc', rcOcr);

// POST /api/ocr/tax
router.post('/tax', taxOcr);

// POST /api/ocr/fitness
router.post('/fitness', fitnessOcr);

// POST /api/ocr/puc
router.post('/puc', pucOcr);

module.exports = router;

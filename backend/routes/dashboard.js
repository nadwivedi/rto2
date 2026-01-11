const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');

// Route to get all dashboard data
// The 'userAuth' middleware is already applied in index.js for this route group
router.get('/', getDashboardData);

module.exports = router;

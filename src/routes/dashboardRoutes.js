const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { getDashboardSummary, getSocietyDashboard, getUserSocietyCards } = require('../controllers/dashboardController');


router.get('/summary', authMiddleware, getDashboardSummary);

//
router.get('/society/:id', authMiddleware, getSocietyDashboard);

//for user dashboard and sidebr
router.get('/societies', authMiddleware, getUserSocietyCards);

module.exports = router;
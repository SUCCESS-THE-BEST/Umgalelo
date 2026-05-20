const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { getDashboardSummary, getSocietyDashboard, getUserSocietyCards, getUserEvents } = require('../controllers/dashboardController');


router.get('/summary', authMiddleware, getDashboardSummary);
router.get('/society/:id', authMiddleware, getSocietyDashboard);
router.get('/societies', authMiddleware, getUserSocietyCards);
router.get("/events", authMiddleware, getUserEvents);

module.exports = router;
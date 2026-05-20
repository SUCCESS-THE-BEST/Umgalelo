const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  makeContribution,
  getUserContributionHistory,
  getSocietyContributionHistory,
  sendPaymentReminders,
} = require('../controllers/contributionController');

router.post('/contribute/:id', authMiddleware, makeContribution);
router.get('/my-history', authMiddleware, getUserContributionHistory);
router.get('/history/:id', authMiddleware, getSocietyContributionHistory);
router.post('/reminders/:id', authMiddleware, sendPaymentReminders)

module.exports = router;
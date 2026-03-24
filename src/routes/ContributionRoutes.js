const express = require('express');
const router = express.Router();
const { AddContribution } = require('../controllers/ContributionControllers');

router.post('/AddContribution', AddContribution)

module.exports = router;
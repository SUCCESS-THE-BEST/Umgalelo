const express = require('express');
const router = express.Router();
const { AddContribution, SubmitClaim, ApproveClaim, RejectClaim } = require('../controllers/FinancialControllers');

router.post('/AddContribution', AddContribution)
router.post('/SubmitClaim', SubmitClaim)
router.put('/ApproveClaim', ApproveClaim);
router.put('/RejectClaim', RejectClaim)

module.exports = router;
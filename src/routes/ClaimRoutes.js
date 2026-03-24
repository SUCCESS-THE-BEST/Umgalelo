const express = require('express');
const router = express.Router();
const {SubmitClaim, ApproveClaim, RejectClaim } = require('../controllers/ClaimControllers');

router.post('/SubmitClaim', SubmitClaim);
router.put('/ApproveClaim', ApproveClaim);
router.put('/RejectClaim', RejectClaim);

module.exports = router;
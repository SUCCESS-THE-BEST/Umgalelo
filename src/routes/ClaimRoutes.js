const express = require('express');
const router = express.Router();
const {SubmitClaim, ApproveClaim, RejectClaim, GetClaimsBySociety } = require('../controllers/ClaimControllers');

router.post('/SubmitClaim', SubmitClaim);
router.put('/ApproveClaim', ApproveClaim);
router.put('/RejectClaim', RejectClaim);
router.get('/claims/society/:societyId', GetClaimsBySociety);

module.exports = router;
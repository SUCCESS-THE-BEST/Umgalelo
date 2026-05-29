const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const claimController = require('../controllers/claimsController');

router.post('/claim/:id', authMiddleware, claimController.submitClaim);

router.get('/fetch/:id', authMiddleware, claimController.getClaims)

router.put("/handle/:id", authMiddleware, claimController.updateClaimStatus);

router.get('/summary/:id', authMiddleware, claimController.getClaimsSummary);

module.exports = router;
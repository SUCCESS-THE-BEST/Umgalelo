const express = require('express');
const router = express.Router();

const { ProcessContribution, GetContributionsBySociety, GetContributionsByUser, GetSocietyWallet } = require('../controllers/ContributionControllers');

router.post('/contribute', ProcessContribution);
router.get('/contributions/society/:societyId', GetContributionsBySociety);
router.get('/contributions/user/:userId', GetContributionsByUser);
router.get('/wallet/:societyId', GetSocietyWallet);

module.exports = router;
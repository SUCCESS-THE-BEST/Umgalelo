const express = require('express');
const router = express.Router();

const { processContributionController, GetContributionsBySociety, GetContributionsByUser, GetSocietyWallet } = require('../controllers/contributionController');

router.post('/contribute', processContributionController);
router.get('/contributions/society/:societyId', GetContributionsBySociety);
router.get('/contributions/user/:userId', GetContributionsByUser);
router.get('/wallet/:societyId', GetSocietyWallet);

module.exports = router;
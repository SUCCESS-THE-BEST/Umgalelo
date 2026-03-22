const express = require('express');
const router = express.Router();
const { createSociety,joinRequest,addmember,listmembers} = require('../controllers/societyControllers');


router.post('/create_society', createSociety);
router.post('/join_request',joinRequest);




module.exports = router;
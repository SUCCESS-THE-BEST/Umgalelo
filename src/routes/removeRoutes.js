const express = require('express');
const router = express.Router();
const { removeMembers} = require('../controllers/removeController');


router.delete('/removeMember/:societyID/:userID', removeMembers);


module.exports = router;
const express = require('express');
const router = express.Router();
const { addmember,listmembers,listJoinRequest,listAdminSocieties,removeMembers} = require('../controllers/adminController');



router.post('/addMember',addmember);
router.get('/listmembers/:societyID', listmembers);
router.get('/listrequest/:societyID', listJoinRequest);
router.get('/listadminSocieties/:adminID', listAdminSocieties);
router.delete('/removeMember/:societyID/:userID', removeMembers);

module.exports = router;
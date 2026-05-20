const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
  createSociety,
  requestToJoin,
  getMySocieties,
  getJoinRequests,
  approveRequest,
  rejectRequest,
  getAllSocieties,
  getSocietyMembers,
  getSocietyDetails,
  handleJoinRequest
} = require('../controllers/societyController');

//society page
router.get('/society/:id', authMiddleware, getSocietyDetails);

//browse page
router.get("/browse", authMiddleware, getAllSocieties);

router.post('/create', authMiddleware, createSociety);
router.get('/my', authMiddleware, getMySocieties);

router.post('/join/request', authMiddleware, requestToJoin);

router.put('/:id/requests', authMiddleware, handleJoinRequest);

router.put('/requests/:id/approve', authMiddleware, approveRequest);
router.put('/requests/:id/reject', authMiddleware, rejectRequest);

router.get('/:id/members', authMiddleware, getSocietyMembers);

module.exports = router;
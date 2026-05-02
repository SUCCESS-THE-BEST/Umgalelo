const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  submitRequest,
  getJoinRequests,
  handleJoinRequest
} = require('../controllers/joinRequestController');

router.post('/request', authMiddleware, submitRequest);
router.put('/:id/requests', authMiddleware, handleJoinRequest);

module.exports = router
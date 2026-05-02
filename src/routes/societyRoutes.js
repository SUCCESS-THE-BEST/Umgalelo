const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
  createSociety,
  getUserSocieties,
  getAllSocieties,
  getSocietyDetails,
} = require('../controllers/societyController');

//society page
router.get('/society/:id', authMiddleware, getSocietyDetails);

//browse page
router.get("/browse", authMiddleware, getAllSocieties);

//create socity
router.post('/create', authMiddleware, createSociety);
router.get('/my-societies', authMiddleware, getUserSocieties);


module.exports = router;
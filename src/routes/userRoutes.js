const express = require('express');
const router = express.Router();
const { getUser,
    updateContactDetails,
    updateUserAddress,
    updateNextOfKin,
    updateProfile  } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/:id', authMiddleware, getUser);
router.put('/:id/contactDetails', authMiddleware, updateContactDetails);
router.put('/:id/address', authMiddleware, updateUserAddress);
router.put('/:id/kin', authMiddleware, updateNextOfKin);
router.put('/update', authMiddleware, updateProfile);

module.exports = router;

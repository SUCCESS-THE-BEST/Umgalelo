const express = require('express');
const router = express.Router();
const { getUser,
    updateContactDetails,
    updateUserAddress,
    updateNextOfKin,
    updateProfile,
    uploadDocuments  } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');


router.get('/:id', authMiddleware, getUser);
router.put('/:id/contactDetails', authMiddleware, updateContactDetails);
router.put('/:id/address', authMiddleware, updateUserAddress);
router.put('/:id/kin', authMiddleware, updateNextOfKin);
router.put('/update', authMiddleware, updateProfile);

router.put('/upload-documents', authMiddleware, upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 },
    { name: 'bankingProof', maxCount: 1 }
]), uploadDocuments);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getUser,
    updateProfile,
    uploadDocuments,
    leaveSociety  } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');


router.get('/:id', authMiddleware, getUser);
router.put('/update', authMiddleware, updateProfile);

router.put('/upload-documents', authMiddleware, upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 },
    { name: 'bankingProof', maxCount: 1 }
]), uploadDocuments);

router.delete('/leave/:societyId', authMiddleware, leaveSociety);

module.exports = router;

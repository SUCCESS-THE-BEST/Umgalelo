const express = require('express');
const router = express.Router();

const {
    getUser,
    updateProfile,
    uploadDocuments,
    leaveSociety
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const handleUploadErrors = (err, req, res, next) => {
    if (err) {
        return res.status(400).json({
            message: err.message || 'File upload failed'
        });
    }

    next();
};

router.get('/:id', authMiddleware, getUser);

router.put('/update', authMiddleware, updateProfile);

router.put(
    '/upload-documents',
    authMiddleware,
    upload.fields([
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'idDocument', maxCount: 1 },
        { name: 'bankingProof', maxCount: 1 }
    ]),
    handleUploadErrors,
    uploadDocuments
);

router.delete('/leave/:societyId', authMiddleware, leaveSociety);

module.exports = router;
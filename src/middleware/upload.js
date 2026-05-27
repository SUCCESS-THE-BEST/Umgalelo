const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'umgalelo/profile',
    allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1E9);

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG and PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;
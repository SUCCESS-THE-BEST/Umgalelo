const express = require('express');
const router = express.Router();
const { register, login, getProfile, verifyUser, forgotPassword, resetPassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/register', register);

router.get('/verify/:token', verifyUser)

router.post('/login', login);

router.get('/profile', authMiddleware, getProfile);

// Redirect to Google
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

// Callback
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/login.html'
    }),
    (req, res) => {
        const user = req.user;

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.redirect(
            `http://127.0.0.1:5501/src/view/html/dashboard.html?token=${token}`
        );
    }
);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);


module.exports = router;



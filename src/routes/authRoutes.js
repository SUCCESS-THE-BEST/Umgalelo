const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

const {
    register,
    login,
    getProfile,
    verifyUser,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');
const { validateRegister } = require('../middleware/validator/authValidator');

const {
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter,
    googleLimiter
} = require('../middleware/rateLimiter');

const FRONTEND_URL =
    process.env.FRONTEND_URL || 'http://127.0.0.1:5501';

router.post('/register', registerLimiter, validateRegister, register);

router.get('/verify/:token', verifyUser);

router.post('/login', loginLimiter, login);

router.get('/profile', authMiddleware, getProfile);

router.get(
    '/google',
    googleLimiter,
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${FRONTEND_URL}/src/view/html/login.html`
    }),
    (req, res) => {
        const user = req.user;

        const token = jwt.sign(
            {
                userId: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.redirect(
            `${FRONTEND_URL}/src/view/html/dashboard.html?token=${token}`
        );
    }
);

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);

router.post('/reset-password', resetPassword);

module.exports = router;
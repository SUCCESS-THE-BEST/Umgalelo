const rateLimit = require('express-rate-limit');

// Login limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        message: 'Too many login attempts. Try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Register limiter
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        message: 'Too many registrations. Try again later.'
    }
});

// Forgot password limiter
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        message: 'Too many password reset requests.'
    }
});

const googleLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        message: 'Too many Google login attempts.'
    }
});

module.exports = {
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter,
    googleLimiter
};
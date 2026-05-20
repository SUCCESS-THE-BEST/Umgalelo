const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailServices');
const notificationModel = require('../models/notifications');

// ================== REGISTER ACCOUNT =====================
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, idNumber, password } = req.body;

        // check if user exists
        const exists = await userModel.findUserByEmail(email);
        if (exists.length > 0) {
            return res.status(400).json({message: 'user already exists'});
        }

        //hash passowrd
        const hashedPassowrd = await bcrypt.hash(password, 10);

        //google OAuth token
        const token = crypto.randomBytes(32).toString('hex');

        const result = await userModel.createUser(firstName, lastName, email, phone, idNumber, hashedPassowrd, token);

        //Build verification link
        const verifyLink = `http://127.0.0.1:3000/api/auth/verify/${token}`;

        //Send email
        await sendEmail(
        email,
        'Verify your Umgalelo account',
        `
            <h2>Welcome to Umgalelo</h2>
            <p>Click below to verify your account:</p>
            <a href="${verifyLink}">Verify Account</a>
        `
        );

        //send welcome notification
        const user = await userModel.findUserByEmail(email);

        await notificationModel.createNotification(
            user[0].user_id,
            null,
            'Welcome to Umgalelo, join or create a society to start your journey',
            'welcome'
        );

        res.status(201).json({
        message: 'User registered. Please check your email to verify your account.'
        });
        // res.status(200).json({ message: 'user registered successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const verifyUser = async (req, res) => {
  const { token } = req.params;

  const [user] = await userModel.findByVerificationToken(token);

  if (!user) {
    return res.send('Invalid or expired token');
  }

  await userModel.markUserAsVerified(token);

  res.redirect('http://127.0.0.1:5501/src/view/html/login.html');
};


// ================ LOGIN =================
const login = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const {email, password} = req.body;

        const [user] = await userModel.findUserByEmail(email);

        if (!user) {
            return res.status(400).json({ message: 'invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'invalid credentials' });
        }

        //web token
        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.json({ token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// =============== GET USER PROFILE ======================
const getProfile = async (req, res) => {
    try {
        const user = await userModel.findUserById(req.user.userId);
        res.json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ======================== FORGOT PASSWORD =========================
const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        const [user] = await userModel.findUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const resetToken =
            crypto.randomBytes(32).toString('hex');

        const expiry =
            new Date(Date.now() + 1000 * 60 * 30);

        await userModel.setResetToken(
            email,
            resetToken,
            expiry
        );

        const resetLink =
        `http://127.0.0.1:5501/src/view/html/resetPassword.html?token=${resetToken}`;

        await sendEmail(
            email,
            'Reset your password',
            `
            <h2>Password Reset</h2>

            <p>Click below to reset your password:</p>

            <a href="${resetLink}">
                Reset Password
            </a>
            `
        );

        res.json({
            message: 'Password reset email sent'
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};


// ===================== RESET PASSWORD =========================
const resetPassword = async (req, res) => {

    try {

        const { token, password } = req.body;

        const [user] =
            await userModel.findByResetToken(token);

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired token'
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        await userModel.updatePassword(
            user.user_id,
            hashedPassword
        );

        res.json({
            message: 'Password reset successful'
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    verifyUser,
    forgotPassword,
    resetPassword
};
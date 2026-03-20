const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const { validationResult } = require('express-validator');

//login and register

const register = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, idNumber, password } = req.body;

        if (!firstName || !lastName || !email || !phone || !idNumber || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (idNumber.length !== 13) {
            return res.status(400).json({ message: 'Invalid ID number' });
        }

        if (!phone.startsWith('0')) {
            return res.status(400).json({ message: 'Invalid phone number' });
        }

        if (!email || !email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        const exists = await userModel.findUserByEmail(email);

        if (exists) {
            return res.status(400).json({message: 'user already exists'});
        }

        const hashedPassowrd = await bcrypt.hash(password, 10);

        await userModel.createUser(firstName, lastName, email, phone, idNumber, hashedPassowrd);

        res.status(200).json({ message: 'user registered successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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

const getProfile = async (req, res) => {
    try {
        const user = await userModel.findUserById(req.user.userId);
        res.json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    getProfile
};
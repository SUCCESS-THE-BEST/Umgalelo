require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('./config/passport');

const app = express();

app.set('trust proxy', 1);

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'https://success-the-best.github.io',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.get('/', (req, res) => {
    res.json({
        message: 'Umgalelo API is running'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        environment: process.env.NODE_ENV || 'development'
    });
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const societyRoutes = require('./routes/societyRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const joinReqRoutes = require('./routes/joinRequestRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const claimsRoutes = require('./routes/claimRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/joinRequest', joinReqRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        message: err.message || 'Server error'
    });
});

module.exports = app;
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const app = express();
const path = require('path')


app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());

app.use(passport.initialize());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const societyRoutes = require('./routes/societyRoutes');
app.use('/api/societies', societyRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// const financeRoutes = require('./routes/financeRoutes');
// app.use('/api/finance', financeRoutes);

const joinReqRoutes = require('./routes/joinRequestRoutes');
app.use('/api/joinRequest', joinReqRoutes);

const contributionRoutes = require('./routes/contributionRoutes');
app.use('/api/contributions', contributionRoutes);

const claimsRoutes = require('./routes/claimRoutes');
app.use('/api/claims', claimsRoutes);

const eventsRoutes = require('./routes/eventsRoutes');
app.use('/api/events', eventsRoutes);

const notificationRoutes = require('./routes/notificationRoutes')
app.use('/api/notifications', notificationRoutes)

const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

app.use('/uploads', express.static('uploads'));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, './view/html/login.html'));
// });

module.exports = app;
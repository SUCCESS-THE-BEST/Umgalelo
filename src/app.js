const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());

app.use(cors({
  origin: ['http://127.0.0.1:5501', 'http://localhost:5501'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const societyRoutes = require('./routes/societyRoutes');
app.use('/api/societies', societyRoutes);


const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

const joinReqRoutes = require('./routes/joinRequestRoutes');
app.use('/api/joinRequest', joinReqRoutes);

const claimRoutes = require('./routes/claimRoutes');
app.use('/api/claimRoute', claimRoutes);

const contributionRoutes = require('./routes/contributionRoutes');
app.use('/api/contributionRoute', contributionRoutes);

app.use(cors());

app.get('/', (req, res) => {
  res.send('Umgalelo API running...');
});

module.exports = app;
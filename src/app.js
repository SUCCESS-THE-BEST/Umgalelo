const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

app.use(cors());

app.get('/', (req, res) => {
  res.send('Umgalelo API running...');
});

module.exports = app;
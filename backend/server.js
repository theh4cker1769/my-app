require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const users = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', users);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Gym API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🏋️ Gym API server running on port ${PORT}`));
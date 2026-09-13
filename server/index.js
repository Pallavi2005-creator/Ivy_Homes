require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const rentalsRoutes = require('./routes/rentals');
const projectsRoutes = require('./routes/projects');
const savedRoutes = require('./routes/saved');
const insightsRoutes = require('./routes/insights');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/rentals', rentalsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/insights', insightsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

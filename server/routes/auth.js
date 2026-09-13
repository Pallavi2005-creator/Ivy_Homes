const express = require('express');
const router = express.Router();
const { ivyClient } = require('../middleware/proxy');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const client = ivyClient(); // no token yet
    const response = await client.post('/auth/login', req.body);
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers['authorization']?.slice(7);
    if (!token) return res.json({ message: 'Logged out' });
    const client = ivyClient(token);
    await client.post('/auth/logout');
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.json({ message: 'Logged out' }); // always succeed client-side
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const client = ivyClient();
    const response = await client.post('/auth/refresh', req.body);
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Refresh failed' });
  }
});

module.exports = router;

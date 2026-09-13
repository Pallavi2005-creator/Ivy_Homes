const express = require('express');
const router = express.Router();
const { ivyClient, extractToken } = require('../middleware/proxy');

// GET /api/saved — list saved listings (correct path is /v1/saved, not /v1/favourites)
router.get('/', async (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ detail: 'Not authenticated' });
    const client = ivyClient(token);
    const response = await client.get('/v1/saved');
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Failed to fetch saved listings' });
  }
});

// POST /api/saved — add a listing to saved
router.post('/', async (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ detail: 'Not authenticated' });
    const client = ivyClient(token);
    // The API body is { "listing_id": "..." }
    const response = await client.post('/v1/saved', req.body);
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Failed to save listing' });
  }
});

// DELETE /api/saved/:id — remove a saved listing
router.delete('/:id', async (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ detail: 'Not authenticated' });
    const client = ivyClient(token);
    const response = await client.delete(`/v1/saved/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Failed to remove saved listing' });
  }
});

module.exports = router;

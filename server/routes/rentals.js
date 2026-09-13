const express = require('express');
const router = express.Router();
const { ivyClient, extractToken } = require('../middleware/proxy');

// GET /api/rentals — paginated, filtered
router.get('/', async (req, res) => {
  try {
    const token = extractToken(req);
    const client = ivyClient(token);
    const { locality, bhk, furnishing, offset = 0, limit = 20 } = req.query;

    const params = { limit, offset };
    if (locality) params.locality = locality;
    if (bhk) params.bhk = bhk;
    if (furnishing) params.furnishing = furnishing;

    const response = await client.get('/v1/rentals', { params });
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Failed to fetch rentals' });
  }
});

// GET /api/rentals/:id
router.get('/:id', async (req, res) => {
  try {
    const token = extractToken(req);
    const client = ivyClient(token);
    const response = await client.get(`/v1/rentals/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Rental not found' });
  }
});

module.exports = router;

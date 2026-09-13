const express = require('express');
const router = express.Router();
const { ivyClient, extractToken } = require('../middleware/proxy');

// GET /api/listings — paginated, filtered
router.get('/', async (req, res) => {
  try {
    const token = extractToken(req);
    const client = ivyClient(token);
    const { locality, bhk, min_price, max_price, furnishing, offset = 0, limit = 20 } = req.query;

    const params = { limit, offset };
    if (locality) params.locality = locality;
    if (bhk) params.bhk = bhk;
    if (min_price) params.min_price = min_price;
    if (max_price) params.max_price = max_price;
    if (furnishing) params.furnishing = furnishing;

    const response = await client.get('/v1/listings', { params });
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Failed to fetch listings' });
  }
});

// GET /api/listings/:id — single listing
router.get('/:id', async (req, res) => {
  try {
    const token = extractToken(req);
    const client = ivyClient(token);
    // Correct path is /v1/listings/{id}, not /v1/listing/{id}
    const response = await client.get(`/v1/listings/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Listing not found' });
  }
});

module.exports = router;

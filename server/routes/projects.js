const express = require('express');
const router = express.Router();
const { ivyClient, extractToken } = require('../middleware/proxy');

// GET /api/projects — paginated, filtered
router.get('/', async (req, res) => {
  try {
    const token = extractToken(req);
    const client = ivyClient(token);
    const { locality, project_status, offset = 0, limit = 20 } = req.query;

    const params = { limit, offset };
    if (locality) params.locality = locality;
    if (project_status) params.project_status = project_status;

    const response = await client.get('/v1/projects', { params });

    // FIX: Project price_min/price_max are in Crores, not rupees.
    // Convert to rupees for display consistency.
    const fixed = {
      ...response.data,
      results: response.data.results.map(p => ({
        ...p,
        price_min_inr: p.price_min ? Math.round(p.price_min * 10000000) : null,
        price_max_inr: p.price_max ? Math.round(p.price_max * 10000000) : null,
      }))
    };
    res.json(fixed);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const token = extractToken(req);
    const client = ivyClient(token);
    const response = await client.get(`/v1/projects/${req.params.id}`);
    const p = response.data;
    res.json({
      ...p,
      price_min_inr: p.price_min ? Math.round(p.price_min * 10000000) : null,
      price_max_inr: p.price_max ? Math.round(p.price_max * 10000000) : null,
    });
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Project not found' });
  }
});

module.exports = router;

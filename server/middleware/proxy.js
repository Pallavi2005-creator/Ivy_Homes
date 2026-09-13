const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'https://solve.ivy.homes';
const API_KEY = process.env.API_KEY;

/**
 * Creates an axios instance pre-configured with the API key header.
 * If a bearer token is provided, attaches it too.
 */
function ivyClient(bearerToken) {
  const headers = { 'X-API-Key': API_KEY };
  if (bearerToken) headers['Authorization'] = `Bearer ${bearerToken}`;
  return axios.create({ baseURL: BASE_URL, headers });
}

/**
 * Extracts the bearer token from the incoming request's Authorization header.
 */
function extractToken(req) {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

/**
 * Fetches ALL pages from a paginated endpoint using offset/limit.
 */
async function fetchAll(client, path, params = {}) {
  const limit = 50;
  let offset = 0;
  let total = Infinity;
  const results = [];

  while (offset < total) {
    const res = await client.get(path, { params: { ...params, limit, offset } });
    total = res.data.total;
    results.push(...res.data.results);
    offset += limit;
    if (!res.data.has_more) break;
  }
  return { total, results };
}

module.exports = { ivyClient, extractToken, fetchAll };

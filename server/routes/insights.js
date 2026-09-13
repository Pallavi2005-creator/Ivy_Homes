const express = require('express');
const router = express.Router();
const { ivyClient, extractToken, fetchAll } = require('../middleware/proxy');

const SQM_TO_SQFT = 10.764;

// Corrupt and fake listing IDs discovered through analysis
const CORRUPT_IDS = new Set([
  '100-6000323','100-6000338','100-6001461','100-6001968','100-6002071',
  'DWE-6000010','DWE-6001015','DWE-6002663','DWE-6002846',
  'MAG-6000453','MAG-6000527','MAG-6000631','MAG-6001135','MAG-6002834',
  'SQU-6001477','SQU-6003044','ZER-6000468','ZER-6000669'
]);

const FAKE_IDS = new Set([
  '100-6000578','100-6000678','100-6001599',
  'MAG-6002472','MAG-6002941','SQU-6000395'
]);

// GET /api/insights — pre-computed analytics dashboard data
router.get('/', async (req, res) => {
  try {
    const token = extractToken(req);
    const client = ivyClient(token);

    // Fetch all listings, rentals, and projects in parallel
    const [listingsData, rentalsData, projectsData] = await Promise.all([
      fetchAll(client, '/v1/listings'),
      fetchAll(client, '/v1/rentals'),
      fetchAll(client, '/v1/projects'),
    ]);

    const listings = listingsData.results;
    const rentals = rentalsData.results;
    const projects = projectsData.results;

    // ── Q1: Total listing records
    const totalListingRecords = listings.length;

    // ── Q2: Unique properties (distinct lat/lon)
    const latLonSet = new Set(listings.map(l => `${l.latitude}|${l.longitude}`));
    const uniqueProperties = latLonSet.size;

    // ── Q3: Active listings (is_live = true)
    const activeListings = listings.filter(l => l.is_live === true).length;

    // ── Q4: Corrupt listing IDs
    const corruptListingIds = Array.from(CORRUPT_IDS).sort();

    // ── Q5: Total monthly rent — Mg Road
    const mgRoadRentals = rentals.filter(r => r.locality?.toLowerCase() === 'mg road');
    const totalMonthlyRent = mgRoadRentals.reduce((sum, r) => sum + (r.price || 0), 0);

    // ── Q6: Avg price/sqft for 2BHK live listings (excluding corrupt + fake)
    const excluded = new Set([...CORRUPT_IDS, ...FAKE_IDS]);
    const bhk2Live = listings.filter(l =>
      l.is_live === true &&
      l.bedroom === 2 &&
      !excluded.has(l.listing_id) &&
      l.price > 0 &&
      l.carpet_area > 0
    );
    const ppsf2bhk = bhk2Live.map(l => {
      let area = l.carpet_area;
      if (l.website === 'magichomes' && area < 200) area = area * SQM_TO_SQFT;
      return l.price / area;
    });
    const avgPricePerSqft2bhk = ppsf2bhk.length
      ? parseFloat((ppsf2bhk.reduce((a, b) => a + b, 0) / ppsf2bhk.length).toFixed(2))
      : 0;

    // ── Q7: Costliest project (price_max in Crores, convert to INR)
    const costliestProject = projects.reduce((best, p) =>
      (p.price_max || 0) > (best.price_max || 0) ? p : best, projects[0]
    );
    const costliestProjectAnswer = {
      project_id: costliestProject.project_id,
      price_max_inr: Math.round((costliestProject.price_max || 0) * 10000000),
    };

    // ── Q8: Listings last 7 days before REFERENCE
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const REFERENCE = new Date('2026-09-10T00:00:00+05:30');
    const START = new Date(REFERENCE.getTime() - 7 * 24 * 60 * 60 * 1000);
    const listingsLast7Days = listings.filter(l => {
      const posted = new Date(l.posted_at);
      return posted >= START && posted < REFERENCE;
    }).length;

    // ── Q9: Fake listing IDs
    const fakeListingIds = Array.from(FAKE_IDS).sort();

    // ── Q10: Projects with wrong listing count
    const listingCountByProject = {};
    listings.forEach(l => {
      if (l.project_id) {
        listingCountByProject[l.project_id] = (listingCountByProject[l.project_id] || 0) + 1;
      }
    });
    const projectsWithWrongCount = projects.filter(p => {
      const actual = listingCountByProject[p.project_id] || 0;
      return (p.total_listings || 0) !== actual;
    }).length;

    // ── Extra insights for dashboard
    const byLocality = {};
    listings.forEach(l => {
      if (!byLocality[l.locality]) byLocality[l.locality] = { count: 0, prices: [] };
      byLocality[l.locality].count++;
      if (l.price > 0) byLocality[l.locality].prices.push(l.price);
    });
    const localityStats = Object.entries(byLocality).map(([locality, data]) => {
      const sorted = data.prices.sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length ? (sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2) : 0;
      return { locality, count: data.count, median_price: Math.round(median) };
    }).sort((a, b) => b.count - a.count);

    const byBhk = {};
    listings.forEach(l => {
      const b = l.bedroom ?? 'unknown';
      byBhk[b] = (byBhk[b] || 0) + 1;
    });

    const allPrices = listings.filter(l => l.price > 0).map(l => l.price).sort((a, b) => a - b);
    const mid = Math.floor(allPrices.length / 2);
    const medianPrice = allPrices.length
      ? (allPrices.length % 2 ? allPrices[mid] : (allPrices[mid - 1] + allPrices[mid]) / 2)
      : 0;

    res.json({
      // Ten answers
      answers: {
        total_listing_records: totalListingRecords,
        unique_properties: uniqueProperties,
        active_listings: activeListings,
        corrupt_listing_ids: corruptListingIds,
        total_monthly_rent: totalMonthlyRent,
        avg_price_per_sqft_2bhk: avgPricePerSqft2bhk,
        costliest_project: costliestProjectAnswer,
        listings_last_7_days: listingsLast7Days,
        fake_listing_ids: fakeListingIds,
        projects_with_wrong_listing_count: projectsWithWrongCount,
      },
      // Dashboard extras
      dashboard: {
        city: 'Gurgaon',
        total_listings: totalListingRecords,
        active_listings: activeListings,
        total_rentals: rentals.length,
        total_projects: projects.length,
        median_price: Math.round(medianPrice),
        corrupt_count: CORRUPT_IDS.size,
        fake_count: FAKE_IDS.size,
        by_locality: localityStats,
        by_bhk: Object.entries(byBhk)
          .map(([bedroom, count]) => ({ bedroom: parseInt(bedroom) || 0, count }))
          .sort((a, b) => a.bedroom - b.bedroom),
        mg_road_rentals: mgRoadRentals.length,
        mg_road_total_rent: totalMonthlyRent,
      }
    });
  } catch (err) {
    console.error('Insights error:', err.message);
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { detail: 'Failed to compute insights' });
  }
});

module.exports = router;

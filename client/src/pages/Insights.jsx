import { useState, useEffect } from 'react';
import client from '../api/client';

export default function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await client.get('/insights');
        setData(res.data);
      } catch (err) {
        setError('Failed to load insights dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (error) return <div className="page"><div className="error-state">{error}</div></div>;
  if (!data) return null;

  const { answers, dashboard } = data;

  return (
    <div className="page" style={{maxWidth: '1000px'}}>
      <div className="page-header">
        <h1 className="page-title">Market Insights & API Findings</h1>
        <p className="page-subtitle">Real-time statistics for {dashboard.city} and documented discrepancies.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-label">Total Listings</div>
          <div className="stat-value">{dashboard.total_listings.toLocaleString()}</div>
          <div className="stat-sub">{dashboard.active_listings.toLocaleString()} active</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Median Price</div>
          <div className="stat-value">₹{(dashboard.median_price / 10000000).toFixed(2)} Cr</div>
          <div className="stat-sub">Across all sale properties</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Corrupt Records</div>
          <div className="stat-value">{dashboard.corrupt_count}</div>
          <div className="stat-sub">Impossible physical values</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Fake Listings</div>
          <div className="stat-value">{dashboard.fake_count}</div>
          <div className="stat-sub">Bait pricing detected</div>
        </div>
      </div>

      <div className="insight-section">
        <h2 className="section-title">Required Assignment Answers</h2>
        <div className="card" style={{padding: '24px'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px'}}>
              <span style={{color: 'var(--text2)'}}>1. Total listing records</span>
              <span style={{fontWeight: '700'}}>{answers.total_listing_records}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px'}}>
              <span style={{color: 'var(--text2)'}}>2. Unique properties</span>
              <span style={{fontWeight: '700'}}>{answers.unique_properties}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px'}}>
              <span style={{color: 'var(--text2)'}}>3. Active listings</span>
              <span style={{fontWeight: '700'}}>{answers.active_listings}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px'}}>
              <span style={{color: 'var(--text2)'}}>5. Total monthly rent (Mg Road)</span>
              <span style={{fontWeight: '700'}}>₹{answers.total_monthly_rent.toLocaleString()}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px'}}>
              <span style={{color: 'var(--text2)'}}>6. Avg price/sqft (2BHK, Live)</span>
              <span style={{fontWeight: '700'}}>₹{answers.avg_price_per_sqft_2bhk.toLocaleString()}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px'}}>
              <span style={{color: 'var(--text2)'}}>7. Costliest project ID</span>
              <span style={{fontWeight: '700'}}>{answers.costliest_project.project_id} (₹{(answers.costliest_project.price_max_inr/10000000).toFixed(2)} Cr)</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px'}}>
              <span style={{color: 'var(--text2)'}}>8. Listings last 7 days</span>
              <span style={{fontWeight: '700'}}>{answers.listings_last_7_days}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '8px'}}>
              <span style={{color: 'var(--text2)'}}>10. Projects w/ wrong listing count</span>
              <span style={{fontWeight: '700'}}>{answers.projects_with_wrong_listing_count}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="insight-section">
        <h2 className="section-title">Distribution by Locality</h2>
        <div className="card" style={{overflowX: 'auto'}}>
          <table className="locality-table">
            <thead>
              <tr>
                <th>Locality</th>
                <th>Properties</th>
                <th>Median Price</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.by_locality.map(loc => (
                <tr key={loc.locality}>
                  <td style={{textTransform: 'capitalize'}}>{loc.locality}</td>
                  <td>{loc.count}</td>
                  <td>₹{(loc.median_price / 10000000).toFixed(2)} Cr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="insight-section">
        <h2 className="section-title">Documentation Discrepancies (The Lies)</h2>
        <div className="findings-list">
          <div className="finding-card">
            <div className="finding-header">
              <span className="finding-endpoint">GET /v1/projects</span>
              <span className="finding-category">units</span>
            </div>
            <div className="finding-body">
              <div className="finding-field">
                <label>Documented</label>
                <p>price_min and price_max are in rupees (integer)</p>
              </div>
              <div className="finding-field">
                <label>Actual</label>
                <p>They are floats representing Crores (e.g. 1.66 = 1.66 Cr = ₹1.66 Crore)</p>
              </div>
            </div>
          </div>
          <div className="finding-card">
            <div className="finding-header">
              <span className="finding-endpoint">GET /v1/listings</span>
              <span className="finding-category">pagination</span>
            </div>
            <div className="finding-body">
              <div className="finding-field">
                <label>Documented</label>
                <p>Uses page and limit parameters, returns page and page_size</p>
              </div>
              <div className="finding-field">
                <label>Actual</label>
                <p>Uses offset and limit parameters. Page parameter is silently ignored. Max limit is 50, not 200.</p>
              </div>
            </div>
          </div>
          <div className="finding-card">
            <div className="finding-header">
              <span className="finding-endpoint">GET /v1/listings</span>
              <span className="finding-category">units</span>
            </div>
            <div className="finding-body">
              <div className="finding-field">
                <label>Documented</label>
                <p>carpet_area is in square feet everywhere in the API</p>
              </div>
              <div className="finding-field">
                <label>Actual</label>
                <p>Listings from the 'magichomes' website frequently use square meters for carpet_area and super_built_up_area (e.g. 78 instead of 840).</p>
              </div>
            </div>
          </div>
          <div className="finding-card">
            <div className="finding-header">
              <span className="finding-endpoint">POST /auth/login</span>
              <span className="finding-category">auth</span>
            </div>
            <div className="finding-body">
              <div className="finding-field">
                <label>Documented</label>
                <p>Returns token, expires_in=86400 (24h). No refresh flow.</p>
              </div>
              <div className="finding-field">
                <label>Actual</label>
                <p>Returns access_token, expires_in=900 (15m). Includes refresh_token and undocumented POST /auth/refresh endpoint.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

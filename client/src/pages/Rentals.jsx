import { useState, useEffect } from 'react';
import client from '../api/client';
import Pagination from '../components/Pagination';

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchRentals = async () => {
      setLoading(true);
      setError(null);
      try {
        const offset = (page - 1) * limit;
        const res = await client.get('/rentals', { params: { limit, offset } });
        setRentals(res.data.results || []);
        setTotal(res.data.total || 0);
        setHasMore(res.data.has_more);
      } catch (err) {
        setError('Failed to load rentals');
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, [page]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Rentals</h1>
        <p className="page-subtitle">Browse rental properties in Gurgaon.</p>
      </div>

      {error && <div className="error-state" style={{marginBottom: '20px'}}>{error}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /> Loading rentals...</div>
      ) : rentals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <div className="empty-title">No rentals found</div>
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            {rentals.map(r => (
              <div key={r.listing_id} className="card listing-card">
                <div className="listing-card-body">
                  <div className="listing-card-top">
                    <div className="listing-price">₹{r.price?.toLocaleString()} <span style={{fontSize: '14px', fontWeight: 'normal', color: 'var(--text2)'}}>/mo</span></div>
                    <span className="badge badge-live">For Rent</span>
                  </div>
                  <div className="listing-title">{r.title || r.apartment_name}</div>
                  <div className="listing-locality">{r.locality}</div>
                  <div className="listing-meta">
                    <div className="listing-meta-item"><span>🛏️</span> {r.bedroom} BHK</div>
                    {r.carpet_area && <div className="listing-meta-item"><span>📏</span> {r.carpet_area} sqft</div>}
                  </div>
                </div>
                <div className="listing-footer">
                  <span className="badge badge-verified">{r.website}</span>
                  <span style={{fontSize: '12px', color: 'var(--text2)'}}>Dep: ₹{r.deposit?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} limit={limit} total={total} hasMore={hasMore} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

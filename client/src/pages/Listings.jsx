import { useState, useEffect } from 'react';
import client from '../api/client';
import ListingCard from '../components/ListingCard';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});

  useEffect(() => {
    fetchSaved();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [page, appliedFilters]);

  const fetchSaved = async () => {
    try {
      const res = await client.get('/saved');
      setSavedIds(new Set(res.data.results.map(l => l.listing_id || l.id)));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * limit;
      const res = await client.get('/listings', {
        params: { ...appliedFilters, limit, offset }
      });
      setListings(res.data.results || []);
      setTotal(res.data.total || 0);
      setHasMore(res.data.has_more);
    } catch (err) {
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters(filters);
  };

  const handleSave = async (id, isSaved) => {
    try {
      if (isSaved) {
        await client.delete(`/saved/${id}`);
        const newSet = new Set(savedIds);
        newSet.delete(id);
        setSavedIds(newSet);
      } else {
        await client.post('/saved', { listing_id: id });
        const newSet = new Set(savedIds);
        newSet.add(id);
        setSavedIds(newSet);
      }
    } catch (err) {
      console.error("Failed to toggle save", err);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Browse Properties</h1>
        <p className="page-subtitle">Discover active sale listings in Gurgaon.</p>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} onApply={handleApplyFilters} />

      {error && <div className="error-state" style={{marginBottom: '20px'}}>{error}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /> Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏜️</div>
          <div className="empty-title">No listings found</div>
          <div className="empty-subtitle">Try adjusting your filters</div>
        </div>
      ) : (
        <>
          <div className="grid grid-4">
            {listings.map(l => (
              <ListingCard key={l.listing_id} listing={l} onSave={handleSave} savedIds={savedIds} />
            ))}
          </div>
          <Pagination 
            page={page} limit={limit} total={total} hasMore={hasMore} 
            onPageChange={setPage} 
          />
        </>
      )}
    </div>
  );
}

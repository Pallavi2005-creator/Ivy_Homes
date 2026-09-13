import { useState, useEffect } from 'react';
import client from '../api/client';
import ListingCard from '../components/ListingCard';

export default function Saved() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await client.get('/saved');
      setSaved(res.data.results || []);
    } catch (err) {
      setError('Failed to load saved listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async (id, isCurrentlySaved) => {
    if (isCurrentlySaved) {
      try {
        await client.delete(`/saved/${id}`);
        setSaved(prev => prev.filter(l => (l.listing_id || l.id) !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const savedIds = new Set(saved.map(l => l.listing_id || l.id));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Saved Properties</h1>
        <p className="page-subtitle">Your shortlisted homes, accessible across sessions.</p>
      </div>

      {error && <div className="error-state" style={{marginBottom: '20px'}}>{error}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /> Loading saved...</div>
      ) : saved.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <div className="empty-title">No saved properties</div>
          <div className="empty-subtitle">Click the star icon on any listing to save it.</div>
        </div>
      ) : (
        <div className="grid grid-4">
          {saved.map(l => (
            <ListingCard key={l.listing_id || l.id} listing={l} onSave={handleSaveToggle} savedIds={savedIds} />
          ))}
        </div>
      )}
    </div>
  );
}

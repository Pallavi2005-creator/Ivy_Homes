import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await client.get(`/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        setError('Failed to load listing details.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (error) return <div className="page"><div className="error-state">{error}</div></div>;
  if (!listing) return null;

  const areaUnit = listing.website === 'magichomes' && listing.carpet_area < 200 ? 'sqm' : 'sqft';

  return (
    <div className="detail-page">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{marginBottom: '24px'}}>
        ← Back
      </button>

      <div className="detail-header">
        <div className="detail-badges">
          <span className="badge badge-verified">{listing.website}</span>
          {listing.is_live ? <span className="badge badge-live">Live</span> : <span className="badge badge-inactive">Inactive</span>}
          {listing.price < 0 && <span className="badge badge-corrupt">Corrupt (Negative Price)</span>}
          {listing.floor > listing.total_floors && <span className="badge badge-corrupt">Corrupt (Impossible Floor)</span>}
          {listing.carpet_area > listing.super_built_up_area && <span className="badge badge-corrupt">Corrupt (Area Anomaly)</span>}
        </div>
        
        <h1 className="page-title">{listing.apartment_name || listing.title || 'Property Details'}</h1>
        <p className="page-subtitle">{listing.locality}</p>
      </div>

      <div className={`detail-price ${listing.price < 0 ? 'negative' : ''}`}>
        ₹{listing.price?.toLocaleString()}
      </div>

      <div className="detail-meta-grid">
        {listing.bedroom != null && (
          <div className="meta-item">
            <div className="meta-label">Bedrooms</div>
            <div className="meta-value">{listing.bedroom} BHK</div>
          </div>
        )}
        {listing.bathroom != null && (
          <div className="meta-item">
            <div className="meta-label">Bathrooms</div>
            <div className="meta-value">{listing.bathroom}</div>
          </div>
        )}
        {listing.carpet_area != null && (
          <div className="meta-item">
            <div className="meta-label">Carpet Area</div>
            <div className="meta-value">{listing.carpet_area} {areaUnit}</div>
          </div>
        )}
        {listing.super_built_up_area != null && (
          <div className="meta-item">
            <div className="meta-label">Super Built-up Area</div>
            <div className="meta-value">{listing.super_built_up_area} {areaUnit}</div>
          </div>
        )}
        {listing.floor != null && (
          <div className="meta-item">
            <div className="meta-label">Floor</div>
            <div className="meta-value">{listing.floor} / {listing.total_floors}</div>
          </div>
        )}
        {listing.furnishing && (
          <div className="meta-item">
            <div className="meta-label">Furnishing</div>
            <div className="meta-value" style={{textTransform: 'capitalize'}}>{listing.furnishing.replace('-', ' ')}</div>
          </div>
        )}
      </div>

      <div className="description-box">
        {listing.description || "No description provided."}
      </div>

      <div className="detail-meta-grid" style={{marginTop: '32px'}}>
        <div className="meta-item">
          <div className="meta-label">Posted By</div>
          <div className="meta-value" style={{textTransform: 'capitalize'}}>{listing.posted_by}</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">Contact Name</div>
          <div className="meta-value">{listing.posted_by_name}</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">Phone Number</div>
          <div className="meta-value">{listing.posted_by_contact}</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">Posted At</div>
          <div className="meta-value">{new Date(listing.posted_at).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}

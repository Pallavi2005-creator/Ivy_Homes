import { useNavigate } from 'react-router-dom';

export default function ListingCard({ listing, onSave, savedIds = new Set() }) {
  const navigate = useNavigate();
  const isSaved = savedIds.has(listing.listing_id);

  const formatPrice = (price) => {
    if (price == null) return 'N/A';
    if (price < 0) return `₹${price.toLocaleString()} (Anomaly)`;
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const handleSave = (e) => {
    e.stopPropagation();
    onSave(listing.listing_id, isSaved);
  };

  return (
    <div className="card listing-card" onClick={() => navigate(`/listings/${listing.listing_id}`)}>
      <div className="listing-card-body">
        <div className="listing-card-top">
          <div className={`listing-price ${listing.price < 0 ? 'negative' : ''}`}>
            {formatPrice(listing.price)}
          </div>
          {listing.is_live ? (
            <span className="badge badge-live">Live</span>
          ) : (
            <span className="badge badge-inactive">Inactive</span>
          )}
        </div>
        <div className="listing-title">{listing.apartment_name || listing.title || 'Property'}</div>
        <div className="listing-locality">{listing.locality}</div>
        
        <div className="listing-meta">
          {listing.bedroom != null && (
            <div className="listing-meta-item">
              <span>🛏️</span> {listing.bedroom} BHK
            </div>
          )}
          {listing.carpet_area != null && (
            <div className="listing-meta-item">
              <span>📏</span> {listing.carpet_area} {listing.website === 'magichomes' && listing.carpet_area < 200 ? 'sqm' : 'sqft'}
            </div>
          )}
        </div>
      </div>
      
      <div className="listing-footer">
        <span className="badge badge-verified">
          {listing.website}
        </span>
        <button 
          className={`save-btn ${isSaved ? 'saved' : ''}`} 
          onClick={handleSave}
          title={isSaved ? "Remove from saved" : "Save property"}
        >
          {isSaved ? '★' : '☆'}
        </button>
      </div>
    </div>
  );
}

export default function FilterBar({ filters, setFilters, onApply }) {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onApply();
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Locality</label>
        <input 
          type="text" 
          name="locality" 
          className="filter-input" 
          placeholder="e.g. mg road"
          value={filters.locality || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="filter-group">
        <label>Bedrooms</label>
        <input 
          type="number" 
          name="bhk" 
          className="filter-input" 
          placeholder="Any"
          value={filters.bhk || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="filter-group">
        <label>Min Price</label>
        <input 
          type="number" 
          name="min_price" 
          className="filter-input" 
          placeholder="Any"
          value={filters.min_price || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="filter-group">
        <label>Max Price</label>
        <input 
          type="number" 
          name="max_price" 
          className="filter-input" 
          placeholder="Any"
          value={filters.max_price || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="filter-group">
        <label>Furnishing</label>
        <select name="furnishing" className="filter-select" value={filters.furnishing || ''} onChange={handleChange}>
          <option value="">Any</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi-furnished">Semi-furnished</option>
          <option value="fully-furnished">Fully-furnished</option>
        </select>
      </div>
      <button className="btn btn-primary" onClick={onApply}>Apply Filters</button>
    </div>
  );
}

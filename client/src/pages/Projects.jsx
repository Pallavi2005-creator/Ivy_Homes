import { useState, useEffect } from 'react';
import client from '../api/client';
import Pagination from '../components/Pagination';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const offset = (page - 1) * limit;
        const res = await client.get('/projects', { params: { limit, offset } });
        setProjects(res.data.results || []);
        setTotal(res.data.total || 0);
        setHasMore(res.data.has_more);
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [page]);

  const getStatusClass = (status) => {
    if (!status) return 'status-under';
    const s = status.toLowerCase();
    if (s.includes('ready')) return 'status-ready';
    if (s.includes('launch')) return 'status-launch';
    return 'status-under';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Builder Projects</h1>
        <p className="page-subtitle">New developments and residential projects.</p>
      </div>

      {error && <div className="error-state" style={{marginBottom: '20px'}}>{error}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /> Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏗️</div>
          <div className="empty-title">No projects found</div>
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            {projects.map(p => (
              <div key={p.project_id} className="card project-card">
                <div className="proj-header">
                  <div className="proj-name">{p.apartment_name}</div>
                  <div className="proj-dev">by {p.developer_name} • {p.locality}</div>
                </div>
                <div className="proj-body">
                  <div className="proj-price">
                    {p.price_min_inr ? `₹${(p.price_min_inr/10000000).toFixed(2)} Cr` : 'N/A'} - 
                    {p.price_max_inr ? ` ₹${(p.price_max_inr/10000000).toFixed(2)} Cr` : ' N/A'}
                  </div>
                  <div className="proj-meta">
                    <div>{p.total_units} units</div>
                    <div>{p.total_towers} towers</div>
                    <div>{p.min_area_sqft} - {p.max_area_sqft} sqft</div>
                  </div>
                </div>
                <div className="proj-footer">
                  <span className={`status-badge ${getStatusClass(p.project_status)}`}>
                    {p.project_status}
                  </span>
                  <span style={{fontSize: '12px', color: 'var(--text2)', fontWeight: '600'}}>
                    {p.total_listings} active listings
                  </span>
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

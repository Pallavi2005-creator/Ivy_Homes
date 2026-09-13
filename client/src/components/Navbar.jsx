import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="navbar">
      <div className="navbar-brand">Ivy Homes</div>
      <div className="navbar-links">
        <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>Listings</Link>
        <Link to="/rentals" className={`nav-link ${path === '/rentals' ? 'active' : ''}`}>Rentals</Link>
        <Link to="/projects" className={`nav-link ${path === '/projects' ? 'active' : ''}`}>Projects</Link>
        <Link to="/saved" className={`nav-link ${path === '/saved' ? 'active' : ''}`}>Saved</Link>
        <Link to="/insights" className={`nav-link ${path === '/insights' ? 'active' : ''}`}>Insights</Link>
      </div>
      <div className="navbar-right">
        <div className="user-badge">{user?.email}</div>
        <button onClick={logout} className="btn btn-ghost btn-sm">Logout</button>
      </div>
    </nav>
  );
}

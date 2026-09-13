import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = ['demo1@ivy.homes', 'demo2@ivy.homes', 'demo3@ivy.homes'];

  return (
    <div className="login-page">
      <div className="card login-card">
        <div className="login-logo">
          <h1>Ivy Homes</h1>
          <p>Internship Assignment</p>
        </div>
        
        {error && <div className="error-state" style={{marginBottom: '20px'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%', justifyContent: 'center'}} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-accounts">
          <h4>Demo Accounts</h4>
          {demoAccounts.map(acc => (
            <div key={acc} className="demo-item">
              <span>{acc}</span>
              <button 
                className="demo-login-btn"
                onClick={() => { setEmail(acc); setPassword('626ad415d6'); }}
              >
                Use
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

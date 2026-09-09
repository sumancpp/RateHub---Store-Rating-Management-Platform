import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password);

      // Role-based redirect
      const destination =
        location.state?.from?.pathname ||
        (user.role === 'ADMIN'
          ? '/admin'
          : user.role === 'STORE_OWNER'
          ? '/store-owner'
          : '/user');

      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-card-title">Sign In to RateHub</h1>
        <p className="auth-card-subtitle">
          Enter your credentials to access your account dashboard
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@ratehub.local"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
}

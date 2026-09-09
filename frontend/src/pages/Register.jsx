import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  function validate() {
    const errs = {};

    const trimmedName = formData.name.trim();
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      errs.name = 'Name must be between 20 and 60 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    const trimmedAddress = formData.address.trim();
    if (!trimmedAddress) {
      errs.address = 'Address is required';
    } else if (trimmedAddress.length > 400) {
      errs.address = 'Address must be at most 400 characters';
    }

    const pwd = formData.password;
    if (pwd.length < 8 || pwd.length > 16) {
      errs.password = 'Password must be between 8 and 16 characters';
    } else if (!/[A-Z]/.test(pwd)) {
      errs.password = 'Password must contain at least one uppercase letter';
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) {
      errs.password = 'Password must contain at least one special character';
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        password: formData.password,
      });

      // Public registration is always USER role
      navigate('/user', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-card-title">Create an Account</h1>
        <p className="auth-card-subtitle">
          Register to browse and rate local stores on RateHub
        </p>

        {serverError && <div className="alert alert-danger">{serverError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Jonathan Edwards Richardson"
              disabled={loading}
              required
            />
            <div className="form-hint">Must be 20 to 60 characters</div>
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. yourname@example.com"
              disabled={loading}
              required
              autoComplete="email"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              className="form-textarea"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="e.g. 123 Main Street, Suite 4B, Central City"
              disabled={loading}
              required
            />
            <div className="form-hint">Maximum 400 characters ({formData.address.length}/400)</div>
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Create a secure password"
              disabled={loading}
              required
              autoComplete="new-password"
            />
            <div className="form-hint">
              8–16 characters, at least 1 uppercase letter and 1 special character
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

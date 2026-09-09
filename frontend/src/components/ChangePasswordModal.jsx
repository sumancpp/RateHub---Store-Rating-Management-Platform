import React, { useState } from 'react';
import { api } from '../services/api.js';

export function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function validate(password) {
    if (password.length < 8 || password.length > 16) {
      return 'Password must be between 8 and 16 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    const validationError = validate(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title">Change Password</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="currentPassword">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            <div className="form-hint">
              8–16 characters, at least 1 uppercase letter and 1 special character
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

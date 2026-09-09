import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export function StoreOwnerDashboard({ onOpenPasswordModal }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [sortField, sortOrder]);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await api.get('/store-owner/dashboard');
      if (res.status === 'success') {
        setDashboardData(res.data);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to load store dashboard' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchRatings() {
    setRatingsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('sortBy', sortField);
      params.append('sortOrder', sortOrder);

      const res = await api.get(`/store-owner/ratings?${params.toString()}`);
      if (res.status === 'success') {
        setRatings(res.data.ratings);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to load ratings list' });
    } finally {
      setRatingsLoading(false);
    }
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

  const renderSortIndicator = (field) => {
    if (sortField !== field) return ' ↕';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading) {
    return <div className="loading-spinner">Loading store dashboard...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>Store Owner Dashboard</h1>
          <p className="subtitle">Performance metrics and customer ratings for your registered store</p>
        </div>
      </div>

      {alert.message && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
          <button
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setAlert({ type: '', message: '' })}
          >
            ✕
          </button>
        </div>
      )}

      {dashboardData && !dashboardData.hasStore ? (
        <div className="card">
          <div className="empty-state">
            <h3 style={{ marginBottom: '0.5rem' }}>No Store Registered</h3>
            <p>Your store owner account is active, but no store has been assigned to you yet.</p>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
              Please contact the platform administrator to assign or create your store profile.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Store Overview & Average Rating Stats */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-title">Store Name</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.4rem' }}>
                {dashboardData?.store?.name}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                {dashboardData?.store?.address}
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Average Store Rating</div>
              <div className="stat-card-value">
                {dashboardData?.averageRating !== null ? (
                  <span style={{ color: '#d97706' }}>★ {dashboardData?.averageRating}</span>
                ) : (
                  <span style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
                    No ratings yet
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Based on submitted ratings
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Total Ratings Submitted</div>
              <div className="stat-card-value">
                {dashboardData?.totalRatings}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Total unique customers
              </p>
            </div>
          </div>

          {/* Ratings Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Customer Ratings ({ratings.length})</h2>
                <p className="subtitle">Verified customer feedback submitted for your store</p>
              </div>
            </div>

            {ratingsLoading ? (
              <div className="loading-spinner">Loading ratings...</div>
            ) : ratings.length === 0 ? (
              <div className="empty-state">No ratings have been submitted yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('name')}>
                        Customer Name{renderSortIndicator('name')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('email')}>
                        Email{renderSortIndicator('email')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('address')}>
                        Address{renderSortIndicator('address')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('rating')}>
                        Submitted Rating{renderSortIndicator('rating')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('createdAt')}>
                        Date{renderSortIndicator('createdAt')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.user.name}</td>
                        <td>{r.user.email}</td>
                        <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.user.address}
                        </td>
                        <td>
                          <span className="rating-badge">★ {r.rating} / 5</span>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

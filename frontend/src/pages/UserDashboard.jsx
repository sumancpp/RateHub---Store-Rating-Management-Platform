import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { StarRating } from '../components/StarRating.jsx';

export function UserDashboard({ onOpenPasswordModal }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Rating modal state for submitting or modifying rating
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    store: null,
    currentRating: 0,
    isModifying: false,
  });
  const [selectedRating, setSelectedRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchStores();
  }, [sortField, sortOrder]);

  async function fetchStores() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchName.trim()) params.append('name', searchName.trim());
      if (searchAddress.trim()) params.append('address', searchAddress.trim());
      params.append('sortBy', sortField);
      params.append('sortOrder', sortOrder);

      const res = await api.get(`/stores?${params.toString()}`);
      if (res.status === 'success') {
        setStores(res.data.stores);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to fetch stores' });
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchStores();
  }

  function handleResetSearch() {
    setSearchName('');
    setSearchAddress('');
    setTimeout(() => {
      fetchStores();
    }, 0);
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

  function openRatingModal(store) {
    const hasExisting = store.myRating !== null && store.myRating !== undefined;
    setRatingModal({
      isOpen: true,
      store,
      currentRating: hasExisting ? store.myRating : 5,
      isModifying: hasExisting,
    });
    setSelectedRating(hasExisting ? store.myRating : 5);
    setRatingError('');
  }

  async function handleSubmitRating() {
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setRatingError('Please select a rating between 1 and 5 stars');
      return;
    }

    setSubmittingRating(true);
    setRatingError('');

    try {
      if (ratingModal.isModifying) {
        await api.put(`/stores/${ratingModal.store.id}/ratings`, {
          rating: selectedRating,
        });
        setAlert({ type: 'success', message: `Rating for "${ratingModal.store.name}" updated to ${selectedRating} stars!` });
      } else {
        await api.post(`/stores/${ratingModal.store.id}/ratings`, {
          rating: selectedRating,
        });
        setAlert({ type: 'success', message: `Submitted ${selectedRating}-star rating for "${ratingModal.store.name}"!` });
      }

      setRatingModal({ isOpen: false, store: null, currentRating: 0, isModifying: false });
      fetchStores();
    } catch (err) {
      setRatingError(err.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>Store Directory</h1>
          <p className="subtitle">Discover local stores, review community ratings, and submit your ratings</p>
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

      {/* Search Bar */}
      <div className="card">
        <form className="filter-bar" onSubmit={handleSearchSubmit} style={{ margin: 0, padding: 0, border: 'none' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search stores by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search stores by address..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
          />

          <button type="submit" className="btn btn-primary">
            Search
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleResetSearch}>
            Reset
          </button>
        </form>
      </div>

      {/* Stores Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Stores ({stores.length})</h2>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="empty-state">
            No stores match your search criteria. Try a different query.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    Store Name{renderSortIndicator('name')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('address')}>
                    Address{renderSortIndicator('address')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('rating')}>
                    Overall Rating{renderSortIndicator('rating')}
                  </th>
                  <th>My Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td style={{ fontWeight: 600 }}>{store.name}</td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {store.address}
                    </td>
                    <td>
                      {store.overallRating !== null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="rating-badge">★ {store.overallRating}</span>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                            ({store.totalRatings} {store.totalRatings === 1 ? 'rating' : 'ratings'})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          No ratings yet
                        </span>
                      )}
                    </td>
                    <td>
                      {store.myRating !== null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="rating-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                            ★ {store.myRating} / 5
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Not rated yet</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${store.myRating !== null ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => openRatingModal(store)}
                      >
                        {store.myRating !== null ? 'Modify Rating' : 'Rate Store'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RATING MODAL */}
      {ratingModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setRatingModal({ ...ratingModal, isOpen: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">
                {ratingModal.isModifying ? 'Modify Your Rating' : 'Rate Store'}
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setRatingModal({ ...ratingModal, isOpen: false })}
              >
                ✕
              </button>
            </div>

            {ratingError && <div className="alert alert-danger">{ratingError}</div>}

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                {ratingModal.store.name}
              </h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {ratingModal.store.address}
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <StarRating
                  value={selectedRating}
                  interactive={true}
                  onChange={(val) => setSelectedRating(val)}
                />
              </div>

              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                {selectedRating} of 5 Stars
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRatingModal({ ...ratingModal, isOpen: false })}
                disabled={submittingRating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmitRating}
                disabled={submittingRating}
              >
                {submittingRating
                  ? 'Saving...'
                  : ratingModal.isModifying
                  ? 'Update Rating'
                  : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

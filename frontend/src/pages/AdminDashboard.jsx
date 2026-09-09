import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'stores'

  // Dashboard stats
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [userSort, setUserSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Stores state
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeFilters, setStoreFilters] = useState({ name: '', address: '' });
  const [storeSort, setStoreSort] = useState({ sortBy: 'name', sortOrder: 'asc' });
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);

  // Store Owners list for store creation dropdown
  const [storeOwners, setStoreOwners] = useState([]);

  // Errors / Success alerts
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stores') {
      fetchStores();
      fetchStoreOwners();
    }
  }, [activeTab, userSort, storeSort]);

  async function fetchStats() {
    setStatsLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.status === 'success') {
        setStats(res.data);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to load dashboard statistics' });
    } finally {
      setStatsLoading(false);
    }
  }

  async function fetchUsers() {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (userFilters.name) params.append('name', userFilters.name);
      if (userFilters.email) params.append('email', userFilters.email);
      if (userFilters.address) params.append('address', userFilters.address);
      if (userFilters.role) params.append('role', userFilters.role);
      params.append('sortBy', userSort.sortBy);
      params.append('sortOrder', userSort.sortOrder);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.status === 'success') {
        setUsers(res.data.users);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to load users' });
    } finally {
      setUsersLoading(false);
    }
  }

  async function fetchStores() {
    setStoresLoading(true);
    try {
      const params = new URLSearchParams();
      if (storeFilters.name) params.append('name', storeFilters.name);
      if (storeFilters.address) params.append('address', storeFilters.address);
      params.append('sortBy', storeSort.sortBy);
      params.append('sortOrder', storeSort.sortOrder);

      const res = await api.get(`/admin/stores?${params.toString()}`);
      if (res.status === 'success') {
        setStores(res.data.stores);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to load stores' });
    } finally {
      setStoresLoading(false);
    }
  }

  async function fetchStoreOwners() {
    try {
      const res = await api.get('/admin/users?role=STORE_OWNER');
      if (res.status === 'success') {
        setStoreOwners(res.data.users);
      }
    } catch (err) {
      // ignore
    }
  }

  async function viewUserDetails(userId) {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      if (res.status === 'success') {
        setSelectedUser(res.data.user);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to fetch user details' });
    }
  }

  function handleUserSort(field) {
    setUserSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }

  function handleStoreSort(field) {
    setStoreSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }

  const renderSortIndicator = (currentSort, field) => {
    if (currentSort.sortBy !== field) return ' ↕';
    return currentSort.sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>Administrator Portal</h1>
          <p className="subtitle">Platform oversight, store registries, and user administration</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            Dashboard
          </button>
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('stores')}
          >
            Stores
          </button>
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

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-title">Total Users</div>
              <div className="stat-card-value">
                {statsLoading ? '...' : stats.totalUsers}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Total Stores</div>
              <div className="stat-card-value">
                {statsLoading ? '...' : stats.totalStores}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Total Ratings Submitted</div>
              <div className="stat-card-value">
                {statsLoading ? '...' : stats.totalRatings}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Administration Actions</h2>
            </div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Perform management workflows directly or navigate to detailed listings:
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setActiveTab('users');
                  setIsAddUserOpen(true);
                }}
              >
                + Add New User
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setActiveTab('stores');
                  setIsAddStoreOpen(true);
                }}
              >
                + Add New Store
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveTab('users')}
              >
                Manage All Users
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveTab('stores')}
              >
                Manage All Stores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">User Management</h2>
              <p className="subtitle">View, search, filter, and create platform users</p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsAddUserOpen(true)}>
              + Add User
            </button>
          </div>

          {/* User Filters */}
          <form
            className="filter-bar"
            onSubmit={(e) => {
              e.preventDefault();
              fetchUsers();
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Filter by name..."
              value={userFilters.name}
              onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Filter by email..."
              value={userFilters.email}
              onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Filter by address..."
              value={userFilters.address}
              onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
            />
            <select
              className="form-select"
              value={userFilters.role}
              onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">System Admin</option>
              <option value="USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>

            <button type="submit" className="btn btn-primary btn-sm">
              Apply Filters
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setUserFilters({ name: '', email: '', address: '', role: '' });
                setTimeout(fetchUsers, 0);
              }}
            >
              Reset
            </button>
          </form>

          {usersLoading ? (
            <div className="loading-spinner">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">No users found matching the filter criteria.</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleUserSort('name')}>
                      Name{renderSortIndicator(userSort, 'name')}
                    </th>
                    <th className="sortable" onClick={() => handleUserSort('email')}>
                      Email{renderSortIndicator(userSort, 'email')}
                    </th>
                    <th className="sortable" onClick={() => handleUserSort('address')}>
                      Address{renderSortIndicator(userSort, 'address')}
                    </th>
                    <th className="sortable" onClick={() => handleUserSort('role')}>
                      Role{renderSortIndicator(userSort, 'role')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.address}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'ADMIN'
                              ? 'badge-admin'
                              : u.role === 'STORE_OWNER'
                              ? 'badge-owner'
                              : 'badge-user'
                          }`}
                        >
                          {u.role === 'ADMIN' ? 'Admin' : u.role === 'STORE_OWNER' ? 'Store Owner' : 'Normal User'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => viewUserDetails(u.id)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* STORES TAB */}
      {activeTab === 'stores' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Store Management</h2>
              <p className="subtitle">All registered stores and aggregate community ratings</p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsAddStoreOpen(true)}>
              + Add Store
            </button>
          </div>

          {/* Store Filters */}
          <form
            className="filter-bar"
            onSubmit={(e) => {
              e.preventDefault();
              fetchStores();
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Search by store name..."
              value={storeFilters.name}
              onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search by store address..."
              value={storeFilters.address}
              onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
            />

            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setStoreFilters({ name: '', address: '' });
                setTimeout(fetchStores, 0);
              }}
            >
              Reset
            </button>
          </form>

          {storesLoading ? (
            <div className="loading-spinner">Loading stores...</div>
          ) : stores.length === 0 ? (
            <div className="empty-state">No stores registered yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleStoreSort('name')}>
                      Store Name{renderSortIndicator(storeSort, 'name')}
                    </th>
                    <th className="sortable" onClick={() => handleStoreSort('email')}>
                      Email{renderSortIndicator(storeSort, 'email')}
                    </th>
                    <th className="sortable" onClick={() => handleStoreSort('address')}>
                      Address{renderSortIndicator(storeSort, 'address')}
                    </th>
                    <th>Store Owner</th>
                    <th className="sortable" onClick={() => handleStoreSort('rating')}>
                      Overall Rating{renderSortIndicator(storeSort, 'rating')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.email}</td>
                      <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.address}
                      </td>
                      <td>{s.owner?.name || 'N/A'}</td>
                      <td>
                        {s.overallRating !== null ? (
                          <span className="rating-badge">★ {s.overallRating} ({s.totalRatings})</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            No ratings yet
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">User Account Details</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span className="form-label">Full Name:</span>
                <p style={{ fontWeight: 600 }}>{selectedUser.name}</p>
              </div>
              <div>
                <span className="form-label">Email:</span>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <span className="form-label">Address:</span>
                <p>{selectedUser.address}</p>
              </div>
              <div>
                <span className="form-label">Role:</span>
                <p>
                  <span
                    className={`badge ${
                      selectedUser.role === 'ADMIN'
                        ? 'badge-admin'
                        : selectedUser.role === 'STORE_OWNER'
                        ? 'badge-owner'
                        : 'badge-user'
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                </p>
              </div>

              {selectedUser.role === 'STORE_OWNER' && (
                <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Store Information</h4>
                  {selectedUser.store ? (
                    <div>
                      <p><strong>Store:</strong> {selectedUser.store.name}</p>
                      <p><strong>Store Email:</strong> {selectedUser.store.email}</p>
                      <p><strong>Store Address:</strong> {selectedUser.store.address}</p>
                      <p style={{ marginTop: '0.35rem' }}>
                        <strong>Overall Rating:</strong>{' '}
                        {selectedUser.storeRating !== null ? (
                          <span className="rating-badge">★ {selectedUser.storeRating} ({selectedUser.store.totalRatings} ratings)</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>No ratings yet</span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--color-text-muted)' }}>No store currently registered for this owner.</p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddUserOpen && (
        <AddUserModal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          onSuccess={() => {
            setIsAddUserOpen(false);
            setAlert({ type: 'success', message: 'User created successfully' });
            fetchUsers();
            fetchStats();
          }}
        />
      )}

      {/* ADD STORE MODAL */}
      {isAddStoreOpen && (
        <AddStoreModal
          isOpen={isAddStoreOpen}
          storeOwners={storeOwners}
          onClose={() => setIsAddStoreOpen(false)}
          onSuccess={() => {
            setIsAddStoreOpen(false);
            setAlert({ type: 'success', message: 'Store created successfully' });
            fetchStores();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}

function AddUserModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      setError('Name must be between 20 and 60 characters');
      return;
    }

    if (formData.password.length < 8 || formData.password.length > 16) {
      setError('Password must be between 8 and 16 characters');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)) {
      setError('Password must contain at least one special character');
      return;
    }

    if (formData.address.trim().length > 400) {
      setError('Address must be at most 400 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/users', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address.trim(),
        role: formData.role,
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title">Add New User</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jonathan Edwards Richardson"
              required
            />
            <div className="form-hint">20 to 60 characters</div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. user@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="USER">Normal User</option>
              <option value="ADMIN">System Administrator</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Initial password"
              required
            />
            <div className="form-hint">8–16 chars, 1 uppercase letter, 1 special char</div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-textarea"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full mailing address"
              required
            />
            <div className="form-hint">Maximum 400 characters</div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddStoreModal({ isOpen, storeOwners, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: storeOwners[0]?.id || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Store name is required');
      return;
    }

    if (!formData.ownerId) {
      setError('A designated Store Owner must be selected. If none exist, create a Store Owner user first.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/stores', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        ownerId: formData.ownerId,
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title">Add New Store</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Downtown Gourmet Market"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. contact@downtownmarket.local"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Address</label>
            <textarea
              className="form-textarea"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Physical store address"
              required
            />
            <div className="form-hint">Maximum 400 characters</div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Store Owner</label>
            {storeOwners.length === 0 ? (
              <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>
                No Store Owner accounts found. Please create a user with the <strong>Store Owner</strong> role first.
              </div>
            ) : (
              <select
                className="form-select"
                value={formData.ownerId}
                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                required
              >
                <option value="">Select a Store Owner</option>
                {storeOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || storeOwners.length === 0}
            >
              {loading ? 'Creating Store...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

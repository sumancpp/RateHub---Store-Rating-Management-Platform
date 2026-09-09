import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Navbar({ onOpenPasswordModal }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'badge badge-admin';
      case 'STORE_OWNER':
        return 'badge badge-owner';
      default:
        return 'badge badge-user';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'STORE_OWNER':
        return 'Store Owner';
      default:
        return 'User';
    }
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        Rate<span>Hub</span>
      </Link>

      <nav className="nav-links">
        {user ? (
          <>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="nav-link">
                Admin Dashboard
              </Link>
            )}

            {user.role === 'USER' && (
              <Link to="/user" className="nav-link">
                Browse Stores
              </Link>
            )}

            {user.role === 'STORE_OWNER' && (
              <Link to="/store-owner" className="nav-link">
                Owner Dashboard
              </Link>
            )}

            {onOpenPasswordModal && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onOpenPasswordModal}
              >
                Change Password
              </button>
            )}

            <span className="user-badge">
              <span className={getRoleBadgeClass(user.role)}>
                {getRoleLabel(user.role)}
              </span>
              <span>{user.name}</span>
            </span>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-spinner">
        <span>Loading session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their appropriate role home
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'STORE_OWNER') {
      return <Navigate to="/store-owner" replace />;
    }
    return <Navigate to="/user" replace />;
  }

  return children;
}

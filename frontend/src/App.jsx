import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { ChangePasswordModal } from './components/ChangePasswordModal.jsx';

import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { UserDashboard } from './pages/UserDashboard.jsx';
import { StoreOwnerDashboard } from './pages/StoreOwnerDashboard.jsx';

export function App() {
  const { user, loading } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <span>Initializing RateHub...</span>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar onOpenPasswordModal={user ? () => setIsPasswordModalOpen(true) : null} />

      <main className="main-content">
        <Routes>
          {/* Default Home Route - redirects to role dashboard or login */}
          <Route
            path="/"
            element={
              user ? (
                user.role === 'ADMIN' ? (
                  <Navigate to="/admin" replace />
                ) : user.role === 'STORE_OWNER' ? (
                  <Navigate to="/store-owner" replace />
                ) : (
                  <Navigate to="/user" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              user ? (
                user.role === 'ADMIN' ? (
                  <Navigate to="/admin" replace />
                ) : user.role === 'STORE_OWNER' ? (
                  <Navigate to="/store-owner" replace />
                ) : (
                  <Navigate to="/user" replace />
                )
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/register"
            element={user ? <Navigate to="/user" replace /> : <Register />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Normal User Routes */}
          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserDashboard onOpenPasswordModal={() => setIsPasswordModalOpen(true)} />
              </ProtectedRoute>
            }
          />

          {/* Store Owner Routes */}
          <Route
            path="/store-owner/*"
            element={
              <ProtectedRoute allowedRoles={['STORE_OWNER']}>
                <StoreOwnerDashboard onOpenPasswordModal={() => setIsPasswordModalOpen(true)} />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Change Password Modal */}
      {user && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </div>
  );
}

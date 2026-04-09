import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserType } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  isAuthLoading: boolean;
  currentUser: UserType | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  isAuthLoading,
  currentUser,
}) => {
  // Show a minimal spinner while auth resolves — only on protected pages
  if (isAuthLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        color: 'var(--text-secondary)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '4px solid var(--border)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontWeight: 600 }}>Checking session...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-muted font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based permission
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h1 className="text-2xl font-bold text-brand-navy mb-2">Unauthorized Access</h1>
          <p className="text-brand-muted mb-6">
            You do not have administrative permissions to view this directory.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

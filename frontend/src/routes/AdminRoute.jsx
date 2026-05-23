import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ffffff',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}>
        Loading admin session...
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but not an admin, redirect to normal dashboard
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, authorize and render children admin component
  return children;
};

export default AdminRoute;

import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await API.get('/notifications');
        const unread = response.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications count:', error);
      }
    };

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#282c34',
      color: 'white',
      marginBottom: '20px'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>FoundIt Platform</Link>
      </div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ marginRight: '10px' }}>Hello, {user.name}</span>
            
            {/* Notification Bell */}
            <Link to="/notifications" style={{ position: 'relative', marginRight: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center' }} title="Notifications">
              <span style={{ fontSize: '1.4rem' }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '1px 5px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '14px',
                  height: '14px',
                  boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>

            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: '#f43f5e', fontWeight: 'bold', textDecoration: 'none' }}>🛡️ Admin Panel</Link>
            )}
            <Link to="/dashboard" style={{ color: '#61dafb', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/my-items" style={{ color: '#eab308', textDecoration: 'none' }}>My Items</Link>
            <Link to="/my-claims" style={{ color: '#a78bfa', textDecoration: 'none' }}>My Claims</Link>
            <Link to="/received-claims" style={{ color: '#fca5a5', textDecoration: 'none' }}>Received Claims</Link>
            <Link to="/lost-items" style={{ color: '#61dafb', textDecoration: 'none' }}>Lost Items</Link>
            <Link to="/found-items" style={{ color: '#34d399', textDecoration: 'none' }}>Found Items</Link>
            <Link to="/add-lost-item" style={{ color: '#61dafb', textDecoration: 'none' }}>Add Lost Item</Link>
            <Link to="/add-found-item" style={{ color: '#34d399', textDecoration: 'none' }}>Add Found Item</Link>
            <button 
              onClick={handleLogout} 
              style={{
                backgroundColor: '#ff4b4b',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/lost-items" style={{ color: '#61dafb', textDecoration: 'none' }}>Lost Items</Link>
            <Link to="/found-items" style={{ color: '#34d399', textDecoration: 'none' }}>Found Items</Link>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{
              backgroundColor: '#61dafb',
              color: '#282c34',
              padding: '8px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

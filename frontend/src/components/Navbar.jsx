import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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

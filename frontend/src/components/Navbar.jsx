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
            <Link to="/items" style={{ color: '#61dafb', textDecoration: 'none' }}>All Items</Link>
            <Link to="/add-item" style={{ color: '#61dafb', textDecoration: 'none' }}>Report Item</Link>
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
            <Link to="/items" style={{ color: '#61dafb', textDecoration: 'none' }}>All Items</Link>
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

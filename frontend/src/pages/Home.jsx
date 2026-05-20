import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user, loading } = useContext(AuthContext);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '0 20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#282c34' }}>
        Find What You Lost. <br />
        <span style={{ color: '#61dafb' }}>Return What You Found.</span>
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6' }}>
        A centralized, secure, and modern platform to report lost items and claim found belongings. Join the community to help return items to their rightful owners.
      </p>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/register" style={{
          backgroundColor: '#282c34',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '5px',
          textDecoration: 'none',
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}>
          Get Started
        </Link>
        <Link to="/login" style={{
          backgroundColor: 'transparent',
          color: '#282c34',
          border: '2px solid #282c34',
          padding: '10px 24px',
          borderRadius: '5px',
          textDecoration: 'none',
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}>
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;

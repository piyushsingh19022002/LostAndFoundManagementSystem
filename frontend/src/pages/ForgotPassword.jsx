import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await API.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'A reset link has been dispatched to your email.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px',
      background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
      borderRadius: '24px',
      margin: '20px auto',
      maxWidth: '480px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      color: '#f1f5f9',
    }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '10px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '800',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #61dafb 0%, #a5f3fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
        }}>
          Forgot Password
        </h2>
        <p style={{
          color: '#94a3b8',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          textAlign: 'center',
          marginBottom: '25px',
        }}>
          Enter your email address below and we'll send you a cryptographically secure link to reset your password.
        </p>

        {message && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#cbd5e1',
            marginBottom: '8px',
          }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            disabled={loading}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none',
              marginBottom: '20px',
              transition: 'border-color 0.2s',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: loading ? '#475569' : '#61dafb',
              color: '#0f172a',
              fontWeight: '700',
              fontSize: '1rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(97, 218, 251, 0.2)',
              transition: 'transform 0.1s, background-color 0.2s',
            }}
          >
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{
          marginTop: '25px',
          textAlign: 'center',
          fontSize: '0.9rem',
        }}>
          <Link to="/login" style={{
            color: '#61dafb',
            textDecoration: 'none',
            fontWeight: '600',
          }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

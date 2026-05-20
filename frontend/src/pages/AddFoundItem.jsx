import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const AddFoundItem = () => {
  const navigate = useNavigate();

  // Controlled form state — each field maps directly to the FoundItem schema
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    dateFound: '',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Generic handler — works for all inputs because it reads event.target.name
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    const { title, description, location, dateFound } = formData;
    if (!title.trim() || !description.trim() || !location.trim() || !dateFound) {
      return setError('Please fill in all required fields.');
    }
    if (title.trim().length < 5) {
      return setError('Title must be at least 5 characters.');
    }
    if (description.trim().length < 10) {
      return setError('Description must be at least 10 characters.');
    }

    try {
      setLoading(true);
      // Axios interceptor automatically attaches the JWT from localStorage
      await API.post('/found-items', formData);
      setSuccess('✅ Found item reported successfully! Redirecting to the feed...');
      setTimeout(() => navigate('/found-items'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit the report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.headerIcon}>🎁</span>
          <div>
            <h1 style={styles.title}>Report a Found Item</h1>
            <p style={styles.subtitle}>Help reunite someone with their belongings</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={styles.errorAlert}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={styles.successAlert}>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="title">Item Title <span style={styles.required}>*</span></label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Blue Nike Sneakers"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="description">Description <span style={styles.required}>*</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the item in detail — size, colour, brand, markings..."
              style={styles.textarea}
              rows={5}
              disabled={loading}
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label} htmlFor="location">Where Found <span style={styles.required}>*</span></label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Central Park, Bench near fountain"
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label} htmlFor="dateFound">Date Found <span style={styles.required}>*</span></label>
              <input
                id="dateFound"
                name="dateFound"
                type="date"
                value={formData.dateFound}
                onChange={handleChange}
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="imageUrl">Image URL <span style={styles.optional}>(optional)</span></label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span style={styles.loadingText}>
                <span style={styles.spinner} /> Submitting Report...
              </span>
            ) : (
              '🎁 Submit Found Item Report'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/found-items" style={styles.footerLink}>← View All Found Items</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '85vh',
    background: 'radial-gradient(circle at 30% 50%, #064e3b 0%, #111827 60%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '680px',
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
  },
  headerIcon: {
    fontSize: '3rem',
    lineHeight: 1,
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: '#9ca3af',
    margin: '4px 0 0',
    fontSize: '0.95rem',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    borderRadius: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#fca5a5',
    fontSize: '0.9rem',
    marginBottom: '24px',
  },
  successAlert: {
    padding: '14px 18px',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: '#6ee7b7',
    fontSize: '0.9rem',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  required: {
    color: '#f87171',
    marginLeft: '2px',
  },
  optional: {
    color: '#6b7280',
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
    marginLeft: '4px',
    fontSize: '0.8rem',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    color: '#ffffff',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    color: '#ffffff',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    width: '100%',
    boxSizing: 'border-box',
    lineHeight: '1.6',
  },
  submitBtn: {
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'opacity 0.2s',
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  footerLink: {
    color: '#34d399',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
};

export default AddFoundItem;

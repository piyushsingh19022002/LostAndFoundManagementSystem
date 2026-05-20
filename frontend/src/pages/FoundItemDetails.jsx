import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import { AuthContext } from '../context/AuthContext';

const FoundItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);

  const [item, setItem]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Fetch found item by ID whenever route param changes
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/found-items/${id}`);
        setItem(response.data);
        setError('');
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to retrieve item details. It may have been removed or the ID is invalid.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id]);

  // Ownership check — handles both populated and non-populated user references
  const isOwner =
    item &&
    currentUser &&
    item.user &&
    (item.user._id?.toString() === currentUser.id?.toString() ||
      item.user.toString() === currentUser.id?.toString() ||
      item.user._id?.toString() === currentUser._id?.toString() ||
      item.user.toString() === currentUser._id?.toString());

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      setLoading(true);
      await API.delete(`/found-items/${id}`);
      alert('Report deleted successfully.');
      navigate('/found-items');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item.');
      setLoading(false);
    }
  };

  // --- Render States ---

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader size="50px" color="#10b981" />
        <p style={styles.loaderText}>Loading found item details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorAlert}>
          <span style={styles.alertIcon}>⚠️</span>
          <div>
            <h3 style={styles.alertTitle}>Error Loading Report</h3>
            <p style={styles.alertMessage}>{error}</p>
            <Link to="/found-items" style={styles.backBtn}>← Back to Found Items Feed</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={styles.container}>
        <div style={styles.errorAlert}>
          <span style={styles.alertIcon}>🔍</span>
          <div>
            <h3 style={styles.alertTitle}>Item Not Found</h3>
            <p style={styles.alertMessage}>This report could not be located. It may have been deleted.</p>
            <Link to="/found-items" style={styles.backBtn}>← Back to Found Items Feed</Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(item.dateFound).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusLabels = { found: '🟢 Found', claimed: '🟡 Claimed', returned: '🟣 Returned' };
  const statusColors = {
    found:    { color: '#34d399', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
    claimed:  { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
    returned: { color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)' },
  };
  const sc = statusColors[item.status] || statusColors.found;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <Link to="/found-items" style={styles.backLink}>← Back to Found Items Feed</Link>

        <div style={styles.grid}>
          {/* Image Column */}
          <div style={styles.imageColumn}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} style={styles.image} />
            ) : (
              <div style={styles.imagePlaceholder}>
                <span style={{ fontSize: '4rem' }}>🎁</span>
                <span style={styles.placeholderText}>No Image Provided</span>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div style={styles.detailsColumn}>
            <div style={styles.badgeRow}>
              <span style={{ ...styles.categoryBadge, backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                🎁 Found Item
              </span>
              <span style={{ ...styles.statusBadge, backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                {statusLabels[item.status] || item.status}
              </span>
            </div>

            <h1 style={styles.title}>{item.title}</h1>

            <div style={styles.metaSection}>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>📍 Found at:</span>
                <span style={styles.metaValue}>{item.location}</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>📅 Date Found:</span>
                <span style={styles.metaValue}>{formattedDate}</span>
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.descSection}>
              <h3 style={styles.sectionTitle}>Description</h3>
              <p style={styles.descText}>{item.description}</p>
            </div>

            <div style={styles.divider} />

            {/* Reporter Card */}
            <div style={styles.reporterCard}>
              <h4 style={styles.reporterTitle}>Reporter Information</h4>
              <div style={styles.reporterFields}>
                <div style={styles.reporterField}>
                  <span style={{ fontSize: '1.2rem' }}>👤</span>
                  <div>
                    <p style={styles.fieldLabel}>Name</p>
                    <p style={styles.fieldValue}>{item.user?.name || 'Anonymous User'}</p>
                  </div>
                </div>
                {item.user?.email && (
                  <div style={styles.reporterField}>
                    <span style={{ fontSize: '1.2rem' }}>✉️</span>
                    <div>
                      <p style={styles.fieldLabel}>Contact Email</p>
                      <a href={`mailto:${item.user.email}`} style={styles.emailLink}>
                        {item.user.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div style={styles.actionRow}>
                <Link to={`/found-items/edit/${id}`} style={styles.editBtn}>✏️ Edit Report</Link>
                <button onClick={handleDelete} style={styles.deleteBtn}>🗑️ Delete Report</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '85vh',
    background: 'radial-gradient(circle at 30% 60%, #064e3b 0%, #111827 60%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: { maxWidth: '1000px', width: '100%' },
  backLink: {
    display: 'inline-block',
    color: '#34d399',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    backgroundColor: 'rgba(31, 41, 55, 0.55)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 45px rgba(0,0,0,0.35)',
  },
  imageColumn: {
    backgroundColor: '#071a12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '350px',
    borderRight: '1px solid rgba(16, 185, 129, 0.08)',
  },
  image: { width: '100%', height: '100%', objectFit: 'cover', maxHeight: '550px' },
  imagePlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  placeholderText: { fontSize: '0.9rem', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' },
  detailsColumn: { padding: '40px', display: 'flex', flexDirection: 'column' },
  badgeRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' },
  categoryBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statusBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
  title: { fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', margin: '0 0 20px 0', lineHeight: '1.25', letterSpacing: '-0.02em' },
  metaSection: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  metaRow: { display: 'flex', alignItems: 'center', fontSize: '0.95rem' },
  metaLabel: { color: '#9ca3af', fontWeight: '600', width: '110px' },
  metaValue: { color: '#f3f4f6', fontWeight: '500' },
  divider: { height: '1px', backgroundColor: 'rgba(255,255,255,0.07)', margin: '24px 0' },
  descSection: { marginBottom: '10px' },
  sectionTitle: { fontSize: '0.85rem', fontWeight: '700', color: '#e5e7eb', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' },
  descText: { fontSize: '0.95rem', color: '#d1d5db', lineHeight: '1.7', margin: 0 },
  reporterCard: { backgroundColor: 'rgba(17, 24, 39, 0.45)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', marginTop: 'auto' },
  reporterTitle: { fontSize: '0.8rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0' },
  reporterFields: { display: 'flex', flexDirection: 'column', gap: '14px' },
  reporterField: { display: 'flex', alignItems: 'center', gap: '12px' },
  fieldLabel: { fontSize: '0.72rem', color: '#9ca3af', margin: '0 0 2px 0', textTransform: 'uppercase' },
  fieldValue: { fontSize: '0.9rem', color: '#ffffff', fontWeight: '600', margin: 0 },
  emailLink: { fontSize: '0.9rem', color: '#34d399', textDecoration: 'none', fontWeight: '600' },
  actionRow: { display: 'flex', gap: '16px', marginTop: '24px' },
  editBtn: { flex: 1, padding: '12px', textAlign: 'center', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#ffffff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)' },
  deleteBtn: { flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer' },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', background: 'radial-gradient(circle at 30% 60%, #064e3b 0%, #111827 60%)' },
  loaderText: { marginTop: '16px', color: '#9ca3af', fontSize: '0.95rem' },
  errorAlert: { display: 'flex', gap: '16px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.18)', borderRadius: '12px', padding: '30px', maxWidth: '500px', width: '100%' },
  alertIcon: { fontSize: '2.5rem' },
  alertTitle: { margin: '0 0 8px 0', color: '#ef4444', fontSize: '1.2rem', fontWeight: '700' },
  alertMessage: { margin: '0 0 20px 0', color: '#e5e7eb', fontSize: '0.95rem', lineHeight: '1.6' },
  backBtn: { display: 'inline-block', padding: '10px 20px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.07)', color: '#ffffff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' },
};

export default FoundItemDetails;

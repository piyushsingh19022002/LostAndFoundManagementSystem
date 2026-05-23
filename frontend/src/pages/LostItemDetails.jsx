import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import { AuthContext } from '../context/AuthContext';
import BookmarkButton from '../components/BookmarkButton';

const LostItemDetails = () => {
  // 1. Params Extraction
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);

  // 2. Component States
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  // 3. Fetch Single Item Details
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/lost-items/${id}`);
        setItem(response.data);
        setError('');

        if (currentUser) {
          const favsRes = await API.get('/favorites');
          const isFav = favsRes.data.some(f => f.item?._id === id || f.item === id);
          setIsFavorited(isFav);
        }
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError(err.response?.data?.message || 'Failed to retrieve item details. It might have been deleted or the ID is invalid.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItemDetails();
    }
  }, [id, currentUser]);

  // 4. Verification of Ownership (for Edit/Delete actions in future stages)
  const isOwner = item && currentUser && item.user && (
    item.user._id?.toString() === currentUser.id?.toString() || 
    item.user.toString() === currentUser.id?.toString() ||
    item.user._id?.toString() === currentUser._id?.toString() ||
    item.user.toString() === currentUser._id?.toString()
  );

  // 5. Delete Action (optional helper matching stage 12.7 backend)
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      setLoading(true);
      await API.delete(`/lost-items/${id}`);
      alert('Report deleted successfully.');
      navigate('/lost-items');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item.');
      setLoading(false);
    }
  };

  // Rendering Loader State
  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader size="50px" color="#61dafb" />
        <p style={styles.loaderText}>Loading item details...</p>
      </div>
    );
  }

  // Rendering Error State
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorAlert}>
          <span style={styles.alertIcon}>⚠️</span>
          <div>
            <h3 style={styles.alertTitle}>Error Loading Report</h3>
            <p style={styles.alertMessage}>{error}</p>
            <Link to="/lost-items" style={styles.errorBackBtn}>
              Back to Lost Items Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Rendering Null State
  if (!item) {
    return (
      <div style={styles.container}>
        <div style={styles.errorAlert}>
          <span style={styles.alertIcon}>🔍</span>
          <div>
            <h3 style={styles.alertTitle}>Item Not Found</h3>
            <p style={styles.alertMessage}>The requested report could not be found or has been removed.</p>
            <Link to="/lost-items" style={styles.errorBackBtn}>
              Back to Lost Items Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLost = item.category === 'Lost';
  const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusLabels = { lost: '🟢 Lost', found: '🔵 Found', claimed: '🟡 Claimed' };
  const statusColors = {
    lost:     { color: '#f87171', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
    found:    { color: '#61dafb', bg: 'rgba(97, 218, 251, 0.12)', border: 'rgba(97, 218, 251, 0.3)' },
    claimed:  { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  };
  const sc = statusColors[item.status] || statusColors.lost;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* Back Link */}
        <Link to="/lost-items" style={styles.backLink}>
          ← Back to Lost Items Feed
        </Link>

        {/* Layout Grid */}
        <div style={styles.grid}>
          {/* Left Column: Image Section */}
          <div style={styles.imageColumn}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} style={styles.image} />
            ) : (
              <div style={styles.imagePlaceholder}>
                <span style={styles.placeholderIcon}>{isLost ? '🔍' : '🎁'}</span>
                <span style={styles.placeholderText}>No Image Provided</span>
              </div>
            )}
          </div>

          {/* Right Column: Metadata Section */}
          <div style={styles.detailsColumn}>
            <div style={styles.badgeRow}>
              <span style={{
                ...styles.badge,
                backgroundColor: isLost ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: isLost ? '#f87171' : '#34d399',
                border: `1px solid ${isLost ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
              }}>
                {item.category}
              </span>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: sc.bg,
                color: sc.color,
                border: `1px solid ${sc.border}`
              }}>
                {statusLabels[item.status] || item.status}
              </span>
            </div>

            <div style={styles.titleContainer}>
              <h1 style={styles.title}>{item.title}</h1>
              {currentUser && (
                <BookmarkButton
                  itemId={item._id}
                  itemModel="Item"
                  initialIsFavorited={isFavorited}
                />
              )}
            </div>

            <div style={styles.metaSection}>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>📍 Location:</span>
                <span style={styles.metaValue}>{item.location}</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>📅 Date:</span>
                <span style={styles.metaValue}>{formattedDate}</span>
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.descriptionSection}>
              <h3 style={styles.sectionTitle}>Description</h3>
              <p style={styles.descriptionText}>{item.description}</p>
            </div>

            <div style={styles.divider} />

            {/* Reporter Card */}
            <div style={styles.reporterCard}>
              <h4 style={styles.reporterTitle}>Reporter Information</h4>
              <div style={styles.reporterInfoGrid}>
                <div style={styles.reporterField}>
                  <span style={styles.reporterIcon}>👤</span>
                  <div>
                    <p style={styles.reporterLabel}>Name</p>
                    <p style={styles.reporterValue}>{item.user?.name || 'Anonymous User'}</p>
                  </div>
                </div>
                {item.user?.email && (
                  <div style={styles.reporterField}>
                    <span style={styles.reporterIcon}>✉️</span>
                    <div>
                      <p style={styles.reporterLabel}>Contact Email</p>
                      <a href={`mailto:${item.user.email}`} style={styles.emailLink}>
                        {item.user.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Action Buttons (Edit / Delete) */}
            {isOwner && (
              <div style={styles.actionRow}>
                <Link to={`/lost-items/edit/${id}`} style={styles.editBtn}>
                  ✏️ Edit Report
                </Link>
                <button onClick={handleDelete} style={styles.deleteBtn}>
                  🗑️ Delete Report
                </button>
              </div>
            )}

            {/* Non-Owner Claim Button */}
            {!isOwner && (
              <div style={styles.actionRow}>
                {item.status === 'claimed' ? (
                  <button disabled style={styles.disabledBtn}>
                    🔒 Already Claimed
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login', { state: { from: `/lost-items/${id}` } });
                      } else {
                        navigate(`/claim/${id}?type=lost`);
                      }
                    }}
                    style={styles.claimBtn}
                  >
                    🤝 Claim Item / Contact Owner
                  </button>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

// Premium Styles matching dashboard layout
const styles = {
  container: {
    minHeight: '85vh',
    background: 'radial-gradient(circle at center, #1f2937 0%, #111827 100%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    maxWidth: '1000px',
    width: '100%',
  },
  backLink: {
    display: 'inline-block',
    color: '#61dafb',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '24px',
    transition: 'transform 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '40px',
    backgroundColor: 'rgba(31, 41, 55, 0.55)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
  },
  imageColumn: {
    backgroundColor: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '350px',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    maxHeight: '550px',
  },
  imagePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  placeholderIcon: {
    fontSize: '4rem',
  },
  placeholderText: {
    fontSize: '0.9rem',
    color: '#6b7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailsColumn: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  badge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statusText: {
    fontSize: '0.85rem',
    color: '#10b981',
    fontWeight: '600',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    lineHeight: '1.25',
    letterSpacing: '-0.02em',
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  metaSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.95rem',
  },
  metaLabel: {
    color: '#9ca3af',
    fontWeight: '600',
    width: '100px',
  },
  metaValue: {
    color: '#f3f4f6',
    fontWeight: '500',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: '24px 0',
  },
  descriptionSection: {
    marginBottom: '10px',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 12px 0',
  },
  descriptionText: {
    fontSize: '0.95rem',
    color: '#d1d5db',
    lineHeight: '1.65',
    margin: 0,
  },
  reporterCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '20px',
    marginTop: 'auto',
  },
  reporterTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 16px 0',
  },
  reporterInfoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  reporterField: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  reporterIcon: {
    fontSize: '1.2rem',
  },
  reporterLabel: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    margin: '0 0 2px 0',
    textTransform: 'uppercase',
  },
  reporterValue: {
    fontSize: '0.9rem',
    color: '#ffffff',
    fontWeight: '600',
    margin: 0,
  },
  emailLink: {
    fontSize: '0.9rem',
    color: '#61dafb',
    textDecoration: 'none',
    fontWeight: '600',
  },
  actionRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '24px',
  },
  editBtn: {
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '700',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'background-color 0.2s',
  },
  deleteBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  claimBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    padding: '14px',
    borderRadius: '8px',
    backgroundColor: '#61dafb',
    color: '#0b1329',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(97, 218, 251, 0.2)',
  },
  disabledBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    padding: '14px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '700',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'not-allowed',
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  categoryBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  badgeRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    background: 'radial-gradient(circle at center, #1f2937 0%, #111827 100%)',
  },
  loaderText: {
    marginTop: '16px',
    color: '#9ca3af',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  errorAlert: {
    display: 'flex',
    gap: '16px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    width: '100%',
  },
  alertIcon: {
    fontSize: '2.5rem',
  },
  alertTitle: {
    margin: '0 0 8px 0',
    color: '#ef4444',
    fontSize: '1.25rem',
    fontWeight: '700',
  },
  alertMessage: {
    margin: '0 0 20px 0',
    color: '#e5e7eb',
    fontSize: '0.95rem',
    lineHeight: '1.6',
  },
  errorBackBtn: {
    display: 'inline-block',
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
  }
};

export default LostItemDetails;

import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Loader from '../components/Loader';

const ReceivedClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchReceivedClaims = async () => {
    try {
      const res = await API.get('/claims/received');
      setClaims(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching received claims:', err);
      setError(err.response?.data?.message || 'Failed to fetch received claim requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivedClaims();
  }, []);

  const handleStatusUpdate = async (claimId, newStatus) => {
    const actionWord = newStatus === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionWord} this claim?`)) return;

    try {
      setActionLoadingId(claimId);
      await API.put(`/claims/${claimId}`, { status: newStatus });
      
      // Refresh claims lists to reflect cascades (e.g. other requests getting rejected, status changes)
      await fetchReceivedClaims();
      alert(`Claim request ${newStatus} successfully.`);
    } catch (err) {
      console.error('Status update error:', err);
      alert(err.response?.data?.message || 'Failed to update claim status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'approved':
        return {
          color: '#34d399',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
          label: 'Approved ✅',
        };
      case 'rejected':
        return {
          color: '#f87171',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
          label: 'Rejected ❌',
        };
      case 'pending':
      default:
        return {
          color: '#fbbf24',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
          label: 'Pending ⏳',
        };
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader size="50px" color="#3b82f6" />
        <p style={styles.loaderText}>Loading incoming claims...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.titleText}>Received Claim Requests</h1>
          <p style={styles.subtitleText}>
            Review details and proof messages submitted by other users on your reported items.
          </p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.alertIcon}>⚠️</span>
            <span style={styles.alertText}>{error}</span>
          </div>
        )}

        {!error && claims.length === 0 ? (
          <div style={styles.nullCard}>
            <span style={styles.nullIcon}>📥</span>
            <h3 style={styles.nullTitle}>No Claim Requests Received</h3>
            <p style={styles.nullMessage}>
              You haven't received any claim requests on your reported items yet. When someone submits a claim, it will appear here for your review.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {claims.map((claim) => {
              const itemData = claim.item || {};
              const claimerData = claim.claimer || {};
              const ss = getStatusStyles(claim.status);
              const isLost = itemData.category === 'Lost' || claim.itemModel === 'Item';

              return (
                <div key={claim._id} style={styles.claimCard}>
                  {/* Status Badge */}
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: ss.bg,
                      color: ss.color,
                      border: `1px solid ${ss.border}`,
                    }}
                  >
                    {ss.label}
                  </span>

                  <div style={styles.cardContent}>
                    {/* Item Thumbnail */}
                    <div style={styles.thumbWrapper}>
                      {itemData.imageUrl ? (
                        <img
                          src={itemData.imageUrl}
                          alt={itemData.title || 'Claimed Item'}
                          style={styles.thumbnail}
                        />
                      ) : (
                        <div style={styles.thumbPlaceholder}>
                          <span>{isLost ? '🔍' : '🎁'}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Details */}
                    <div style={styles.details}>
                      <span
                        style={{
                          ...styles.categoryBadge,
                          backgroundColor: isLost
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(16, 185, 129, 0.15)',
                          color: isLost ? '#f87171' : '#34d399',
                          border: `1px solid ${
                            isLost ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                          }`,
                        }}
                      >
                        {isLost ? 'Lost Item' : 'Found Item'}
                      </span>

                      <h3 style={styles.itemTitle}>
                        {itemData.title || 'Deleted Item'}
                      </h3>
                      <p style={styles.itemMeta}>📍 {itemData.location || 'Unknown location'}</p>
                      <p style={styles.itemMeta}>
                        📅 Date Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                      </p>

                      <div style={styles.claimerCard}>
                        <h4 style={styles.cardSectionTitle}>Claimer Contact Info</h4>
                        <p style={styles.contactField}>
                          <strong>Name:</strong> {claimerData.name || 'Anonymous User'}
                        </p>
                        <p style={styles.contactField}>
                          <strong>Email:</strong>{' '}
                          <a href={`mailto:${claimerData.email}`} style={styles.emailLink}>
                            {claimerData.email}
                          </a>
                        </p>
                      </div>

                      <div style={styles.messageBox}>
                        <h4 style={styles.boxTitle}>Submitted Message / Proof:</h4>
                        <p style={styles.boxMessage}>"{claim.message}"</p>
                      </div>

                      {/* Approve / Reject Actions (Only visible for Pending claims) */}
                      {claim.status === 'pending' && (
                        <div style={styles.actionRow}>
                          <button
                            onClick={() => handleStatusUpdate(claim._id, 'approved')}
                            style={styles.approveBtn}
                            disabled={actionLoadingId !== null}
                          >
                            ✔️ Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(claim._id, 'rejected')}
                            style={styles.rejectBtn}
                            disabled={actionLoadingId !== null}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '85vh',
    background: 'radial-gradient(circle at center, #1f2937 0%, #111827 100%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  wrapper: {
    maxWidth: '900px',
    width: '100%',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  titleText: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 12px 0',
    letterSpacing: '-0.02em',
  },
  subtitleText: {
    fontSize: '1rem',
    color: '#9ca3af',
    margin: 0,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  alertIcon: {
    fontSize: '1.2rem',
  },
  alertText: {
    fontSize: '0.95rem',
    color: '#f3f4f6',
    fontWeight: '500',
  },
  nullCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '60px 40px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
  nullIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  nullTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 12px 0',
  },
  nullMessage: {
    fontSize: '1rem',
    color: '#9ca3af',
    maxWidth: '500px',
    lineHeight: '1.6',
    margin: 0,
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  claimCard: {
    position: 'relative',
    backgroundColor: 'rgba(31, 41, 55, 0.55)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  },
  statusBadge: {
    position: 'absolute',
    top: '30px',
    right: '30px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  cardContent: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  thumbWrapper: {
    width: '120px',
    height: '120px',
    flexShrink: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbPlaceholder: {
    fontSize: '3rem',
  },
  details: {
    flex: 1,
    minWidth: '280px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
  },
  categoryBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  itemTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '4px 0 0 0',
  },
  itemMeta: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    margin: 0,
  },
  claimerCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginTop: '10px',
  },
  cardSectionTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 6px 0',
  },
  contactField: {
    fontSize: '0.9rem',
    color: '#e5e7eb',
    margin: '4px 0',
  },
  emailLink: {
    color: '#61dafb',
    textDecoration: 'none',
    fontWeight: '600',
  },
  messageBox: {
    width: '100%',
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    padding: '14px',
    marginTop: '12px',
  },
  boxTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 6px 0',
  },
  boxMessage: {
    fontSize: '0.95rem',
    color: '#e5e7eb',
    fontStyle: 'italic',
    lineHeight: '1.4',
    margin: 0,
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    width: '100%',
  },
  approveBtn: {
    padding: '10px 20px',
    borderRadius: '6px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  rejectBtn: {
    padding: '10px 20px',
    borderRadius: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '85vh',
    background: 'radial-gradient(circle at center, #1f2937 0%, #111827 100%)',
  },
  loaderText: {
    marginTop: '16px',
    color: '#9ca3af',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
};

export default ReceivedClaims;

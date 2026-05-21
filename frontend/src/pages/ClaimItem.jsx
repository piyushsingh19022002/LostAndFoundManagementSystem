import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import { AuthContext } from '../context/AuthContext';

const ClaimItem = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);

  const type = searchParams.get('type') || 'lost';
  const itemModel = type === 'lost' ? 'Item' : 'FoundItem';
  const fetchUrl = type === 'lost' ? `/lost-items/${id}` : `/found-items/${id}`;

  const [item, setItem] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await API.get(fetchUrl);
        setItem(res.data);
        setError('');
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError(err.response?.data?.message || 'Failed to retrieve item details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id, fetchUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!message.trim()) {
      setError('Please add a message explaining your ownership proof or recovery request.');
      return;
    }

    setSubmitting(true);

    try {
      await API.post('/claims', {
        itemId: id,
        itemModel,
        message,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/my-claims');
      }, 2000);
    } catch (err) {
      console.error('Submit claim error:', err);
      setError(err.response?.data?.message || 'An error occurred while submitting your claim request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader size="50px" color="#3b82f6" />
        <p style={styles.loaderText}>Loading item information...</p>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div style={styles.container}>
        <div style={styles.errorAlert}>
          <span style={styles.alertIcon}>⚠️</span>
          <div>
            <h3 style={styles.alertTitle}>Error Loading Item</h3>
            <p style={styles.alertMessage}>{error}</p>
            <Link to={type === 'lost' ? '/lost-items' : '/found-items'} style={styles.backBtn}>
              Back to Items Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLost = item.category === 'Lost' || type === 'lost';
  const itemImage = item.imageUrl;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.titleText}>Submit Claim Request</h1>
          <p style={styles.subtitleText}>
            Provide details or proof of ownership to contact the reporter of this item.
          </p>
        </div>

        {/* Item Summary Preview */}
        {item && (
          <div style={styles.itemSummary}>
            {itemImage ? (
              <img src={itemImage} alt={item.title} style={styles.itemThumb} />
            ) : (
              <div style={styles.thumbPlaceholder}>
                <span>{isLost ? '🔍' : '🎁'}</span>
              </div>
            )}
            <div style={styles.itemInfo}>
              <span style={{
                ...styles.badge,
                backgroundColor: isLost ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: isLost ? '#f87171' : '#34d399',
                border: `1px solid ${isLost ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
              }}>
                {isLost ? 'Lost Item' : 'Found Item'}
              </span>
              <h2 style={styles.itemTitle}>{item.title}</h2>
              <p style={styles.itemLocation}>📍 {item.location}</p>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorAlertInline}>
            <span style={styles.alertIconInline}>⚠️</span>
            <span style={styles.alertTextInline}>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successAlertInline}>
            <span style={styles.alertIconInline}>✅</span>
            <span style={styles.alertTextInline}>Claim request submitted successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="message" style={styles.label}>
              Proof of Ownership / Message to Owner
            </label>
            <textarea
              id="message"
              name="message"
              rows="6"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isLost
                  ? "Describe the item in detail, mention where/when you found it, or how the owner can get in touch to verify and claim it..."
                  : "Provide details proving this item belongs to you (e.g. serial numbers, receipt details, specific scratches/markings, passcode, contents inside, lock screen wallpaper...)"
              }
              style={styles.textarea}
              disabled={submitting || success}
            />
          </div>

          <div style={styles.actionContainer}>
            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                background: isLost 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                  : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                boxShadow: isLost 
                  ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                  : '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
              disabled={submitting || success}
            >
              {submitting ? 'Submitting Request...' : 'Submit Claim'}
            </button>

            <div style={styles.linkContainer}>
              <Link 
                to={isLost ? `/lost-items/${id}` : `/found-items/${id}`} 
                style={styles.backLink}
              >
                ← Cancel & Return
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '85vh',
    padding: '40px 20px',
    background: 'radial-gradient(circle at center, #1f2937 0%, #111827 100%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '650px',
    backgroundColor: 'rgba(31, 41, 55, 0.65)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  titleText: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 10px 0',
    letterSpacing: '-0.025em',
  },
  subtitleText: {
    fontSize: '0.95rem',
    color: '#9ca3af',
    margin: 0,
  },
  itemSummary: {
    display: 'flex',
    gap: '20px',
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    alignItems: 'center',
  },
  itemThumb: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  thumbPlaceholder: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '2rem',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  badge: {
    alignSelf: 'flex-start',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  itemTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  itemLocation: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  textarea: {
    padding: '12px 16px',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    transition: 'border-color 0.2s',
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '12px',
  },
  submitBtn: {
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.2s',
  },
  linkContainer: {
    textAlign: 'center',
  },
  backLink: {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'color 0.2s',
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
  backBtn: {
    display: 'inline-block',
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  errorAlertInline: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  successAlertInline: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  alertIconInline: {
    fontSize: '1.2rem',
  },
  alertTextInline: {
    fontSize: '0.9rem',
    color: '#f3f4f6',
    fontWeight: '500',
  },
};

export default ClaimItem;

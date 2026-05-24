import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AIMatchesSection = ({ itemId, type }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await API.get(`/matches/${itemId}`);
        setMatches(response.data.matches || []);
      } catch (err) {
        console.error('Error fetching AI matches:', err);
        setError(err.response?.data?.message || 'Failed to retrieve AI recommendations.');
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchMatches();
    }
  }, [itemId]);

  if (loading) {
    return (
      <div className="mt-10 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="text-sm font-semibold text-slate-400 mb-6 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span>🤖 AI Smart Engine analyzing similarity parameters...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(n => (
            <div key={n} className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 flex flex-col gap-4 animate-pulse">
              <div className="h-28 bg-slate-800/60 rounded-lg" />
              <div className="h-4 bg-slate-800/60 rounded w-3/4" />
              <div className="h-4 bg-slate-800/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorAlert}>
        <span style={styles.errorIcon}>⚠️</span>
        <p style={{ margin: 0, color: '#fca5a5' }}>{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.aiIconBadge}>🤖</div>
        <h4 style={styles.emptyTitle}>AI Matching Engine Scanner</h4>
        <p style={styles.emptyDesc}>
          No high-confidence matches detected in the system yet. The matching engine automatically scans new lost & found listings continuously.
        </p>
      </div>
    );
  }

  // Get badge color based on confidence rating
  const getBadgeStyles = (confidence) => {
    switch (confidence) {
      case 'Excellent Match':
        return {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
        };
      case 'Strong Match':
        return {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: '#ffffff',
          boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
        };
      case 'Possible Match':
        return {
          background: 'linear-gradient(135deg, #eab308 0%, #d97706 100%)',
          color: '#ffffff',
          boxShadow: '0 0 12px rgba(234, 179, 8, 0.4)'
        };
      default:
        return {
          background: '#4b5563',
          color: '#f3f4f6',
          boxShadow: 'none'
        };
    }
  };

  const getProgressBarColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#eab308';
    return '#6b7280';
  };

  return (
    <div style={styles.sectionContainer}>
      <header style={styles.sectionHeader}>
        <div style={styles.headerTitleRow}>
          <span style={styles.headerIcon}>🤖</span>
          <div>
            <h3 style={styles.sectionTitle}>AI Smart Recommendations</h3>
            <p style={styles.sectionSubtitle}>Ranked suggestions matching title, description keywords, locations, and timelines</p>
          </div>
        </div>
        <span style={styles.matchingModelBadge}>Deterministic NLP Model v1.2</span>
      </header>

      <div style={styles.matchesGrid}>
        {matches.map((match) => {
          const matchedItem = match.item;
          const candidatePath = type === 'lost' ? `/found-items/${matchedItem._id}` : `/lost-items/${matchedItem._id}`;
          const isOwner = currentUser && matchedItem.user && (
            matchedItem.user._id?.toString() === currentUser.id?.toString() ||
            matchedItem.user.toString() === currentUser.id?.toString() ||
            matchedItem.user._id?.toString() === currentUser._id?.toString() ||
            matchedItem.user.toString() === currentUser._id?.toString()
          );

          return (
            <div key={matchedItem._id} style={styles.matchCard}>
              <div style={styles.imageWrapper}>
                {matchedItem.imageUrl ? (
                  <img src={matchedItem.imageUrl} alt={matchedItem.title} style={styles.matchImage} />
                ) : (
                  <div style={styles.matchImagePlaceholder}>
                    <span style={styles.placeholderIcon}>{type === 'lost' ? '🔍' : '📦'}</span>
                  </div>
                )}
                <div style={{ ...styles.confidenceBadge, ...getBadgeStyles(match.confidence) }}>
                  {match.confidence}
                </div>
              </div>

              <div style={styles.cardDetails}>
                <h4 style={styles.matchTitle}>{matchedItem.title}</h4>
                <div style={styles.metaInfo}>
                  <div style={styles.metaRow}>
                    <span style={styles.metaIcon}>📍</span>
                    <span style={styles.metaText}>{matchedItem.location}</span>
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.metaIcon}>📅</span>
                    <span style={styles.metaText}>
                      {new Date(matchedItem.date || matchedItem.dateFound).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div style={styles.scoreSection}>
                  <div style={styles.scoreTextRow}>
                    <span style={styles.scoreLabel}>Similarity Index</span>
                    <strong style={{ color: getProgressBarColor(match.score) }}>{match.score}%</strong>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${match.score}%`,
                        backgroundColor: getProgressBarColor(match.score)
                      }}
                    ></div>
                  </div>
                  {/* Score breakdown tooltip text */}
                  <p style={styles.breakdownText}>
                    Title: {match.breakdown.title}% | Desc: {match.breakdown.description}% | Loc: {match.breakdown.location}% | Date: {match.breakdown.date}%
                  </p>
                </div>

                <div style={styles.actionRow}>
                  <Link to={candidatePath} style={styles.btnView}>
                    👁️ View Details
                  </Link>
                  {!isOwner && (
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          navigate('/login', { state: { from: candidatePath } });
                        } else {
                          // If target type is lost, candidate type is found. We claim it!
                          navigate(`/claim/${matchedItem._id}?type=${type === 'lost' ? 'found' : 'lost'}`);
                        }
                      }}
                      style={styles.btnClaim}
                    >
                      🤝 Claim
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  sectionContainer: {
    marginTop: '40px',
    backgroundColor: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '24px',
    padding: '30px',
    animation: 'fadeIn 0.5s ease-out',
    boxShadow: 'var(--shadow-md)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '15px',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '20px',
    marginBottom: '24px',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerIcon: {
    fontSize: '1.5rem',
    background: 'rgba(245, 158, 11, 0.08)',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(245, 158, 11, 0.15)',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  sectionSubtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    margin: '4px 0 0 0',
  },
  matchingModelBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '4px 12px',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: '20px',
    color: '#F59E0B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  matchesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  matchCard: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    boxShadow: 'var(--shadow-sm)',
    position: 'relative',
    boxSizing: 'border-box',
  },
  imageWrapper: {
    position: 'relative',
    height: '160px',
    width: '100%',
    backgroundColor: 'slate-950/10',
    borderBottom: '1px solid var(--border-subtle)',
  },
  matchImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  matchImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  placeholderIcon: {
    fontSize: '2.5rem',
    opacity: 0.4,
  },
  confidenceBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '0.62rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardDetails: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  matchTitle: {
    fontSize: '0.92rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  },
  metaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  metaIcon: {
    fontSize: '0.9rem',
    color: 'var(--accent-primary)',
  },
  metaText: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
  },
  scoreSection: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '16px',
  },
  scoreTextRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  scoreLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  progressBarBg: {
    height: '6px',
    width: '100%',
    backgroundColor: 'var(--border-subtle)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease-in-out',
  },
  breakdownText: {
    fontSize: '0.62rem',
    color: 'var(--text-secondary)',
    margin: 0,
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: '-0.02em',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    marginTop: 'auto',
  },
  btnView: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '9999px',
    color: 'var(--text-primary)',
    fontSize: '0.78rem',
    fontWeight: '700',
    textDecoration: 'none',
    textAlign: 'center',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  btnClaim: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: '#F59E0B',
    border: 'none',
    borderRadius: '9999px',
    color: '#0c0c0e',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  loadingContainer: {
    marginTop: '40px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '24px',
    padding: '30px',
  },
  pulseTitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    marginBottom: '20px',
    animation: 'pulse 1.5s infinite',
  },
  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  skeletonCard: {
    height: '240px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '20px',
    padding: '16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  skeletonImage: {
    height: '100px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
  },
  skeletonTextRow: {
    height: '16px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '4px',
    width: '80%',
  },
  skeletonTextRowShort: {
    height: '16px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '4px',
    width: '40%',
  },
  errorAlert: {
    marginTop: '40px',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  errorIcon: {
    fontSize: '1.25rem',
  },
  emptyContainer: {
    marginTop: '40px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '24px',
    padding: '40px 20px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-md)',
  },
  aiIconBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.5rem',
    margin: '0 auto 16px auto',
  },
  emptyTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 8px 0',
  },
  emptyDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    margin: 0,
    maxWidth: '440px',
    margin: '0 auto',
    lineHeight: '1.5',
  }
};

export default AIMatchesSection;

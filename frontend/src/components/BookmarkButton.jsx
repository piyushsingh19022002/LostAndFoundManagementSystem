import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const BookmarkButton = ({ itemId, itemModel, initialIsFavorited = false, onToggle }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      if (isFavorited) {
        await API.delete(`/favorites/${itemId}`);
        setIsFavorited(false);
        if (onToggle) onToggle(itemId, false);
      } else {
        await API.post(`/favorites/${itemId}`, { itemModel });
        setIsFavorited(true);
        if (onToggle) onToggle(itemId, true);
      }
    } catch (err) {
      console.error('Error toggling bookmark status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      style={{
        ...styles.btn,
        ...(hovered ? styles.btnHover : {}),
      }}
      title={isFavorited ? 'Remove from Bookmarks' : 'Bookmark this item'}
      aria-label={isFavorited ? 'Remove from Bookmarks' : 'Bookmark this item'}
    >
      {loading ? (
        <span style={styles.spinner}></span>
      ) : isFavorited ? (
        // Filled Heart SVG
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          stroke="#f43f5e"
          strokeWidth="2.5"
          fill="#f43f5e"
          style={styles.svg}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        // Outlined Heart SVG
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          stroke={hovered ? '#f43f5e' : '#9ca3af'}
          strokeWidth="2"
          fill="none"
          style={styles.svg}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )}
    </button>
  );
};

const styles = {
  btn: {
    background: 'rgba(17, 24, 39, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '50%',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
    padding: 0,
    outline: 'none',
  },
  btnHover: {
    transform: 'scale(1.1)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
    background: 'rgba(244, 63, 94, 0.1)',
    boxShadow: '0 4px 15px rgba(244, 63, 94, 0.2)',
  },
  svg: {
    transition: 'all 0.2s ease',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(244, 63, 94, 0.1)',
    borderTop: '2px solid #f43f5e',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export default BookmarkButton;

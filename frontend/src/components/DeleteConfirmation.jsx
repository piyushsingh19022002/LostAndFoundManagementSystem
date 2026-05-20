import React from 'react';

/**
 * DeleteConfirmation — Premium modal component for safety verification on destructive actions.
 *
 * Props:
 *   isOpen: boolean
 *   itemTitle: string
 *   onConfirm: callback
 *   onCancel: callback
 */
const DeleteConfirmation = ({ isOpen, itemTitle, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.iconContainer}>
          ⚠️
        </div>
        <h3 style={styles.heading}>Confirm Deletion</h3>
        <p style={styles.text}>
          Are you sure you want to permanently delete <strong>"{itemTitle}"</strong>?
          This action cannot be undone and will remove it from the public feed.
        </p>
        <div style={styles.buttonGroup}>
          <button onClick={onCancel} style={styles.btnCancel}>
            Cancel
          </button>
          <button onClick={onConfirm} style={styles.btnConfirm}>
            Delete Report
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '440px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
  },
  heading: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  text: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    marginTop: '8px',
  },
  btnCancel: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  btnConfirm: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
    transition: 'all 0.15s ease',
  }
};

export default DeleteConfirmation;

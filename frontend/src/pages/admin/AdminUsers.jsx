import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import TableSkeleton from '../../components/ui/TableSkeleton';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Search states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Deletion overlay states
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get(`/admin/users`, {
        params: {
          page,
          limit: 8
        }
      });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setTotalUsers(res.data.totalUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await API.delete(`/admin/user/${userToDelete._id}`);
      setFeedbackMessage({
        text: res.data.message || 'User and all associated data deleted successfully.',
        type: 'success'
      });
      setShowConfirm(false);
      setUserToDelete(null);
      
      // If we deleted the last user on the current page, go back a page
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setFeedbackMessage({
        text: err.response?.data?.message || 'Failed to delete user account.',
        type: 'error'
      });
    } finally {
      setDeleteLoading(false);
      setTimeout(() => setFeedbackMessage({ text: '', type: '' }), 4000);
    }
  };

  // Local filtering based on query (since user endpoint might not support backend search natively yet,
  // we combine pagination with client-side filter of the current page, or search bar)
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <span style={styles.pretitle}>SaaS Platform Accounts</span>
          <h1 style={styles.title}>User Directory</h1>
        </div>
        <div style={styles.statsBadge}>
          Total Users: {totalUsers}
        </div>
      </header>

      {/* Action/Filter row */}
      <div style={styles.filterRow}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={styles.btnClearSearch}>
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Action Feedback Messages */}
      {feedbackMessage.text && (
        <div style={{
          ...styles.toast,
          backgroundColor: feedbackMessage.type === 'success' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          borderColor: feedbackMessage.type === 'success' ? '#34d399' : '#ef4444',
          color: feedbackMessage.type === 'success' ? '#34d399' : '#ef4444',
        }}>
          {feedbackMessage.type === 'success' ? '✅' : '⚠️'} {feedbackMessage.text}
        </div>
      )}

      {loading ? (
        <div className="w-full">
          <TableSkeleton rows={6} cols={5} />
        </div>
      ) : error ? (
        <div style={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={fetchUsers} style={styles.retryBtn}>Retry</button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={styles.emptyContainer}>
          <span style={styles.emptyIcon}>👤</span>
          <h3>No users found</h3>
          <p style={{ color: '#9ca3af', margin: '5px 0 15px 0' }}>
            {searchQuery ? 'Try adjusting your search filters.' : 'There are currently no registered users.'}
          </p>
        </div>
      ) : (
        <>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Profile & User</th>
                  <th style={styles.th}>Email Address</th>
                  <th style={styles.th}>Role Permission</th>
                  <th style={styles.th}>Registered Date</th>
                  <th style={styles.thAction}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} style={styles.tr}>
                    <td style={styles.tdUser}>
                      <div style={styles.avatar}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={styles.userName}>{user.name}</div>
                        <div style={styles.userId}>ID: {user._id}</div>
                      </div>
                    </td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.roleBadge,
                        backgroundColor: user.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        borderColor: user.role === 'admin' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)',
                        color: user.role === 'admin' ? '#ef4444' : '#3b82f6',
                      }}>
                        {user.role === 'admin' ? '🛡️ Administrator' : '👤 User'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td style={styles.tdAction}>
                      <button 
                        onClick={() => handleDeleteClick(user)} 
                        style={styles.btnDelete}
                        title="Delete account & all data"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div style={styles.pagination}>
            <button 
              onClick={() => setPage(p => Math.max(p - 1, 1))} 
              disabled={page === 1}
              style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}
            >
              &larr; Previous
            </button>
            <span style={styles.pageInfo}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button 
              onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
              disabled={page === totalPages}
              style={{ ...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {}) }}
            >
              Next &rarr;
            </button>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <span style={styles.modalWarningIcon}>⚠️</span>
            <h2 style={styles.modalTitle}>Critical Administrative Action</h2>
            <p style={styles.modalText}>
              Are you sure you want to permanently delete user <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
            </p>
            <div style={styles.cascadeWarning}>
              <strong style={{ color: '#ef4444' }}>CRITICAL CASCADE EFFECT:</strong>
              <ul style={styles.warningList}>
                <li>All reported items and claims by this user will be purged.</li>
                <li>All chat rooms, messages, and claims associated with this user will be removed.</li>
                <li>This process is irreversible.</li>
              </ul>
            </div>
            <div style={styles.modalActions}>
              <button 
                onClick={() => {
                  setShowConfirm(false);
                  setUserToDelete(null);
                }} 
                disabled={deleteLoading}
                style={styles.btnCancel}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete} 
                disabled={deleteLoading}
                style={styles.btnConfirmDelete}
              >
                {deleteLoading ? 'Processing Cascade Deletion...' : 'Yes, Delete Account & Purge Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    animation: 'fadeIn 0.5s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  pretitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#f43f5e',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: '4px 0 0 0',
    background: 'linear-gradient(to right, #ffffff, #9ca3af)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statsBadge: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    color: '#e5e7eb',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  filterRow: {
    marginBottom: '20px',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '450px',
    background: 'rgba(17, 24, 39, 0.5)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#6b7280',
    fontSize: '0.9rem',
  },
  searchInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    padding: '12px 12px 12px 38px',
    fontSize: '0.9rem',
  },
  btnClearSearch: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0 12px',
  },
  tableWrapper: {
    background: 'rgba(17, 24, 39, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '16px 20px',
    background: 'rgba(17, 24, 39, 0.8)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#9ca3af',
    fontWeight: '700',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  thAction: {
    padding: '16px 20px',
    background: 'rgba(17, 24, 39, 0.8)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#9ca3af',
    fontWeight: '700',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'right',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    }
  },
  td: {
    padding: '18px 20px',
    fontSize: '0.9rem',
    color: '#e5e7eb',
    verticalAlign: 'middle',
  },
  tdUser: {
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    color: '#ffffff',
    fontSize: '0.95rem',
    boxShadow: '0 4px 10px rgba(244, 63, 94, 0.2)',
  },
  userName: {
    fontWeight: '600',
    color: '#ffffff',
    fontSize: '0.9rem',
  },
  userId: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '2px',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    border: '1px solid',
  },
  tdAction: {
    padding: '18px 20px',
    textAlign: 'right',
  },
  btnDelete: {
    padding: '6px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    color: '#ef4444',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#ef4444',
      color: '#ffffff',
    }
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
  },
  pageBtn: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
  },
  pageBtnDisabled: {
    opacity: '0.4',
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '0.9rem',
    color: '#9ca3af',
  },
  loadingContainer: {
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(244, 63, 94, 0.1)',
    borderTop: '3px solid #f43f5e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  retryBtn: {
    padding: '6px 14px',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '50px 20px',
    background: 'rgba(17, 24, 39, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '15px',
  },
  toast: {
    padding: '14px 20px',
    border: '1px solid',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    animation: 'fadeIn 0.3s ease-out',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  modal: {
    background: '#111827',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 0.1)',
    textAlign: 'center',
    animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  modalWarningIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '15px',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 10px 0',
  },
  modalText: {
    fontSize: '0.95rem',
    color: '#e5e7eb',
    margin: '0 0 20px 0',
    lineHeight: '1.5',
  },
  cascadeWarning: {
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'left',
    marginBottom: '25px',
  },
  warningList: {
    margin: '8px 0 0 0',
    paddingLeft: '20px',
    fontSize: '0.85rem',
    color: '#9ca3af',
    lineHeight: '1.6',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  btnCancel: {
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  btnConfirmDelete: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s ease',
  },
};

export default AdminUsers;

import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import TableSkeleton from '../../components/ui/TableSkeleton';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiSearch, FiX, FiTrash2, FiAlertTriangle, FiUser, FiMail, FiCalendar, FiRefreshCw, FiChevronLeft, FiChevronRight, FiShield } from 'react-icons/fi';

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
        params: { page, limit: 8 }
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

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--accent-primary)] mb-1">// SaaS Platform Accounts</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] uppercase">User Directory</h1>
        </div>
        <Badge variant="neutral" className="text-xs px-4 py-1.5">
          Total Users: {totalUsers}
        </Badge>
      </div>

      {/* Search Row */}
      <div className="relative flex items-center max-w-md">
        <FiSearch className="absolute left-4 text-[var(--text-secondary)] text-sm" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 glass-panel rounded-full text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none border border-border-subtle focus:border-[var(--accent-primary)]/40 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        )}
      </div>

      {/* Feedback Toast */}
      {feedbackMessage.text && (
        <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-mono border ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {feedbackMessage.type === 'success' ? '✓' : <FiAlertTriangle />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Table or States */}
      {loading ? (
        <div className="w-full">
          <TableSkeleton rows={6} cols={5} />
        </div>
      ) : error ? (
        <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl px-4 py-3 text-sm font-mono">
          <span className="flex items-center gap-2"><FiAlertTriangle /> {error}</span>
          <Button variant="danger" size="sm" onClick={fetchUsers}>Retry</Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="text-center py-16 border border-dashed border-border-subtle">
          <FiUser className="text-3xl text-[var(--text-secondary)] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase mb-1">No Users Found</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {searchQuery ? 'Try adjusting your search filters.' : 'There are currently no registered users.'}
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden border border-border-subtle p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-subtle bg-slate-500/5">
                    <th className="px-5 py-3.5 text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)]">Profile & User</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)]">Email Address</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)]">Role</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)]">Registered</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, i) => (
                    <tr
                      key={user._id}
                      className={`border-b border-border-subtle hover:bg-slate-500/5 transition-colors ${
                        i === filteredUsers.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center flex-shrink-0 font-bold text-rose-400 text-sm">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[var(--text-primary)]">{user.name}</div>
                            <div className="text-[10px] font-mono text-[var(--text-secondary)] truncate max-w-[140px]">ID: {user._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                          <FiMail className="text-[var(--accent-primary)] text-xs flex-shrink-0" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {user.role === 'admin' ? (
                          <Badge variant="error" className="flex items-center gap-1 w-fit">
                            <FiShield className="text-[8px]" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="flex items-center gap-1 w-fit">
                            <FiUser className="text-[8px]" />
                            User
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                          <FiCalendar className="text-[var(--accent-primary)] text-xs flex-shrink-0" />
                          {new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 flex items-center gap-1.5 ml-auto"
                        >
                          <FiTrash2 className="text-xs" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5"
            >
              <FiChevronLeft className="text-xs" />
              Previous
            </Button>
            <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">
              Page <strong className="text-[var(--text-primary)]">{page}</strong> of <strong className="text-[var(--text-primary)]">{totalPages}</strong>
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5"
            >
              Next
              <FiChevronRight className="text-xs" />
            </Button>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <Card className="max-w-md w-full text-center border border-rose-500/25 shadow-[0_0_40px_rgba(239,68,68,0.1)] p-8">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl mx-auto mb-5">
              <FiAlertTriangle />
            </div>
            <h2 className="text-base font-extrabold uppercase tracking-tight text-[var(--text-primary)] mb-2">Critical Administrative Action</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed">
              Permanently delete user <strong className="text-[var(--text-primary)]">{userToDelete?.name}</strong> ({userToDelete?.email})?
            </p>
            <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-4 text-left mb-6">
              <strong className="text-[10px] font-bold font-mono uppercase tracking-widest text-rose-400 block mb-2">Critical Cascade Effect:</strong>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                <li>All reported items and claims will be purged.</li>
                <li>All chat rooms and messages will be removed.</li>
                <li>This process is irreversible.</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => { setShowConfirm(false); setUserToDelete(null); }}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Processing...' : 'Delete & Purge'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

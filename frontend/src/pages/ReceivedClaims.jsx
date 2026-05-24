import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { FiMapPin, FiCalendar, FiMessageSquare, FiAlertTriangle, FiInbox, FiSearch, FiGift, FiUser, FiMail, FiCheck, FiX } from 'react-icons/fi';

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

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved ✓';
      case 'rejected':
        return 'Rejected ✗';
      case 'pending':
      default:
        return 'Pending ⏳';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader size="50px" color="var(--accent-primary)" />
        <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">// Loading incoming claims...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-12 px-4 max-w-5xl mx-auto w-full">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3 uppercase">Received Claim Requests</h1>
        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-mono">// Review and process claim reports submitted by other users</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl p-4 mb-8 font-mono text-sm">
          <FiAlertTriangle className="text-lg flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && claims.length === 0 ? (
        <Card className="flex flex-col items-center text-center p-12 max-w-xl mx-auto border border-dashed border-border-subtle">
          <div className="w-16 h-16 rounded-full bg-slate-950/20 border border-[var(--accent-primary)]/30 flex items-center justify-center text-2xl text-[var(--accent-primary)] mb-6">
            <FiInbox />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 uppercase">No Claim Requests Received</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm">
            You haven't received any claim requests on your reported items yet. When someone submits a claim, it will appear here for your review.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {claims.map((claim) => {
            const itemData = claim.item || {};
            const claimerData = claim.claimer || {};
            const isLost = itemData.category === 'Lost' || claim.itemModel === 'Item';

            return (
              <Card key={claim._id} className="relative flex flex-col md:flex-row gap-6 p-6 border border-border-subtle">
                {/* Thumbnail or placeholder */}
                <div className="w-full md:w-36 h-36 rounded-2xl bg-slate-950/20 border border-border-subtle overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                  {itemData.imageUrl ? (
                    <img
                      src={itemData.imageUrl}
                      alt={itemData.title || 'Claimed Item'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-[var(--accent-primary)]">
                      {isLost ? <FiSearch /> : <FiGift />}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <Badge variant={isLost ? 'error' : 'success'}>
                        {isLost ? 'Lost Item' : 'Found Item'}
                      </Badge>
                      <Badge variant={getStatusVariant(claim.status)}>
                        {getStatusLabel(claim.status)}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-tight mb-2">
                      {itemData.title || 'Deleted Item'}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                      <div className="flex items-center gap-1.5">
                        <FiMapPin className="text-[var(--accent-primary)]" />
                        <span>{itemData.location || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="text-[var(--accent-primary)]" />
                        <span>Date Submitted: {new Date(claim.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Claimer Information Card */}
                    <div className="bg-slate-950/20 border border-border-subtle rounded-2xl p-4 mb-4">
                      <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)] block mb-2">
                        // Claimer Info
                      </span>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 text-[var(--text-primary)]">
                          <FiUser className="text-[var(--accent-primary)] text-xs" />
                          <span>{claimerData.name || 'Anonymous User'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--text-primary)]">
                          <FiMail className="text-[var(--accent-primary)] text-xs" />
                          {claimerData.email ? (
                            <a href={`mailto:${claimerData.email}`} className="hover:underline text-[var(--text-primary)]">
                              {claimerData.email}
                            </a>
                          ) : (
                            <span className="text-[var(--text-secondary)]">No email provided</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/20 border border-border-subtle rounded-2xl p-4 mb-4">
                      <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)] block mb-1">
                        // Submitted Message / Proof
                      </span>
                      <p className="text-sm italic text-[var(--text-primary)]">
                        "{claim.message}"
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-3 items-center justify-between border-t border-border-subtle pt-4">
                    {/* Approve / Reject Actions (Only visible for Pending claims) */}
                    {claim.status === 'pending' ? (
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-300 flex items-center gap-1.5"
                          onClick={() => handleStatusUpdate(claim._id, 'approved')}
                          disabled={actionLoadingId !== null}
                        >
                          <FiCheck className="text-xs" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-300 flex items-center gap-1.5"
                          onClick={() => handleStatusUpdate(claim._id, 'rejected')}
                          disabled={actionLoadingId !== null}
                        >
                          <FiX className="text-xs" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="text-xs font-mono text-[var(--text-secondary)] uppercase">
                        // Processed
                      </div>
                    )}

                    {claim.status !== 'rejected' && (
                      <Link to={`/chat/${claim._id}`}>
                        <Button variant="secondary" size="sm" className="flex items-center gap-2">
                          <FiMessageSquare className="text-xs" />
                          Open Chat
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReceivedClaims;

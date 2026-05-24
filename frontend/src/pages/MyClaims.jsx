import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { FiMapPin, FiCalendar, FiMessageSquare, FiAlertTriangle, FiInbox, FiSearch, FiGift } from 'react-icons/fi';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const res = await API.get('/claims/my-claims');
        setClaims(res.data);
        setError('');
      } catch (err) {
        console.error('Error fetching my claims:', err);
        setError(err.response?.data?.message || 'Failed to fetch claim requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

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
        <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">// Loading your claims...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-12 px-4 max-w-5xl mx-auto w-full">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3 uppercase">My Claim Requests</h1>
        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-mono">// Track and monitor the status of items you've claimed</p>
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
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 uppercase">No Claims Submitted Yet</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-sm">
            You haven't submitted any claim requests. If you see an item that belongs to you or you've found an item matching a report, you can claim it from the details page.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/lost-items">
              <Button variant="primary">Browse Lost Items</Button>
            </Link>
            <Link to="/found-items">
              <Button variant="secondary">Browse Found Items</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {claims.map((claim) => {
            const itemData = claim.item || {};
            const ownerData = claim.owner || {};
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
                        <span>Submitted: {new Date(claim.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/20 border border-border-subtle rounded-2xl p-4 mb-4">
                      <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)] block mb-1">
                        // Your Submitted Message
                      </span>
                      <p className="text-sm italic text-[var(--text-primary)]">
                        "{claim.message}"
                      </p>
                    </div>

                    {/* Display Owner / Reporter Info if Approved */}
                    {claim.status === 'approved' && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-4">
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-emerald-400 block mb-2">
                          // Reporter Contact Details
                        </span>
                        <div className="space-y-1.5 text-sm">
                          <p className="text-[var(--text-primary)]">
                            <strong className="text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] mr-2">Name:</strong>
                            {ownerData.name || 'N/A'}
                          </p>
                          {ownerData.email && (
                            <p className="text-[var(--text-primary)]">
                              <strong className="text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] mr-2">Email:</strong>
                              <a href={`mailto:${ownerData.email}`} className="text-[var(--accent-primary)] hover:underline font-semibold">
                                {ownerData.email}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {claim.status !== 'rejected' && (
                    <div className="mt-2 flex">
                      <Link to={`/chat/${claim._id}`}>
                        <Button variant="secondary" size="sm" className="flex items-center gap-2">
                          <FiMessageSquare className="text-xs" />
                          Open Chat
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyClaims;

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import { AuthContext } from '../context/AuthContext';
import { showSuccess, showError, showWarning, showPromise } from '../utils/toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { FiFileText, FiMapPin, FiCalendar, FiGift, FiSearch, FiArrowLeft } from 'react-icons/fi';

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

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await API.get(fetchUrl);
        setItem(res.data);
      } catch (err) {
        console.error('Error fetching item details:', err);
        showError(err.response?.data?.message || 'Failed to retrieve item details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id, fetchUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      showWarning('Please enter a message detailing your proof of ownership or recovery details.');
      return;
    }

    setSubmitting(true);

    const submitAction = async () => {
      const response = await API.post('/claims', {
        itemId: id,
        itemModel,
        message,
      });
      return response.data;
    };

    showPromise(submitAction(), {
      loading: 'Submitting your claim request...',
      success: () => {
        setTimeout(() => {
          navigate('/my-claims');
        }, 1500);
        return 'Claim request submitted successfully!';
      },
      error: (err) => {
        setSubmitting(false);
        return err.response?.data?.message || 'An error occurred while submitting your claim request.';
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader size="50px" color="var(--accent-primary)" />
        <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Retrieving item information...</p>
      </div>
    );
  }

  const isLost = item?.category === 'Lost' || type === 'lost';
  const itemImage = item?.imageUrl;

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4 py-8 relative">
      <Card className="w-full max-w-2xl p-6 md:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-full border border-[var(--accent-primary)]/30 bg-slate-950/20 items-center justify-center text-[var(--accent-primary)] font-bold text-xl mb-4 shadow-[0_0_12px_var(--glow-color)]">
            <FiFileText className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-2">Submit Claim Request</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Provide details or proof of ownership to contact the reporter of this item.
          </p>
        </div>

        {/* Item Summary Preview Card */}
        {item && (
          <div className="flex items-center gap-5 p-4 border border-border-subtle bg-slate-950/10 rounded-2xl mb-8">
            {itemImage ? (
              <img src={itemImage} alt={item.title} className="w-16 h-16 object-cover rounded-xl border border-border-subtle" />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-slate-950/20 border border-border-subtle rounded-xl text-xl">
                {isLost ? <FiSearch className="text-rose-400" /> : <FiGift className="text-emerald-400" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider uppercase border mb-1.5 ${
                isLost 
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/15' 
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15'
              }`}>
                {isLost ? 'Lost Item' : 'Found Item'}
              </span>
              <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{item.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-1 font-mono uppercase tracking-wider">
                📍 {item.location}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="message" className="block text-xs font-bold text-[var(--text-secondary)] font-mono uppercase tracking-widest mb-2">
              // Proof of Ownership / Message to Owner
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
              className="w-full px-4 py-3 bg-slate-950/20 border border-border-subtle focus:border-[var(--accent-primary)]/50 focus:ring-2 focus:ring-[var(--accent-primary)]/10 rounded-2xl text-[var(--text-primary)] text-sm outline-none transition-all resize-vertical"
              disabled={submitting}
              required
            />
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={submitting}
            >
              Submit Claim
            </Button>
            
            <Link 
              to={isLost ? `/lost-items/${id}` : `/found-items/${id}`} 
              className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              Cancel & Return
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClaimItem;

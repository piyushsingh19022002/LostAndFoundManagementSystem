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
        <Loader size="50px" color="#4f46e5" />
        <p className="text-sm text-slate-400 font-medium">Retrieving item information...</p>
      </div>
    );
  }

  const isLost = item?.category === 'Lost' || type === 'lost';
  const itemImage = item?.imageUrl;

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4 py-8">
      {/* Accent blur elements */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <Card className="w-full max-w-2xl border border-slate-800 shadow-2xl p-6 md:p-10 bg-slate-900/60 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-600 items-center justify-center text-white font-bold text-xl mb-4 shadow shadow-indigo-500/20">
            <FiFileText className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Submit Claim Request</h2>
          <p className="text-sm text-slate-400">
            Provide details or proof of ownership to contact the reporter of this item.
          </p>
        </div>

        {/* Item Summary Preview Card */}
        {item && (
          <div className="flex items-center gap-5 p-4 border border-slate-800 bg-slate-950/40 rounded-xl mb-8">
            {itemImage ? (
              <img src={itemImage} alt={item.title} className="w-20 h-20 object-cover rounded-lg border border-slate-800" />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-slate-900 border border-slate-850 rounded-lg text-2xl">
                {isLost ? <FiSearch className="text-rose-400" /> : <FiGift className="text-emerald-400" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border mb-1.5 ${
                isLost 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {isLost ? 'Lost Item' : 'Found Item'}
              </span>
              <h3 className="text-base font-bold text-white truncate">{item.title}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <FiMapPin className="text-indigo-400" /> {item.location}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-slate-300 mb-2">
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
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-850 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-200 text-sm outline-none transition-all resize-vertical"
              disabled={submitting}
              required
            />
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              variant={isLost ? "primary" : "secondary"}
              className={`w-full justify-center py-3 text-white ${
                isLost 
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10' 
                  : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/20 shadow-emerald-500/10'
              }`}
              disabled={submitting}
            >
              Submit Claim
            </Button>
            
            <Link 
              to={isLost ? `/lost-items/${id}` : `/found-items/${id}`} 
              className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-300 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Cancel & Return
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClaimItem;

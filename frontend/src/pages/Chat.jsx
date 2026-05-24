import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Chat = () => {
  const { claimId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch Claim details and message history
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);
        // Fetch claim details
        const claimRes = await API.get(`/claims/${claimId}`);
        setClaim(claimRes.data);

        // Fetch messages history
        const messagesRes = await API.get(`/messages/${claimId}`);
        setMessages(messagesRes.data);

        setError('');
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError(err.response?.data?.message || 'Failed to initialize chat.');
      } finally {
        setLoading(false);
      }
    };

    if (claimId) {
      fetchChatData();
    }
  }, [claimId]);

  // Connect Socket.io
  useEffect(() => {
    if (!user || loading || error) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';
    const token = localStorage.getItem('token');

    const socket = io(socketUrl, {
      auth: {
        token: `Bearer ${token}`
      }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
      socket.emit('join_room', { claimId });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    socket.on('receive_message', (populatedMessage) => {
      setMessages((prev) => {
        // Prevent duplicate appending
        if (prev.some((m) => m._id === populatedMessage._id)) {
          return prev;
        }
        return [...prev, populatedMessage];
      });
    });

    socket.on('error_message', (msg) => {
      console.error('Socket error event:', msg);
      setError(msg);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, claimId, loading, error]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    if (socketRef.current && socketConnected) {
      socketRef.current.emit('send_message', {
        claimId,
        message: newMessageText.trim(),
      });
      setNewMessageText('');
    } else {
      console.warn('Socket not connected, trying to send via REST API fallback');
      API.post('/messages', { claimId, message: newMessageText.trim() })
        .then((res) => {
          setMessages((prev) => [...prev, res.data]);
          setNewMessageText('');
        })
        .catch((err) => {
          console.error('Failed to send fallback message:', err);
          alert('Failed to send message. Please check connection.');
        });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <div className="flex flex-col items-center text-center py-10 px-6 bg-[var(--bg-card)] border border-dashed border-border-subtle rounded-3xl max-w-md w-full shadow-lg">
          <span className="text-4xl mb-4">⚠️</span>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Access Denied</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">{error}</p>
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isClaimer = claim?.claimer?._id === user?.id || claim?.claimer === user?.id;
  const chatPartner = isClaimer ? claim?.owner : claim?.claimer;
  const itemTitle = claim?.item?.title || 'Unknown Item';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-8 flex items-center justify-center transition-colors duration-300">
      <Card className="w-full max-w-3xl h-[75vh] flex flex-col p-0 overflow-hidden shadow-2xl relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-slate-950/15">
          <div className="flex flex-col gap-1">
            {loading ? (
              <div className="space-y-1.5 animate-pulse">
                <div className="w-32 h-4 bg-slate-800 rounded" />
                <div className="w-48 h-3 bg-slate-800 rounded" />
              </div>
            ) : (
              <>
                <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">{chatPartner?.name || 'Anonymous User'}</span>
                <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">Discussing: {itemTitle}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider border ${
                claim?.status === 'approved' 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15' 
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/15'
              }`}>
                {claim?.status === 'approved' ? 'Approved' : 'Pending'}
              </span>
            )}
            <button onClick={() => navigate(-1)} className="px-3 py-1.5 rounded-full border border-border-subtle bg-slate-950/20 text-[var(--text-primary)] hover:border-slate-400 transition-all font-mono text-[9px] uppercase tracking-wider font-bold cursor-pointer">
              ✕ Close
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
          {loading ? (
            <div className="space-y-4 w-full">
              <div className="flex justify-start">
                <div className="w-1/2 p-4 bg-slate-950/20 border border-border-subtle rounded-2xl rounded-bl-none animate-pulse flex flex-col gap-2">
                  <div className="w-16 h-3 bg-slate-800 rounded" />
                  <div className="w-full h-3 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="flex justify-end">
                <div className="w-2/5 p-4 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/10 rounded-2xl rounded-br-none animate-pulse flex justify-end">
                  <div className="w-4/5 h-3 bg-[var(--accent-primary)]/20 rounded" />
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]">
              <span className="text-4xl mb-3">💬</span>
              <p className="text-xs text-center max-w-xs font-mono uppercase tracking-wider leading-relaxed">No messages yet. Send a message to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender === user?.id || msg.sender?._id === user?.id;
              return (
                <div key={msg._id} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 flex flex-col gap-1 border border-border-subtle transition-all duration-300 ${
                    isMine 
                      ? 'bg-[var(--accent-primary)] text-stone-950 rounded-2xl rounded-tr-none' 
                      : 'bg-slate-950/20 text-[var(--text-primary)] rounded-2xl rounded-tl-none'
                  }`}>
                    {!isMine && (
                      <span className="text-[9px] font-bold uppercase tracking-wider font-mono text-[var(--text-secondary)]">
                        {msg.sender?.name || 'Partner'}
                      </span>
                    )}
                    <span className="text-xs leading-relaxed break-words">{msg.message}</span>
                    <span className={`text-[8px] font-mono self-end mt-1.5 opacity-80 ${isMine ? 'text-stone-850' : 'text-[var(--text-secondary)]'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border-subtle flex gap-3 bg-slate-950/15">
          <input
            type="text"
            placeholder="Type your message here..."
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            className="flex-1 bg-slate-950/20 border border-border-subtle rounded-full px-5 py-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]/50 transition-all font-sans"
          />
          <Button type="submit" variant="primary" size="sm">
            Send ➔
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Chat;

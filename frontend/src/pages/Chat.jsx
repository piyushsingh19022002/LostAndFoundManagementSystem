import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';

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
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <span style={styles.errorIcon}>⚠️</span>
          <h3 style={styles.errorTitle}>Access Denied</h3>
          <p style={styles.errorMessage}>{error}</p>
          <button onClick={() => navigate('/dashboard')} style={styles.errorBtn}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isClaimer = claim?.claimer?._id === user?.id || claim?.claimer === user?.id;
  const chatPartner = isClaimer ? claim?.owner : claim?.claimer;
  const itemTitle = claim?.item?.title || 'Unknown Item';

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {/* Chat Header */}
        <div style={styles.header}>
          <div style={styles.headerInfo}>
            {loading ? (
              <div className="space-y-1.5 animate-pulse">
                <div className="w-32 h-5 bg-slate-800 rounded" />
                <div className="w-48 h-3.5 bg-slate-850 rounded" />
              </div>
            ) : (
              <>
                <span style={styles.partnerName}>{chatPartner?.name || 'Anonymous User'}</span>
                <span style={styles.itemTitleLink}>Discussing: {itemTitle}</span>
              </>
            )}
          </div>
          <div style={styles.headerMeta}>
            {!loading && (
              <span style={{
                ...styles.statusBadge,
                backgroundColor: claim?.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: claim?.status === 'approved' ? '#34d399' : '#fbbf24',
                border: claim?.status === 'approved' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                {claim?.status === 'approved' ? 'Claim Approved ✅' : 'Claim Pending ⏳'}
              </span>
            )}
            <button onClick={() => navigate(-1)} style={styles.closeBtn}>✕ Close</button>
          </div>
        </div>

        {/* Messages Container */}
        <div style={styles.messagesContainer}>
          {loading ? (
            <div className="space-y-6 w-full">
              {/* Left message skeleton */}
              <div className="flex justify-start">
                <div className="w-1/2 p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl rounded-bl-sm animate-pulse flex flex-col gap-2.5">
                  <div className="w-16 h-3 bg-slate-800 rounded" />
                  <div className="w-full h-3.5 bg-slate-800 rounded" />
                </div>
              </div>
              {/* Right message skeleton */}
              <div className="flex justify-end">
                <div className="w-2/5 p-4 bg-indigo-950/10 border border-indigo-500/10 rounded-2xl rounded-br-sm animate-pulse flex justify-end">
                  <div className="w-4/5 h-3.5 bg-indigo-500/10 rounded" />
                </div>
              </div>
              {/* Left message skeleton */}
              <div className="flex justify-start">
                <div className="w-3/5 p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl rounded-bl-sm animate-pulse flex flex-col gap-2.5">
                  <div className="w-20 h-3 bg-slate-800 rounded" />
                  <div className="w-5/6 h-3.5 bg-slate-800 rounded" />
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div style={styles.emptyChat}>
              <span style={styles.emptyChatIcon}>💬</span>
              <p style={styles.emptyChatText}>No messages yet. Send a message to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender === user?.id || msg.sender?._id === user?.id;
              return (
                <div key={msg._id} style={{
                  ...styles.messageRow,
                  justifyContent: isMine ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    ...styles.messageBubble,
                    background: isMine ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255, 255, 255, 0.08)',
                    border: isMine ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderBottomRightRadius: isMine ? '4px' : '16px',
                    borderBottomLeftRadius: isMine ? '16px' : '4px',
                  }}>
                    {!isMine && (
                      <span style={styles.senderLabel}>
                        {msg.sender?.name || 'Partner'}
                      </span>
                    )}
                    <span style={styles.messageText}>{msg.message}</span>
                    <span style={{
                      ...styles.timestamp,
                      color: isMine ? 'rgba(255, 255, 255, 0.6)' : '#9ca3af'
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} style={styles.inputArea}>
          <input
            type="text"
            placeholder="Type your message here..."
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            style={styles.inputField}
          />
          <button type="submit" style={styles.sendButton}>
            Send ➔
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '85vh',
    background: 'radial-gradient(circle at center, #1f2937 0%, #111827 100%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBox: {
    width: '100%',
    maxWidth: '800px',
    height: '75vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(31, 41, 55, 0.55)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  partnerName: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  itemTitleLink: {
    fontSize: '0.85rem',
    color: '#9ca3af',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  closeBtn: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    textDecoration: 'none',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  messagesContainer: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
  },
  emptyChatIcon: {
    fontSize: '3rem',
    marginBottom: '12px',
  },
  emptyChatText: {
    fontSize: '0.95rem',
    textAlign: 'center',
    maxWidth: '300px',
    lineHeight: '1.5',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  senderLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#61dafb',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  messageText: {
    fontSize: '0.95rem',
    color: '#ffffff',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  timestamp: {
    fontSize: '0.7rem',
    alignSelf: 'flex-end',
    marginTop: '2px',
  },
  inputArea: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    gap: '12px',
    backgroundColor: 'rgba(17, 24, 39, 0.2)',
  },
  inputField: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  sendButton: {
    padding: '12px 24px',
    backgroundColor: '#61dafb',
    color: '#0f172a',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(97, 218, 251, 0.2)',
    transition: 'all 0.2s',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '85vh',
    background: 'radial-gradient(circle at center, #1f2937 0%, #111827 100%)',
  },
  loaderText: {
    marginTop: '16px',
    color: '#9ca3af',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  errorCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.55)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
  errorIcon: {
    fontSize: '3.5rem',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 10px 0',
  },
  errorMessage: {
    fontSize: '0.95rem',
    color: '#9ca3af',
    lineHeight: '1.5',
    margin: '0 0 24px 0',
  },
  errorBtn: {
    padding: '10px 20px',
    backgroundColor: '#61dafb',
    color: '#0f172a',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

export default Chat;

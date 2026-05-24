import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import API from '../services/api';
import { 
  FiMenu, FiX, FiBell, FiUser, FiLogOut, FiLayout, 
  FiHeart, FiPlusCircle, FiSearch, FiShield, FiFileText, 
  FiTrendingUp, FiSettings, FiPlus, FiSun, FiMoon 
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const profileRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await API.get('/notifications');
        const unread = response.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-4 z-50 mx-4 md:mx-auto max-w-7xl glass-panel rounded-full text-slate-100 transition-all duration-300 shadow-xl px-2 mt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand/Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 border border-[var(--accent-primary)]/30 flex items-center justify-center font-mono text-xs font-bold text-[var(--accent-primary)] tracking-wider transition-all duration-500 group-hover:border-[var(--accent-primary)] group-hover:shadow-[0_0_12px_var(--glow-color)] rounded-full bg-slate-950/20">
                F //
              </div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase font-sans text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                FoundIt
              </span>
            </Link>
          </div>

          {/* Desktop Core Links */}
          <div className="hidden md:flex items-center space-x-1.5">
            <Link 
              to="/lost-items" 
              className={`px-4 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-1.5 ${
                isActive('/lost-items') 
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-md' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              <FiSearch className="w-3.5 h-3.5" />
              Lost Items
            </Link>
            <Link 
              to="/found-items" 
              className={`px-4 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-1.5 ${
                isActive('/found-items') 
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-md' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              <FiPlus className="w-3.5 h-3.5" />
              Found Items
            </Link>

            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-1.5 ${
                    isActive('/dashboard') 
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-md' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  <FiLayout className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <Link 
                  to="/favorites" 
                  className={`px-4 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-1.5 ${
                    isActive('/favorites') 
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-md' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  <FiHeart className="w-3.5 h-3.5" />
                  Bookmarks
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right Hand Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-slate-950/20 hover:bg-slate-900/30 border border-border-subtle rounded-full transition-all duration-400 focus:outline-none cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <FiMoon className="w-4 h-4" /> : <FiSun className="w-4 h-4" />}
            </button>

            {user ? (
              <>
                {/* Notification Bell Icon */}
                <Link 
                  to="/notifications" 
                  className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-slate-950/20 hover:bg-slate-900/30 border border-border-subtle rounded-full transition-all duration-400"
                  title="Notifications"
                >
                  <FiBell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] font-mono font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown Trigger */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 pr-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-slate-950/20 hover:bg-slate-900/30 border border-border-subtle rounded-full transition-all duration-400 focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-full border border-border-subtle bg-slate-950/30 flex items-center justify-center text-[var(--accent-primary)] font-mono text-xs font-bold shadow">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono max-w-[80px] truncate">{user.name}</span>
                    <svg className={`w-3 h-3 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[var(--bg-secondary)] border border-border-subtle shadow-2xl py-2 text-[var(--text-primary)] focus:outline-none ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-xl">
                      {/* User Header */}
                      <div className="px-4 py-2.5 border-b border-border-subtle font-mono">
                        <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">// User Registry</p>
                        <p className="text-xs font-bold truncate text-[var(--text-primary)] mt-1">{user.name}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">{user.email}</p>
                      </div>

                      {/* Dropdown Options */}
                      <div className="p-1 font-mono text-[10px] uppercase tracking-wider">
                        <Link 
                          to="/my-items" 
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
                        >
                          <FiLayout className="w-3.5 h-3.5" />
                          My Items
                        </Link>
                        <Link 
                          to="/my-claims" 
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
                        >
                          <FiFileText className="w-3.5 h-3.5" />
                          My Claims
                        </Link>
                        <Link 
                          to="/received-claims" 
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
                        >
                          <FiFileText className="w-3.5 h-3.5" />
                          Received Claims
                        </Link>
                        <hr className="my-1 border-border-subtle" />
                        <Link 
                          to="/add-lost-item" 
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
                        >
                          <FiPlusCircle className="w-3.5 h-3.5" />
                          Add Lost Item
                        </Link>
                        <Link 
                          to="/add-found-item" 
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
                        >
                          <FiPlusCircle className="w-3.5 h-3.5" />
                          Add Found Item
                        </Link>
                        
                        {user.role === 'admin' && (
                          <>
                            <hr className="my-1 border-border-subtle" />
                            <Link 
                              to="/admin" 
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/5 transition-colors animate-pulse"
                            >
                              <FiShield className="w-3.5 h-3.5" />
                              🛡️ Admin Panel
                            </Link>
                          </>
                        )}

                        <hr className="my-1 border-border-subtle" />
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/5 transition-colors text-left font-mono cursor-pointer"
                        >
                          <FiLogOut className="w-3.5 h-3.5" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2 font-mono text-[10px] uppercase tracking-wider text-slate-950 bg-[#F59E0B] hover:bg-[#F59E0B]/90 rounded-full transition-all duration-300 shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburg/Close Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-slate-100 bg-slate-950/40 border border-slate-850 rounded transition-all duration-300 focus:outline-none"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <FiMoon className="w-4 h-4" /> : <FiSun className="w-4 h-4" />}
            </button>

            {user && (
              <Link 
                to="/notifications" 
                className="relative p-2 text-slate-400 hover:text-slate-100 bg-slate-950/60 border border-slate-850 rounded transition-all duration-300"
              >
                <FiBell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 w-2 h-2 rounded-full border border-slate-950"></span>
                )}
              </Link>
            )}
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-slate-100 bg-slate-950/60 border border-slate-850 rounded hover:bg-slate-900 transition-all duration-300"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Slide-Out Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[var(--bg-secondary)] border-t border-border-subtle animate-in slide-in-from-top duration-300 rounded-b-3xl">
          <div className="px-3 pt-3 pb-4 space-y-1 font-mono text-[10px] uppercase tracking-wider">
            <Link 
              to="/lost-items" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full ${
                isActive('/lost-items') ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              <FiSearch className="w-4 h-4 text-[var(--accent-primary)]" />
              Lost Items
            </Link>
            <Link 
              to="/found-items" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full ${
                isActive('/found-items') ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              <FiPlus className="w-4 h-4 text-[var(--accent-primary)]" />
              Found Items
            </Link>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-full ${
                    isActive('/dashboard') ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  <FiLayout className="w-4 h-4 text-[var(--accent-primary)]" />
                  Dashboard
                </Link>
                <Link 
                  to="/favorites" 
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-full ${
                    isActive('/favorites') ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  <FiHeart className="w-4 h-4 text-[var(--accent-primary)]" />
                  Bookmarks
                </Link>
                <hr className="my-1 border-border-subtle" />
                <Link 
                  to="/my-items" 
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]"
                >
                  <FiLayout className="w-4 h-4" />
                  My Items
                </Link>
                <Link 
                  to="/my-claims" 
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]"
                >
                  <FiFileText className="w-4 h-4" />
                  My Claims
                </Link>
                <Link 
                  to="/received-claims" 
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]"
                >
                  <FiFileText className="w-4 h-4" />
                  Received Claims
                </Link>
                <Link 
                  to="/add-lost-item" 
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]"
                >
                  <FiPlusCircle className="w-4 h-4" />
                  Add Lost Item
                </Link>
                <Link 
                  to="/add-found-item" 
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]"
                >
                  <FiPlusCircle className="w-4 h-4" />
                  Add Found Item
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-3 px-4 py-2.5 rounded-full text-rose-500 hover:bg-rose-500/5"
                  >
                    <FiShield className="w-4 h-4" />
                    🛡️ Admin Panel
                  </Link>
                )}

                <hr className="my-1 border-border-subtle" />
                
                <div className="px-4 py-3 border border-border-subtle rounded-3xl bg-slate-900/10 m-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full border border-border-subtle bg-slate-950/30 flex items-center justify-center text-[var(--accent-primary)] font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left font-mono">
                      <p className="text-[10px] font-bold truncate text-[var(--text-primary)]">{user.name}</p>
                      <p className="text-[9px] text-[var(--text-secondary)] truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="p-2 text-rose-500 hover:bg-rose-500/5 rounded-full transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3 py-2">
                <Link 
                  to="/login" 
                  className="flex items-center justify-center px-4 py-2 text-[10px] font-bold font-mono text-[var(--text-secondary)] bg-slate-900/10 border border-border-subtle rounded-full hover:text-[var(--text-primary)] transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center justify-center px-4 py-2 text-[10px] font-bold font-mono text-slate-950 bg-[#F59E0B] rounded-full transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

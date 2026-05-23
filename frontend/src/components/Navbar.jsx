import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  FiMenu, FiX, FiBell, FiUser, FiLogOut, FiLayout, 
  FiHeart, FiPlusCircle, FiSearch, FiShield, FiFileText, 
  FiTrendingUp, FiSettings, FiPlus 
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
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
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand/Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-content justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-xl font-bold text-white">F</span>
              </div>
              <span className="ml-2 text-xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                FoundIt
              </span>
            </Link>
          </div>

          {/* Desktop Core Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/lost-items" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/lost-items') 
                  ? 'bg-slate-800/80 text-rose-400 shadow-sm border border-slate-700/50' 
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              Lost Items
            </Link>
            <Link 
              to="/found-items" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/found-items') 
                  ? 'bg-slate-800/80 text-emerald-400 shadow-sm border border-slate-700/50' 
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              Found Items
            </Link>

            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/dashboard') 
                      ? 'bg-slate-800/80 text-indigo-400 shadow-sm border border-slate-700/50' 
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/favorites" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/favorites') 
                      ? 'bg-slate-800/80 text-rose-400 shadow-sm border border-slate-700/50' 
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  Bookmarks
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right Hand Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* Notification Bell Icon */}
                <Link 
                  to="/notifications" 
                  className="relative p-2 text-slate-400 hover:text-slate-100 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200"
                  title="Notifications"
                >
                  <FiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-slate-950 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown Trigger */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 text-slate-300 hover:text-slate-100 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold max-w-[100px] truncate">{user.name}</span>
                    <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900/95 backdrop-blur-lg border border-slate-800 shadow-2xl py-2 text-slate-200 focus:outline-none ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Header */}
                      <div className="px-4 py-2.5 border-b border-slate-800">
                        <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                        <p className="text-sm font-bold truncate text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      {/* Dropdown Options */}
                      <div className="p-1">
                        <Link 
                          to="/my-items" 
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                        >
                          <FiLayout className="w-4 h-4 text-amber-400" />
                          My Items
                        </Link>
                        <Link 
                          to="/my-claims" 
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                        >
                          <FiFileText className="w-4 h-4 text-indigo-400" />
                          My Claims
                        </Link>
                        <Link 
                          to="/received-claims" 
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                        >
                          <FiFileText className="w-4 h-4 text-emerald-400" />
                          Received Claims
                        </Link>
                        <hr className="my-1 border-slate-800" />
                        <Link 
                          to="/add-lost-item" 
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                        >
                          <FiPlusCircle className="w-4 h-4 text-rose-400" />
                          Add Lost Item
                        </Link>
                        <Link 
                          to="/add-found-item" 
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
                        >
                          <FiPlusCircle className="w-4 h-4 text-emerald-400" />
                          Add Found Item
                        </Link>
                        
                        {user.role === 'admin' && (
                          <>
                            <hr className="my-1 border-slate-800" />
                            <Link 
                              to="/admin" 
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:bg-slate-800/60 transition-colors"
                            >
                              <FiShield className="w-4 h-4" />
                              🛡️ Admin Panel
                            </Link>
                          </>
                        )}

                        <hr className="my-1 border-slate-800" />
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                        >
                          <FiLogOut className="w-4 h-4" />
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
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-slate-100 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow shadow-indigo-500/10 hover:shadow-lg transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburg/Close Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link 
                to="/notifications" 
                className="relative p-2 text-slate-400 hover:text-slate-100 bg-slate-900/60 border border-slate-800 rounded-lg transition-colors"
              >
                <FiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 w-2.5 h-2.5 rounded-full border border-slate-950"></span>
                )}
              </Link>
            )}
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900/60 border border-slate-800 rounded-lg hover:bg-slate-900 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Slide-Out Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-t border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/lost-items" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                isActive('/lost-items') ? 'bg-slate-900 text-rose-400' : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <FiSearch className="w-5 h-5 text-rose-400" />
              Lost Items
            </Link>
            <Link 
              to="/found-items" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                isActive('/found-items') ? 'bg-slate-900 text-emerald-400' : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
              }`}
            >
              <FiSearch className="w-5 h-5 text-emerald-400" />
              Found Items
            </Link>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive('/dashboard') ? 'bg-slate-900 text-indigo-400' : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                  }`}
                >
                  <FiLayout className="w-5 h-5 text-indigo-400" />
                  Dashboard
                </Link>
                <Link 
                  to="/favorites" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive('/favorites') ? 'bg-slate-900 text-rose-400' : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                  }`}
                >
                  <FiHeart className="w-5 h-5 text-rose-400" />
                  Bookmarks
                </Link>
                <hr className="my-1 border-slate-800" />
                <Link 
                  to="/my-items" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                >
                  <FiLayout className="w-5 h-5 text-amber-400" />
                  My Items
                </Link>
                <Link 
                  to="/my-claims" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                >
                  <FiFileText className="w-5 h-5 text-indigo-400" />
                  My Claims
                </Link>
                <Link 
                  to="/received-claims" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                >
                  <FiFileText className="w-5 h-5 text-emerald-400" />
                  Received Claims
                </Link>
                <Link 
                  to="/add-lost-item" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                >
                  <FiPlusCircle className="w-5 h-5 text-rose-400" />
                  Add Lost Item
                </Link>
                <Link 
                  to="/add-found-item" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                >
                  <FiPlusCircle className="w-5 h-5 text-emerald-400" />
                  Add Found Item
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-rose-400 hover:bg-slate-900"
                  >
                    <FiShield className="w-5 h-5" />
                    🛡️ Admin Panel
                  </Link>
                )}

                <hr className="my-1 border-slate-800" />
                
                <div className="px-3 py-3 border border-slate-800 rounded-lg bg-slate-900/50 m-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold truncate text-slate-200">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3 py-3">
                <Link 
                  to="/login" 
                  className="flex items-center justify-center px-4 py-2.5 text-base font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center justify-center px-4 py-2.5 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow shadow-indigo-500/10"
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

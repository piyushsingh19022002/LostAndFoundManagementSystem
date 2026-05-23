import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { 
  FiPieChart, FiTrendingUp, FiUsers, FiSearch, 
  FiArrowLeft, FiShield, FiMenu, FiX 
} from 'react-icons/fi';

const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navItems = [
    { to: "/admin", end: true, label: "Overview", icon: FiPieChart },
    { to: "/admin/analytics", label: "Analytics", icon: FiTrendingUp },
    { to: "/admin/users", label: "Users", icon: FiUsers },
    { to: "/admin/items", label: "Items", icon: FiSearch },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh] bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* Mobile Sidebar Header */}
      <div className="flex items-center justify-between px-6 py-4 md:hidden bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <FiShield className="w-6 h-6 text-rose-500" />
          <span className="font-extrabold text-lg bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            Admin Panel
          </span>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
          aria-label="Toggle admin menu"
        >
          {isMobileSidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 backdrop-blur-md md:backdrop-blur-none border-r border-slate-800 p-6 flex flex-col transition-transform duration-300 transform
        md:translate-x-0 md:static md:h-auto
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header (Desktop only) */}
        <div className="hidden md:flex items-center gap-3 mb-10">
          <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
            <FiShield className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to}
                to={item.to} 
                end={item.end}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border
                  ${isActive 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-md shadow-rose-500/5' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-transparent'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Container */}
        <div className="mt-auto border-t border-slate-800 pt-6">
          <Link 
            to="/dashboard" 
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white text-sm font-bold border border-slate-800 hover:border-slate-700 transition-all duration-200"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Overlay Backdrop for Mobile Menu */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

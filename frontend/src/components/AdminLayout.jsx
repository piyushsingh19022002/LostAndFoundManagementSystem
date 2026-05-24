import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  FiPieChart, FiTrendingUp, FiUsers, FiSearch,
  FiArrowLeft, FiShield, FiMenu, FiX
} from 'react-icons/fi';

const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin', end: true, label: 'Overview', icon: FiPieChart },
    { to: '/admin/analytics', label: 'Analytics', icon: FiTrendingUp },
    { to: '/admin/users', label: 'Users', icon: FiUsers },
    { to: '/admin/items', label: 'Items', icon: FiSearch },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh] rounded-3xl overflow-hidden border border-border-subtle shadow-2xl relative glass-panel">
      {/* Mobile Sidebar Header */}
      <div className="flex items-center justify-between px-6 py-4 md:hidden border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
            <FiShield className="w-4 h-4 text-rose-400" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)] uppercase">
            Admin Panel
          </span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 glass-panel rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-border-subtle"
          aria-label="Toggle admin menu"
        >
          {isMobileSidebarOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-border-subtle p-6 flex flex-col transition-transform duration-300 transform
        md:translate-x-0 md:static md:h-auto md:w-60
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header (Desktop only) */}
        <div className="hidden md:flex items-center gap-3 mb-10 pb-6 border-b border-border-subtle">
          <div className="w-9 h-9 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center flex-shrink-0">
            <FiShield className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-widest uppercase text-[var(--text-primary)]">
              Admin
            </h2>
            <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-secondary)]">
              // Control Center
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border
                  ${isActive
                    ? 'bg-[var(--accent-primary)] text-stone-950 border-transparent shadow-[0_4px_16px_rgba(245,158,11,0.25)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 border-transparent'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-border-subtle pt-5">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-border-subtle hover:border-[var(--accent-primary)]/40 transition-all duration-300"
          >
            <FiArrowLeft className="w-3 h-3" />
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
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

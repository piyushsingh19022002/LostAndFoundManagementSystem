import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { FiPlus, FiLogIn } from 'react-icons/fi';

const Home = () => {
  const { user, loading } = useContext(AuthContext);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-10 relative">
      <Card className="w-full max-w-4xl p-12 md:p-20 text-center relative overflow-hidden flex flex-col items-center justify-center">
        {/* Warm Orange Glow behind content */}
        <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-[var(--glow-color)] rounded-full blur-3xl -z-10 animate-pulse"></div>

        {/* Small Telemetry Category Readout */}
        <span className="text-[9px] font-bold font-mono uppercase tracking-[0.35em] text-[var(--accent-primary)] mb-6 animate-pulse">
          // lost & found recovery network active
        </span>

        {/* SpaceX / Apple style title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[var(--text-primary)] uppercase tracking-wider mb-8 leading-tight max-w-3xl font-sans">
          Find what you lost. <br />
          <span className="text-[var(--text-secondary)] font-light">Return what you found.</span>
        </h1>

        {/* Monospaced technical description */}
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed font-sans uppercase tracking-wider">
          A centralized, secure, and modern platform to report lost items and claim found belongings. Join the community to help return items to their rightful owners.
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center font-mono">
          <Link 
            to="/register" 
            className="px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-950 bg-[#F59E0B] hover:bg-[#F59E0B]/90 transition-all duration-300 shadow-[0_4px_20px_rgba(245,158,11,0.25)] flex items-center gap-2 cursor-pointer"
          >
            Get Started <FiPlus className="w-4 h-4" />
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)] border border-border-subtle hover:border-[var(--text-primary)] bg-transparent hover:bg-slate-900/10 transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            Login <FiLogIn className="w-4 h-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Home;

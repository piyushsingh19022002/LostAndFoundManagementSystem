import React from 'react';

const Badge = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono border transition-all duration-300';
  
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
    error: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
    info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    neutral: 'bg-slate-900/40 text-slate-400 border-border-subtle',
  };

  return (
    <span 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

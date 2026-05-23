import React from 'react';

const Badge = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border';
  
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-sm shadow-amber-500/5',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-sm shadow-rose-500/5',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-sm shadow-blue-500/5',
    neutral: 'bg-gray-500/10 text-gray-300 border-gray-500/20 shadow-sm shadow-gray-500/5',
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

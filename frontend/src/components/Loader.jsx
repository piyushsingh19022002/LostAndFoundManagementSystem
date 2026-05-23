import React from 'react';

const Loader = ({ 
  variant = 'inline', // inline | fullscreen | page | button
  size = 'md',        // sm | md | lg
  color = 'indigo',   // indigo | emerald | rose | white
  text,
  className = '' 
}) => {
  // Spinner sizes
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  // Spinner colors
  const colors = {
    indigo: 'border-indigo-600/20 border-t-indigo-600',
    emerald: 'border-emerald-600/20 border-t-emerald-600',
    rose: 'border-rose-600/20 border-t-rose-600',
    white: 'border-white/10 border-t-white',
  };

  const spinner = (
    <div 
      className={`animate-spin rounded-full ${sizes[size]} ${colors[color]} ${className}`}
      role="status"
      aria-label="loading"
    />
  );

  if (variant === 'button') {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className={`animate-spin rounded-full w-4 h-4 border-2 border-white/20 border-t-white`} />
        {text && <span className="text-sm font-medium">{text}</span>}
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
          <div className={`animate-spin rounded-full w-12 h-12 border-4 border-indigo-600/25 border-t-indigo-500`} />
          <p className="text-sm font-semibold text-slate-350 tracking-wide animate-pulse">
            {text || 'Processing request...'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center gap-4">
        <div className={`animate-spin rounded-full w-10 h-10 border-3 border-indigo-600/20 border-t-indigo-500`} />
        {text && (
          <p className="text-sm font-semibold text-slate-400 animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  // default: inline
  return (
    <div className="flex items-center justify-center p-4 gap-2.5">
      {spinner}
      {text && <span className="text-sm font-medium text-slate-450">{text}</span>}
    </div>
  );
};

export default Loader;

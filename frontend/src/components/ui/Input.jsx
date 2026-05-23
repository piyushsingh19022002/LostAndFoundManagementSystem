import React from 'react';

const Input = ({
  label,
  error,
  id,
  type = 'text',
  className = '',
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full bg-gray-950/80 border border-white/5 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/40 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 ${
          error ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/50' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-400 font-medium">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};

export default Input;

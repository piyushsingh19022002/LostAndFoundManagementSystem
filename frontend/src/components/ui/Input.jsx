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
        <label htmlFor={id} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full bg-slate-950/30 border border-border-subtle focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 rounded-full px-5 py-3 text-sm text-slate-100 placeholder-slate-500/50 outline-none transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          error ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[11px] text-rose-500 font-mono tracking-wide mt-1 flex items-center gap-1">
          <span>// ERROR_CODE_01:</span> {error}
        </span>
      )}
    </div>
  );
};

export default Input;

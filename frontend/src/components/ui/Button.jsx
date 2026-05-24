import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide uppercase rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none font-sans';
  
  const variants = {
    primary: 'bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-stone-950 shadow-[0_4px_16px_rgba(245,158,11,0.25)] border border-transparent cursor-pointer',
    secondary: 'glass-panel text-slate-100 hover:bg-slate-850/40 cursor-pointer',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer',
    outline: 'border border-border-subtle hover:border-slate-400 text-slate-300 bg-transparent hover:bg-slate-900/10 cursor-pointer',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-[10px] tracking-wider gap-1.5',
    md: 'px-6 py-2.5 text-xs tracking-wider gap-2',
    lg: 'px-8 py-3.5 text-sm tracking-wider gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

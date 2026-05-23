import React from 'react';

const Card = ({
  children,
  className = '',
  onClick,
  ...props
}) => {
  const isClickable = typeof onClick === 'function';
  
  return (
    <div
      onClick={onClick}
      className={`bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl transition-all duration-300 ${
        isClickable ? 'cursor-pointer hover:border-white/10 hover:bg-gray-900/60 hover:shadow-2xl hover:translate-y-[-2px]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

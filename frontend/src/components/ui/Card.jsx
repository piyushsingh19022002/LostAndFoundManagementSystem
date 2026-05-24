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
      className={`glass-panel rounded-3xl p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isClickable ? 'cursor-pointer hover:scale-[1.01] hover:shadow-2xl' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

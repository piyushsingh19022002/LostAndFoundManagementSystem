import React from 'react';

const Skeleton = ({ 
  className = '', 
  variant = 'pulse' // pulse | none
}) => {
  const animationClass = variant === 'pulse' ? 'animate-pulse' : '';
  
  return (
    <div 
      className={`${animationClass} bg-slate-800/60 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;

import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const EmptyState = ({
  title,
  description,
  icon = '🔍',
  actionText,
  actionLink,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto ${className}`}>
      {/* Icon Badge */}
      <div className="w-16 h-16 bg-gray-900 border border-white/5 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-black/25">
        {icon}
      </div>
      
      {/* Text details */}
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-6">{description}</p>
      
      {/* CTA Button */}
      {actionText && actionLink && (
        <Link to={actionLink}>
          <Button variant="outline" size="sm">
            {actionText}
          </Button>
        </Link>
      )}
    </div>
  );
};

export default EmptyState;

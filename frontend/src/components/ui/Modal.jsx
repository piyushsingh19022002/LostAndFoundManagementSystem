import React, { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl z-10 transform scale-95 opacity-0 animate-scaleUp overflow-y-auto max-h-[90vh] ${className}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div>{children}</div>
      </div>
      
      {/* Tiny CSS inject for modal animation */}
      <style>{`
        @keyframes scaleUp {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleUp {
          animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;

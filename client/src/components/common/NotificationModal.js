import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  title, 
  message,
  autoClose = true,
  autoCloseDelay = 3000
}) => {
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      default:
        return <Info className="w-6 h-6 text-blue-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-green-500/50',
          bg: 'bg-green-500/10',
          accent: 'bg-green-500'
        };
      case 'error':
        return {
          border: 'border-red-500/50',
          bg: 'bg-red-500/10',
          accent: 'bg-red-500'
        };
      case 'warning':
        return {
          border: 'border-yellow-500/50',
          bg: 'bg-yellow-500/10',
          accent: 'bg-yellow-500'
        };
      default:
        return {
          border: 'border-blue-500/50',
          bg: 'bg-blue-500/10',
          accent: 'bg-blue-500'
        };
    }
  };

  const colors = getColors();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`bg-gray-800/95 backdrop-blur-xl border ${colors.border} rounded-2xl w-full max-w-md overflow-hidden shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Accent bar */}
          <div className={`h-1 ${colors.accent}`}></div>
          
          {/* Content */}
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-xl ${colors.bg} flex-shrink-0`}>
                {getIcon()}
              </div>
              
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {title}
                  </h3>
                )}
                <p className="text-gray-300 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationModal;

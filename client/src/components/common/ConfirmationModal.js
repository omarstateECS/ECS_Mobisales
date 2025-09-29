import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'info'
  loading = false
}) => {
  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          border: 'border-red-500/50',
          bg: 'bg-red-500/10',
          accent: 'bg-red-500',
          confirmBtn: 'bg-red-600 hover:bg-red-700',
          icon: 'text-red-400'
        };
      case 'warning':
        return {
          border: 'border-yellow-500/50',
          bg: 'bg-yellow-500/10',
          accent: 'bg-yellow-500',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700',
          icon: 'text-yellow-400'
        };
      default:
        return {
          border: 'border-blue-500/50',
          bg: 'bg-blue-500/10',
          accent: 'bg-blue-500',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700',
          icon: 'text-blue-400'
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
                {type === 'danger' ? (
                  <Trash2 className={`w-6 h-6 ${colors.icon}`} />
                ) : (
                  <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
              
              <button
                onClick={onClose}
                disabled={loading}
                className="p-1 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors flex-shrink-0 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-700/50">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 ${colors.confirmBtn} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{confirmText}</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;

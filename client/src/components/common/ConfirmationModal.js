import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Ban, CheckCircle, XCircle } from 'lucide-react';

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
  const getStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          confirmBtn: 'bg-red-600 hover:bg-red-700',
          cancelBtn: 'bg-gray-700 hover:bg-gray-600'
        };
      case 'warning':
        return {
          iconBg: 'bg-orange-500/20',
          iconColor: 'text-orange-400',
          confirmBtn: 'bg-orange-600 hover:bg-orange-700',
          cancelBtn: 'bg-gray-700 hover:bg-gray-600'
        };
      case 'success':
        return {
          iconBg: 'bg-green-500/20',
          iconColor: 'text-green-400',
          confirmBtn: 'bg-green-600 hover:bg-green-700',
          cancelBtn: 'bg-gray-700 hover:bg-gray-600'
        };
      default:
        return {
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700',
          cancelBtn: 'bg-gray-700 hover:bg-gray-600'
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 100 }}
            transition={{ 
              type: "spring", 
              duration: 0.5,
              bounce: 0.3
            }}
            className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Content */}
            <div className="p-8">
              {/* Icon */}
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className={`inline-flex items-center justify-center w-16 h-16 ${styles.iconBg} rounded-full mb-6 border border-gray-700`}
              >
                {type === 'danger' && confirmText === 'Block' ? (
                  <Ban className={`w-8 h-8 ${styles.iconColor} stroke-[2.5]`} />
                ) : type === 'danger' && confirmText === 'Deactivate' ? (
                  <XCircle className={`w-8 h-8 ${styles.iconColor} stroke-[2.5]`} />
                ) : type === 'success' || (type === 'warning' && confirmText === 'Unblock') ? (
                  <CheckCircle className={`w-8 h-8 ${styles.iconColor} stroke-[2.5]`} />
                ) : type === 'danger' ? (
                  <Trash2 className={`w-8 h-8 ${styles.iconColor} stroke-[2.5]`} />
                ) : (
                  <AlertTriangle className={`w-8 h-8 ${styles.iconColor} stroke-[2.5]`} />
                )}
              </motion.div>
              
              {/* Title */}
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-white mb-3"
              >
                {title}
              </motion.h3>
              
              {/* Message */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 text-sm leading-relaxed mb-6"
              >
                {message}
              </motion.p>
              
              {/* Action buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-end space-x-3"
              >
                <button
                  onClick={onClose}
                  disabled={loading}
                  className={`${styles.cancelBtn} text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`${styles.confirmBtn} text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
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
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;

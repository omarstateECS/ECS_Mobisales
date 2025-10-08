import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  type = 'info', // 'success', 'delete', 'error', 'warning', 'info'
  title, 
  message,
  autoClose = true,
  autoCloseDelay = 3000,
  buttonText = 'Continue'
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
    const iconClasses = "w-12 h-12 stroke-[2.5]";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClasses} text-white`} />;
      case 'delete':
        return <Trash2 className={`${iconClasses} text-white`} />;
      case 'error':
        return <XCircle className={`${iconClasses} text-white`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClasses} text-white`} />;
      default:
        return <Info className={`${iconClasses} text-white`} />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          cardGradient: 'from-emerald-400 via-green-400 to-teal-500',
          cardBg: 'bg-white/10',
          buttonBg: 'bg-white/20 hover:bg-white/30',
          iconBg: 'bg-white/20'
        };
      case 'delete':
        return {
          cardGradient: 'from-red-400 via-rose-400 to-pink-500',
          cardBg: 'bg-white/10',
          buttonBg: 'bg-white/20 hover:bg-white/30',
          iconBg: 'bg-white/20'
        };
      case 'error':
        return {
          cardGradient: 'from-red-400 via-rose-400 to-pink-500',
          cardBg: 'bg-white/10',
          buttonBg: 'bg-white/20 hover:bg-white/30',
          iconBg: 'bg-white/20'
        };
      case 'warning':
        return {
          cardGradient: 'from-orange-400 via-amber-400 to-yellow-500',
          cardBg: 'bg-white/10',
          buttonBg: 'bg-white/20 hover:bg-white/30',
          iconBg: 'bg-white/20'
        };
      default:
        return {
          cardGradient: 'from-blue-400 via-cyan-400 to-sky-500',
          cardBg: 'bg-white/10',
          buttonBg: 'bg-white/20 hover:bg-white/30',
          iconBg: 'bg-white/20'
        };
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'success':
        return buttonText;
      case 'delete':
        return 'Continue';
      case 'error':
        return 'Try again';
      case 'warning':
        return 'Okay';
      default:
        return 'Update';
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
            className={`bg-gradient-to-br ${styles.cardGradient} rounded-3xl w-full max-w-md overflow-hidden shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Content */}
          <div className="p-8 text-center">
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
              className={`inline-flex items-center justify-center w-20 h-20 ${styles.iconBg} backdrop-blur-xl rounded-full mb-6 border border-white/30`}
            >
              {getIcon()}
            </motion.div>
            
            {/* Title */}
            {title && (
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-4"
              >
                {title}
              </motion.h3>
            )}
            
            {/* Message */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/90 text-sm leading-relaxed px-4"
            >
              {message}
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationModal;

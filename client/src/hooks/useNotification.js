import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    autoClose: true,
    autoCloseDelay: 3000
  });

  const showNotification = useCallback(({
    type = 'info',
    title = '',
    message = '',
    autoClose = true,
    autoCloseDelay = 3000
  }) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      autoClose,
      autoCloseDelay
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, title = 'Success') => {
    showNotification({ type: 'success', title, message, autoCloseDelay: 1500 });
  }, [showNotification]);

  const showDelete = useCallback((message, title = 'Deleted') => {
    showNotification({ type: 'delete', title, message, autoCloseDelay: 1500 });
  }, [showNotification]);

  const showError = useCallback((message, title = 'Error') => {
    showNotification({ type: 'error', title, message, autoClose: false });
  }, [showNotification]);

  const showWarning = useCallback((message, title = 'Warning') => {
    showNotification({ type: 'warning', title, message });
  }, [showNotification]);

  const showInfo = useCallback((message, title = 'Information') => {
    showNotification({ type: 'info', title, message });
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showDelete,
    showError,
    showWarning,
    showInfo
  };
};

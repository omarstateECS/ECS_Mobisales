import React, { useState } from 'react';
import NotificationModal from './common/NotificationModal';

/**
 * Demo component to showcase the new glassmorphic notification modal
 * This component demonstrates all 4 notification types:
 * - Success (green gradient)
 * - Error (red gradient)
 * - Warning (orange gradient)
 * - Info (blue gradient)
 */
const NotificationDemo = () => {
  const [activeNotification, setActiveNotification] = useState(null);

  const notifications = [
    {
      type: 'success',
      title: 'Success! Customer Added.',
      message: 'The customer has been successfully added to the system. You can now assign them to a salesman and create visits.',
      buttonText: 'Continue'
    },
    {
      type: 'delete',
      title: 'Deleted Successfully',
      message: 'The item has been permanently removed from the system. This action cannot be undone.',
      buttonText: 'Continue'
    },
    {
      type: 'warning',
      title: 'Warning: Unsaved Changes',
      message: 'You have unsaved changes that will be lost if you continue. Please save your work before proceeding.',
      buttonText: 'Okay'
    },
    {
      type: 'error',
      title: 'Oops! Error Occurred.',
      message: 'We apologize for the inconvenience caused. An error has occurred while processing your request. Please try again.',
      buttonText: 'Try again'
    }
  ];

  const showNotification = (notification) => {
    setActiveNotification(notification);
  };

  const closeNotification = () => {
    setActiveNotification(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">
          Glassmorphic Notification Modal
        </h1>
        <p className="text-gray-400 mb-8">
          Click any button below to see the beautiful notification modals in action
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notifications.map((notification, index) => (
            <button
              key={index}
              onClick={() => showNotification(notification)}
              className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                notification.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20'
                  : notification.type === 'delete'
                  ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
                  : notification.type === 'error'
                  ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
                  : notification.type === 'warning'
                  ? 'bg-orange-500/10 border-orange-500/50 hover:bg-orange-500/20'
                  : 'bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20'
              }`}
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                {notification.title}
              </h3>
              <p className="text-gray-400 text-sm">
                Click to preview {notification.type} notification
              </p>
            </button>
          ))}
        </div>

        {/* Usage Example */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Usage Example</h2>
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`// Import the component
import NotificationModal from './common/NotificationModal';
import { useNotification } from '../hooks/useNotification';

// In your component
const { notification, showSuccess, showDelete, showError, hideNotification } = useNotification();

// Show success notification (GREEN - for additions/updates)
showSuccess('Customer added successfully!');

// Show delete notification (RED - for deletions)
showDelete('Customer deleted successfully!');

// Show error notification (RED - for errors)
showError('Something went wrong!');

// Render the modal
<NotificationModal
  isOpen={notification.isOpen}
  onClose={hideNotification}
  type={notification.type}
  title={notification.title}
  message={notification.message}
  autoClose={true}
  autoCloseDelay={3000}
  buttonText="Continue"
/>`}
          </pre>
        </div>
      </div>

      {/* Active Notification */}
      {activeNotification && (
        <NotificationModal
          isOpen={true}
          onClose={closeNotification}
          type={activeNotification.type}
          title={activeNotification.title}
          message={activeNotification.message}
          buttonText={activeNotification.buttonText}
          autoClose={false}
        />
      )}
    </div>
  );
};

export default NotificationDemo;

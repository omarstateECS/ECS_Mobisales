# Glassmorphic Notification Modal Guide

## Overview
Beautiful, modern notification modals with glassmorphic design inspired by premium UI/UX patterns. Each notification type features a unique gradient background and smooth animations.

## Features
- ✨ **4 Notification Types**: Success, Error, Warning, Info
- 🎨 **Glassmorphic Design**: Frosted glass effect with backdrop blur
- 🌈 **Gradient Backgrounds**: Unique color gradients for each type
- 🎭 **Smooth Animations**: Spring-based animations using Framer Motion
- ⏱️ **Auto-close**: Optional auto-dismiss with customizable delay
- 📱 **Responsive**: Works perfectly on all screen sizes
- ♿ **Accessible**: Keyboard navigation and screen reader friendly

## Notification Types

### 1. Success (Green Gradient)
- **Colors**: Emerald → Green → Teal
- **Use Case**: Successful operations, confirmations
- **Default Button**: "Continue"
- **Auto-close**: 1.5 seconds

### 2. Error (Red Gradient)
- **Colors**: Red → Rose → Pink
- **Use Case**: Errors, failed operations
- **Default Button**: "Try again"
- **Auto-close**: Disabled (requires manual close)

### 3. Warning (Orange Gradient)
- **Colors**: Orange → Amber → Yellow
- **Use Case**: Warnings, cautions
- **Default Button**: "Okay"
- **Auto-close**: 3 seconds

### 4. Info (Blue Gradient)
- **Colors**: Blue → Cyan → Sky
- **Use Case**: Information, updates
- **Default Button**: "Update"
- **Auto-close**: 3 seconds

## Usage

### Basic Setup

```javascript
import NotificationModal from './common/NotificationModal';
import { useNotification } from '../hooks/useNotification';

function MyComponent() {
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  return (
    <>
      {/* Your component content */}
      
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  );
}
```

### Quick Methods

```javascript
// Success notification
showSuccess('Customer added successfully!');

// Error notification
showError('Failed to save data. Please try again.');

// Warning notification
showWarning('This action cannot be undone.');

// Info notification
showInfo('New update available.');
```

### Advanced Usage

```javascript
// Custom notification with all options
showNotification({
  type: 'success',
  title: 'Custom Title',
  message: 'Custom message here',
  autoClose: true,
  autoCloseDelay: 5000
});
```

### Manual Control

```javascript
const [showModal, setShowModal] = useState(false);

<NotificationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  type="success"
  title="Operation Complete"
  message="Your changes have been saved successfully."
  buttonText="Got it!"
  autoClose={false}
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | - | Controls modal visibility |
| `onClose` | function | - | Callback when modal closes |
| `type` | string | 'info' | Notification type: 'success', 'error', 'warning', 'info' |
| `title` | string | - | Modal title |
| `message` | string | - | Modal message content |
| `autoClose` | boolean | true | Enable auto-close |
| `autoCloseDelay` | number | 3000 | Auto-close delay in milliseconds |
| `buttonText` | string | varies | Custom button text (overrides default) |

## Examples

### Example 1: Success After Save
```javascript
const handleSave = async () => {
  try {
    await saveData();
    showSuccess('Data saved successfully!');
  } catch (error) {
    showError('Failed to save data.');
  }
};
```

### Example 2: Confirmation After Delete
```javascript
const handleDelete = async (id) => {
  try {
    await deleteItem(id);
    showSuccess('Item deleted successfully!', 'Deleted');
  } catch (error) {
    showError('Could not delete item.', 'Delete Failed');
  }
};
```

### Example 3: Warning Before Action
```javascript
const handleDangerousAction = () => {
  showWarning(
    'This action will permanently delete all data. Please make sure you have a backup.',
    'Warning: Permanent Action'
  );
};
```

### Example 4: Info Update
```javascript
useEffect(() => {
  if (newVersionAvailable) {
    showInfo(
      'A new version of the application is available. Please refresh to update.',
      'Update Available'
    );
  }
}, [newVersionAvailable]);
```

## Customization

### Changing Default Delays
Edit `/client/src/hooks/useNotification.js`:

```javascript
const showSuccess = useCallback((message, title = 'Success') => {
  showNotification({ 
    type: 'success', 
    title, 
    message, 
    autoCloseDelay: 2000  // Change from 1500 to 2000ms
  });
}, [showNotification]);
```

### Custom Gradient Colors
Edit `/client/src/components/common/NotificationModal.js`:

```javascript
case 'success':
  return {
    gradient: 'from-purple-400 via-pink-400 to-red-500', // Custom gradient
    cardBg: 'bg-white/10',
    buttonBg: 'bg-white/20 hover:bg-white/30',
    iconBg: 'bg-white/20'
  };
```

## Animation Details

- **Backdrop**: Fade in/out (0.3s)
- **Card**: Scale + Y-axis slide with spring physics
- **Icon**: Rotate + scale with spring bounce
- **Text**: Staggered fade-in from bottom
- **Button**: Hover scale (1.05x) and active scale (0.95x)

## Accessibility

- ✅ Click outside to close
- ✅ ESC key support (via onClose)
- ✅ Focus management
- ✅ ARIA labels
- ✅ Keyboard navigation

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Dependencies

- `framer-motion`: For animations
- `lucide-react`: For icons
- `tailwindcss`: For styling

## Demo

To see all notification types in action, import and use the demo component:

```javascript
import NotificationDemo from './components/NotificationDemo';

// In your app
<NotificationDemo />
```

## Tips

1. **Keep messages concise**: Aim for 1-2 sentences
2. **Use appropriate types**: Match the notification type to the action
3. **Don't overuse**: Only show notifications for important events
4. **Test auto-close timing**: Ensure users have enough time to read
5. **Consider accessibility**: Always provide a manual close option

## Troubleshooting

### Modal not showing
- Check `isOpen` prop is true
- Verify z-index isn't being overridden
- Ensure component is rendered in DOM

### Animations not working
- Verify `framer-motion` is installed
- Check for CSS conflicts
- Ensure no `animation: none` in global styles

### Auto-close not working
- Verify `autoClose` is true
- Check `autoCloseDelay` value
- Ensure `onClose` callback is provided

## Future Enhancements

- [ ] Sound effects
- [ ] Custom icons
- [ ] Multiple notifications queue
- [ ] Position variants (top, bottom, corner)
- [ ] Progress bar for auto-close
- [ ] Dark/light theme variants

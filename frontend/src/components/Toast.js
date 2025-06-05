import React, { useEffect, useState } from 'react';

// Simple Toast component
// onClose is added for potential manual dismissal, though this example focuses on auto-dismiss
function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true); // Trigger animation
      const timer = setTimeout(() => {
        // Start fade out or directly close
        // For simplicity, we'll just call onClose which should lead to removal from parent list
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) {
    return null;
  }

  // The 'visible' class will be used to trigger the slide-in animation
  // and to keep it visible until it's removed from the toasts array in the parent
  return (
    <div className={`toast ${type} ${visible ? 'visible' : ''}`}>
      {message}
      {/* Optional: Add a close button
      <button onClick={onClose} style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
        &times;
      </button>
      */}
    </div>
  );
}

export default Toast;

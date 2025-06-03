import React from 'react';

// Basic CSS for the spinner - can be moved to a CSS file
const spinnerStyle = {
  border: '4px solid rgba(0, 0, 0, 0.1)',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  borderLeftColor: '#007bff', // Blue color, can be themed
  animation: 'spin 1s linear infinite',
  margin: '20px auto', // Center the spinner
};

const keyframesStyle = `
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
`;

function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <style>{keyframesStyle}</style> {/* Inject keyframes */}
      <div style={spinnerStyle}></div>
      <p>{text}</p>
    </div>
  );
}

export default LoadingSpinner;

import React from 'react';

function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="loading-spinner-visual"></div>
      {text && <p>{text}</p>}
    </div>
  );
}

export default LoadingSpinner;

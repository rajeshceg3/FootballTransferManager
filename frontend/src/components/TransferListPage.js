import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner'; // Assuming we might add loading state later

// Inline styles (can be moved to CSS classes from index.css if preferred)
const pageStyle = {
  padding: '20px',
  // Using container class from index.css will provide max-width and centering
};

const messageStyle = {
  fontSize: '1.1rem',
  color: '#555',
  marginBottom: '20px',
  textAlign: 'center',
};

// No specific transfers to display yet, so no loading state is strictly needed for now.
// If we were fetching a list of transfers, we'd have loading/error states.

function TransferListPage() {
  // In a real application, you would fetch transfers from an API here.
  // For now, we'll simulate an empty list.
  const transfers = [];
  const isLoading = false; // Placeholder for loading state
  const error = null; // Placeholder for error state

  if (isLoading) {
    return <LoadingSpinner text="Loading transfers..." />;
  }

  if (error) {
    return <p className="error-message">Error loading transfers: {error.message || error}</p>;
  }

  return (
    <div style={pageStyle}>
      <h2 style={{ textAlign: 'center', color: '#1a253c' }}>Transfer Market</h2>
      {transfers.length === 0 && !isLoading ? (
        <div style={{ textAlign: 'center' }}>
          <p style={messageStyle}>No transfers to display yet. Be the first to make a move!</p>
          <Link to="/transfer/new" className="button-link button-primary" style={{ textDecoration: 'none' }}>
            Initiate New Transfer
          </Link>
        </div>
      ) : (
        <ul>
          {/* This part will be implemented when fetching transfers */}
          {/* transfers.map(transfer => (
            <li key={transfer.id}>
              <Link to={`/transfer/${transfer.id}`}>
                Player: {transfer.playerName} - Status: {transfer.status}
              </Link>
            </li>
          )) */}
        </ul>
      )}
    </div>
  );
}

export default TransferListPage;

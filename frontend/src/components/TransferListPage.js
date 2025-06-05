import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

// No specific transfers to display yet, so no loading state is strictly needed for now.
// If we were fetching a list of transfers, we'd have loading/error states.

function TransferListPage() {
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransfers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/v1/transfers');
        setTransfers(response.data || []); // Ensure transfers is always an array
        setError(null); // Clear any previous errors
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch transfers.');
        setTransfers([]); // Clear transfers on error
        console.error("Error fetching transfers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransfers();
  }, []); // Empty dependency array means this effect runs once on mount

  if (isLoading) {
    return <LoadingSpinner text="Loading transfers..." />;
  }

  if (error) {
    // .error-message class already handles styling, text-center can be added if needed
    return <p className="error-message text-center">Error: {error}</p>;
  }

  return (
    <div className="container mt-3 mb-3"> {/* Using utility classes for margin */}
      <h2 className="text-center mb-3">Transfer Market</h2>
      {transfers.length === 0 ? (
        <div className="empty-state-container"> {/* Using the standard empty state container */}
          <p>No transfers to display yet. Be the first to make a move!</p>
          {/* button-link and button-primary are from index.css */}
          <Link to="/transfer/new" className="button-link button-primary">
            Initiate New Transfer
          </Link>
        </div>
      ) : (
        <div className="table-responsive"> {/* Optional: for better small screen table handling */}
          <table className="table">
            <thead>
              <tr>
                <th>Player</th>
                <th>From Club</th>
                <th>To Club</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(transfer => (
                <tr key={transfer.id}>
                  <td>{transfer.player?.name || 'N/A'}</td>
                  <td>{transfer.fromClub?.name || 'N/A'}</td>
                  <td>{transfer.toClub?.name || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${transfer.status?.toUpperCase()}`}>
                      {transfer.status || 'N/A'}
                    </span>
                  </td>
                  <td>{transfer.initiationTimestamp ? new Date(transfer.initiationTimestamp).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <Link to={`/transfer/${transfer.id}`} className="button-link button-secondary">View Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransferListPage;

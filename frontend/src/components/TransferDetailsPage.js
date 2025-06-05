import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import Toast from './Toast'; // Import Toast component

function TransferDetailsPage() {
  const { transferId } = useParams();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null); // Error for initial data fetch
  // const [actionError, setActionError] = useState(null); // To be replaced by toasts for action feedback
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  const fetchTransferDetails = async () => {
    setLoading(true);
    setFetchError(null);
    // setActionError(null); // Not needed anymore
    try {
      const response = await axios.get(`/api/v1/transfers/${transferId}`);
      setTransfer(response.data);
    } catch (err) {
      console.error("Error fetching transfer details:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setFetchError(err.response.data.message);
      } else if (err.response) {
        setFetchError(`Error ${err.response.status}: ${err.response.statusText}`);
      }
       else {
        setFetchError('Could not fetch transfer details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transferId) {
      fetchTransferDetails();
    }
  }, [transferId]);

  const handleWorkflowAction = async (actionPath) => {
    setIsSubmittingAction(true);
    // setActionError(null); // Replaced by toast
    try {
      const response = await axios.patch(`/api/v1/transfers/${transferId}/${actionPath}`);
      setTransfer(response.data);
      addToast(`Action '${actionPath}' successful!`, 'success');
    } catch (err) {
      console.error(`Error during action '${actionPath}':`, err);
      let errorMessage = `Failed to perform action '${actionPath}'. Please try again.`;
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.response && err.response.status) {
        errorMessage = `Server responded with status ${err.response.status}`;
      }
      addToast(errorMessage, 'error');
      // setActionError(errorMessage); // Replaced by toast
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Inline styles for page layout and details display have been moved to index.css

  if (loading) {
    return <LoadingSpinner text="Loading transfer details..." />;
  }

  if (fetchError) {
    return (
      <div className="details-card"> {/* Using class from index.css */}
        <h2 className="text-center mb-3">Error</h2>
        <p className="error-message text-center">{fetchError}</p>
        <div className="text-center mt-3">
          <Link to="/" className="button-link button-secondary">Back to Transfer List</Link>
        </div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="details-card"> {/* Using class from index.css */}
        <p className="error-message text-center">No transfer details found for ID: {transferId}.</p>
        <div className="text-center mt-3">
         <Link to="/" className="button-link button-secondary">Back to Transfer List</Link>
        </div>
      </div>
    );
  }

  const renderButtons = () => {
    const buttons = [];
    const addMargin = buttons.length > 0 ? 'ml-2' : ''; // Utility class for margin

    if (transfer.status === 'DRAFT') {
      buttons.push(<button key="submit" onClick={() => handleWorkflowAction('submit')} className={`button-primary ${addMargin}`} disabled={isSubmittingAction}>{isSubmittingAction ? 'Processing...' : 'Submit Transfer'}</button>);
    }
    if (transfer.status === 'SUBMITTED') {
      buttons.push(<button key="negotiate" onClick={() => handleWorkflowAction('negotiate')} className={`button-primary ${addMargin}`} disabled={isSubmittingAction}>{isSubmittingAction ? 'Processing...' : 'Move to Negotiation'}</button>);
    }
    if (transfer.status === 'NEGOTIATION') {
      buttons.push(<button key="approve" onClick={() => handleWorkflowAction('approve')} className={`button-success ${addMargin}`} disabled={isSubmittingAction}>{isSubmittingAction ? 'Processing...' : 'Approve Transfer'}</button>);
    }
    if (transfer.status === 'APPROVED') {
      buttons.push(<button key="complete" onClick={() => handleWorkflowAction('complete')} className={`button-success ${addMargin}`} disabled={isSubmittingAction}>{isSubmittingAction ? 'Processing...' : 'Complete Transfer'}</button>);
    }
    // Always add cancel button if applicable, ensuring margin is applied based on *previous* buttons
    if (['DRAFT', 'SUBMITTED', 'NEGOTIATION'].includes(transfer.status)) {
      const cancelMargin = buttons.length > 0 ? 'ml-2' : '';
      buttons.push(<button key="cancel" onClick={() => handleWorkflowAction('cancel')} className={`button-danger ${cancelMargin}`} disabled={isSubmittingAction}>{isSubmittingAction ? 'Processing...' : 'Cancel Transfer'}</button>);
    }
    return buttons;
  };

  return (
    <div className="details-card"> {/* Using class from index.css */}
      <h2 className="text-center mb-3">Transfer Details</h2>

      <div className="detail-section">
        <div className="detail-item"><span className="detail-label">Transfer ID:</span> <span className="detail-value">{transfer.id}</span></div>
        <div className="detail-item">
          <span className="detail-label">Status:</span>
          <span className="detail-value">
            <span className={`status-badge status-${transfer.status?.toUpperCase()}`}>
              {transfer.status || 'N/A'}
            </span>
          </span>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-item"><span className="detail-label">Player:</span> <span className="detail-value">{transfer.player?.name || 'N/A'}</span></div>
        <div className="detail-item"><span className="detail-label">From Club:</span> <span className="detail-value">{transfer.fromClub?.name || 'N/A'}</span></div>
        <div className="detail-item"><span className="detail-label">To Club:</span> <span className="detail-value">{transfer.toClub?.name || 'N/A'}</span></div>
      </div>

      {transfer.clauses && transfer.clauses.length > 0 && (
        <div className="detail-section">
          <h3 className="h5 mb-2">Contract Clauses:</h3> {/* Using h5 for smaller heading and mb-2 */}
          <ul className="clauses-list">
            {transfer.clauses.map((clause, index) => (
              <li key={index} className="clause-item">
                <strong>Type:</strong> {clause.type || 'N/A'}
                {clause.percentage != null && <span><strong>Percentage:</strong> {clause.percentage}%</span>}
                {clause.amount != null && <span><strong>Amount:</strong> ${clause.amount.toLocaleString()}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(transfer.status === 'COMPLETED' || transfer.status === 'CANCELLED') ? (
        <p className="text-center mt-3" style={{fontWeight: 'bold'}}>This transfer is {transfer.status.toLowerCase()} and no further actions are available.</p>
      ) : (
        <div className="action-buttons-container">
          <h3 className="h5 mb-3">Workflow Actions</h3> {/* Using h5 for smaller heading and mb-3 */}
          {/* actionError display is removed, relying on toasts */}
          {isSubmittingAction && <LoadingSpinner text="Processing action..." />}
          <div className="text-center">{renderButtons()}</div> {/* Centering buttons */}
        </div>
      )}

      <div className="text-center mt-3">
        <Link to="/" className="button-link button-secondary">Back to Transfer List</Link>
      </div>

      {/* Toast Container for notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default TransferDetailsPage;

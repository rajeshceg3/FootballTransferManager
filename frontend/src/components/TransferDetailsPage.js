import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Removed useNavigate as it's not used
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

function TransferDetailsPage() {
  const { transferId } = useParams();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null); // Error for initial data fetch
  const [actionError, setActionError] = useState(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const fetchTransferDetails = async () => {
    setLoading(true);
    setFetchError(null);
    setActionError(null);
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
    setActionError(null);
    try {
      const response = await axios.patch(`/api/v1/transfers/${transferId}/${actionPath}`);
      setTransfer(response.data);
      // Consider adding a success message here, perhaps using a temporary state
    } catch (err) {
      console.error(`Error during action '${actionPath}':`, err);
      if (err.response && err.response.data && err.response.data.message) {
        setActionError(`${err.response.data.message}`);
      } else if (err.response && err.response.status) {
        setActionError(`Server responded with status ${err.response.status}`);
      } else {
        setActionError(`Failed to perform action '${actionPath}'. Please try again.`);
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Inline styles for page layout and details display
  const pageStyle = { maxWidth: '750px', margin: '0 auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
  const detailSectionStyle = { marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' };
  const detailItemStyle = { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' };
  const detailLabelStyle = { fontWeight: 'bold', color: '#333', marginRight: '10px' };
  const detailValueStyle = { color: '#555', textAlign: 'right' };
  const clausesListStyle = { listStyleType: 'none', paddingLeft: '0', marginTop: '0.5rem' };
  const clauseItemStyle = { background: '#f9f9f9', padding: '8px', borderRadius: '4px', marginBottom: '5px', border: '1px solid #eee'};
  const buttonContainerStyle = { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' };

  if (loading) {
    return <LoadingSpinner text="Loading transfer details..." />;
  }

  if (fetchError) {
    return (
      <div style={pageStyle}>
        <h2 style={{textAlign: 'center'}}>Error</h2>
        <p className="error-message">{fetchError}</p>
        <Link to="/" className="button-link button-secondary">Back to Transfer List</Link>
      </div>
    );
  }

  if (!transfer) {
    return (
        <div style={pageStyle}>
            <p className="error-message">No transfer details found for ID: {transferId}.</p>
            <Link to="/" className="button-link button-secondary">Back to Transfer List</Link>
        </div>
    );
  }

  const renderButtons = () => {
    const buttons = [];
    if (transfer.status === 'DRAFT') {
      buttons.push(<button key="submit" onClick={() => handleWorkflowAction('submit')} className="button-primary" disabled={isSubmittingAction}>{isSubmittingAction ? 'Processing...' : 'Submit Transfer'}</button>);
    }
    if (transfer.status === 'SUBMITTED') {
      buttons.push(<button key="negotiate" onClick={() => handleWorkflowAction('negotiate')} className="button-primary" disabled={isSubmittingAction}>{isSubmittingAction ? 'Processing...' : 'Move to Negotiation'}</button>);
    }
    if (transfer.status === 'NEGOTIATION') {
      buttons.push(<button key="approve" onClick={() => handleWorkflowAction('approve')} className="button-success" disabled={isSubmittingAction}>{isSubmittingAction ? 'Processing...' : 'Approve Transfer'}</button>);
    }
    if (transfer.status === 'APPROVED') {
      buttons.push(<button key="complete" onClick={() => handleWorkflowAction('complete')} className="button-success" disabled={isSubmittingAction}>{isSubmittingAction ? 'Processing...' : 'Complete Transfer'}</button>);
    }
    if (['DRAFT', 'SUBMITTED', 'NEGOTIATION'].includes(transfer.status)) {
      buttons.push(<button key="cancel" onClick={() => handleWorkflowAction('cancel')} className="button-danger" disabled={isSubmittingAction} style={{marginLeft: buttons.length > 0 ? '10px' : '0'}}>{isSubmittingAction ? 'Processing...' : 'Cancel Transfer'}</button>);
    }
    return buttons;
  };

  return (
    <div style={pageStyle}>
      <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Transfer Details</h2>

      <div style={detailSectionStyle}>
        <div style={detailItemStyle}><span style={detailLabelStyle}>Transfer ID:</span> <span style={detailValueStyle}>{transfer.id}</span></div>
        <div style={detailItemStyle}><span style={detailLabelStyle}>Status:</span> <span style={{...detailValueStyle, fontWeight: 'bold', color: transfer.status === 'COMPLETED' ? 'green' : transfer.status === 'CANCELLED' ? 'red' : '#333'}}>{transfer.status || 'N/A'}</span></div>
      </div>

      <div style={detailSectionStyle}>
        <div style={detailItemStyle}><span style={detailLabelStyle}>Player:</span> <span style={detailValueStyle}>{transfer.player?.name || 'N/A'}</span></div>
        <div style={detailItemStyle}><span style={detailLabelStyle}>From Club:</span> <span style={detailValueStyle}>{transfer.fromClub?.name || 'N/A'}</span></div>
        <div style={detailItemStyle}><span style={detailLabelStyle}>To Club:</span> <span style={detailValueStyle}>{transfer.toClub?.name || 'N/A'}</span></div>
      </div>

      {transfer.clauses && transfer.clauses.length > 0 && (
        <div style={detailSectionStyle}>
          <h3 style={{fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem'}}>Contract Clauses:</h3>
          <ul style={clausesListStyle}>
            {transfer.clauses.map((clause, index) => (
              <li key={index} style={clauseItemStyle}>
                <strong>Type:</strong> {clause.type || 'N/A'}
                {clause.percentage != null && <span style={{marginLeft:'10px'}}><strong>Percentage:</strong> {clause.percentage}%</span>}
                {clause.amount != null && <span style={{marginLeft:'10px'}}><strong>Amount:</strong> ${clause.amount.toLocaleString()}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(transfer.status === 'COMPLETED' || transfer.status === 'CANCELLED') ? (
        <p className="text-center mt-3" style={{fontWeight: 'bold'}}>This transfer is {transfer.status.toLowerCase()} and no further actions are available.</p>
      ) : (
        <div style={buttonContainerStyle}>
          <h3 style={{fontSize: '1.1rem', color: '#333', marginBottom: '1rem'}}>Workflow Actions</h3>
          {actionError && <p className="error-message">{actionError}</p>}
          {isSubmittingAction && <LoadingSpinner text="Processing action..." />}
          <div>{renderButtons()}</div>
        </div>
      )}

      <div className="text-center mt-3">
        <Link to="/" className="button-link button-secondary">Back to Transfer List</Link>
      </div>
    </div>
  );
}

export default TransferDetailsPage;

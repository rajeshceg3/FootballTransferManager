import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PlayerDropdown from './PlayerDropdown';
import ClubDropdown from './ClubDropdown';
import LoadingSpinner from './LoadingSpinner'; // For overall form submission

function NewTransferPage() {
  const navigate = useNavigate();

  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedFromClubId, setSelectedFromClubId] = useState('');
  const [selectedToClubId, setSelectedToClubId] = useState('');
  const [clauses, setClauses] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddClause = () => {
    setClauses([...clauses, { type: '', percentage: '', amount: '' }]);
  };

  const handleRemoveClause = (index) => {
    const newClauses = clauses.filter((_, i) => i !== index);
    setClauses(newClauses);
  };

  const handleClauseChange = (index, field, value) => {
    const newClauses = clauses.map((clause, i) => {
      if (i === index) {
        return { ...clause, [field]: value };
      }
      return clause;
    });
    setClauses(newClauses);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    if (!selectedPlayerId || !selectedFromClubId || !selectedToClubId) {
      setSubmitError('Player, From Club, and To Club are required.');
      setIsSubmitting(false);
      return;
    }
    if (selectedFromClubId === selectedToClubId) {
      setSubmitError('From Club and To Club cannot be the same.');
      setIsSubmitting(false);
      return;
    }

    const payloadClauses = clauses.map(clause => ({
      type: clause.type.trim() === '' ? null : clause.type.trim().toUpperCase(),
      percentage: clause.percentage === '' ? null : parseFloat(clause.percentage),
      amount: clause.amount === '' ? null : parseFloat(clause.amount),
    })).filter(clause => clause.type && (clause.percentage != null || clause.amount != null));

    const payload = {
      playerId: selectedPlayerId,
      fromClubId: selectedFromClubId,
      toClubId: selectedToClubId,
      clauses: payloadClauses,
    };

    try {
      const response = await axios.post('/api/v1/transfers', payload);
      if (response.status === 201 && response.data && response.data.id) {
        navigate(`/transfer/${response.data.id}`);
      } else {
        setSubmitError('Failed to create transfer. Unexpected response from server.');
      }
    } catch (err) {
      console.error("Error creating transfer:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setSubmitError(`${err.response.data.message}`);
      } else if (err.response && err.response.status) {
        setSubmitError(`Server responded with status ${err.response.status}`);
      } else {
        setSubmitError('Failed to create transfer. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles that are more specific to this page's layout
  const formStyle = { maxWidth: '700px', margin: '0 auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
  const inputGroupStyle = { marginBottom: '1.25rem' };
  const clauseSectionStyle = { border: '1px solid #e0e0e0', padding: '15px', marginTop: '20px', borderRadius: '5px', background: '#f9f9f9' };
  const clauseItemStyle = { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' };
  const clauseInputStyle = { flexGrow: 1}; // Input elements will use global styles
  const clauseActionsStyle = { marginTop: '10px' };

  return (
    <div style={formStyle}>
      <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Initiate New Transfer</h2>
      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label htmlFor="player">Player:</label>
          <PlayerDropdown
            selectedPlayerId={selectedPlayerId}
            onChange={setSelectedPlayerId}
            disabled={isSubmitting}
            // style prop will be handled by global input/select styles in index.css
          />
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="fromClub">From Club:</label>
          <ClubDropdown
            selectedClubId={selectedFromClubId}
            onChange={setSelectedFromClubId}
            disabled={isSubmitting}
            label="Select From Club"
          />
        </div>

        <div style={inputGroupStyle}>
          <label htmlFor="toClub">To Club:</label>
          <ClubDropdown
            selectedClubId={selectedToClubId}
            onChange={setSelectedToClubId}
            disabled={isSubmitting}
            label="Select To Club"
          />
        </div>

        <div style={clauseSectionStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>Contract Clauses</h3>
          {clauses.map((clause, index) => (
            <div key={index} style={clauseItemStyle}>
              <input
                type="text"
                placeholder="Clause Type (e.g., SELL_ON, BONUS)"
                value={clause.type}
                onChange={(e) => handleClauseChange(index, 'type', e.target.value)}
                style={clauseInputStyle} // Basic flex grow
                disabled={isSubmitting}
              />
              <input
                type="number"
                placeholder="Percentage (%)"
                value={clause.percentage}
                onChange={(e) => handleClauseChange(index, 'percentage', e.target.value)}
                style={{width: '130px'}} // Specific width
                min="0" max="100" step="0.01"
                disabled={isSubmitting}
              />
              <input
                type="number"
                placeholder="Amount"
                value={clause.amount}
                onChange={(e) => handleClauseChange(index, 'amount', e.target.value)}
                style={{width: '130px'}} // Specific width
                min="0" step="0.01"
                disabled={isSubmitting}
              />
              <button type="button" onClick={() => handleRemoveClause(index)} className="button-danger" disabled={isSubmitting}>Remove</button>
            </div>
          ))}
          <div style={clauseActionsStyle}>
            <button type="button" onClick={handleAddClause} className="button-success" disabled={isSubmitting}>Add Clause</button>
          </div>
        </div>

        {submitError && <p className="error-message mt-2">{submitError}</p>}

        {isSubmitting && <LoadingSpinner text="Submitting transfer..." />}

        <button
            type="submit"
            className="button-primary mt-3"
            style={{width: '100%', padding: '12px'}}
            disabled={isSubmitting || !selectedPlayerId || !selectedFromClubId || !selectedToClubId}
        >
          {isSubmitting ? 'Processing...' : 'Initiate Transfer'}
        </button>
      </form>
    </div>
  );
}

export default NewTransferPage;

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

  // Inline styles have been moved to index.css

  return (
    <div className="form-card">
      <h2 className="text-center mb-3">Initiate New Transfer</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="player">Player:</label>
          <PlayerDropdown
            selectedPlayerId={selectedPlayerId}
            onChange={setSelectedPlayerId}
            disabled={isSubmitting}
          />
        </div>

        <div className="input-group">
          <label htmlFor="fromClub">From Club:</label>
          <ClubDropdown
            selectedClubId={selectedFromClubId}
            onChange={setSelectedFromClubId}
            disabled={isSubmitting}
            label="Select From Club"
          />
        </div>

        <div className="input-group">
          <label htmlFor="toClub">To Club:</label>
          <ClubDropdown
            selectedClubId={selectedToClubId}
            onChange={setSelectedToClubId}
            disabled={isSubmitting}
            label="Select To Club"
          />
        </div>

        <div className="clause-section">
          <h3>Contract Clauses</h3> {/* Styling for h3 in .clause-section is in index.css */}
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '-0.75rem', marginBottom: '1rem' }}>
            Clauses defined here are used for transfer fee estimation. They are not stored as part of the transfer record itself.
          </p>
          {clauses.map((clause, index) => (
            <div key={index} className="clause-item-row">
              <input
                type="text"
                placeholder="Clause Type (e.g., SELL_ON, BONUS)"
                value={clause.type}
                onChange={(e) => handleClauseChange(index, 'type', e.target.value)}
                // flex-grow is handled by .clause-item-row input[type="text"] in index.css
                disabled={isSubmitting}
              />
              <input
                type="number"
                placeholder="Percentage (%)"
                value={clause.percentage}
                onChange={(e) => handleClauseChange(index, 'percentage', e.target.value)}
                style={{width: '130px'}} // Specific width, kept inline
                min="0" max="100" step="0.01"
                disabled={isSubmitting}
              />
              <input
                type="number"
                placeholder="Amount"
                value={clause.amount}
                onChange={(e) => handleClauseChange(index, 'amount', e.target.value)}
                style={{width: '130px'}} // Specific width, kept inline
                min="0" step="0.01"
                disabled={isSubmitting}
              />
              {/* Smaller button style for remove is in .clause-item-row .button-danger */}
              <button type="button" onClick={() => handleRemoveClause(index)} className="button-danger" disabled={isSubmitting}>Remove</button>
            </div>
          ))}
          <div className="clause-actions">
             {/* Smaller button style for add is in .clause-actions .button-success */}
            <button type="button" onClick={handleAddClause} className="button-success" disabled={isSubmitting}>Add Clause</button>
          </div>
        </div>

        {submitError && <p className="error-message text-center mt-2">{submitError}</p>}

        {isSubmitting && <LoadingSpinner text="Submitting transfer..." />}

        <button
            type="submit"
            className="button-primary w-100 button-lg mt-3" // Using utility classes
            disabled={isSubmitting || !selectedPlayerId || !selectedFromClubId || !selectedToClubId}
        >
          {isSubmitting ? 'Processing...' : 'Initiate Transfer'}
        </button>
      </form>
    </div>
  );
}

export default NewTransferPage;

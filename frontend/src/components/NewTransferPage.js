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
  const [fieldErrors, setFieldErrors] = useState({}); // For specific field errors
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

  const handleClauseTypeChange = (index, value) => {
    const newClauses = clauses.map((clause, i) => {
      if (i === index) {
        // If type changes from 'OTHER', clear customType. If to 'OTHER', preserve existing type as customType.
        const newCustomType = value === 'OTHER' ? (clause.type !== 'SELL_ON' && clause.type !== 'APPEARANCE_BONUS' && clause.type !== 'GOAL_BONUS' && clause.type !== 'LOYALTY_FEE' ? clause.type : '') : '';
        return { ...clause, type: value, customType: newCustomType };
      }
      return clause;
    });
    setClauses(newClauses);
  };

  const handleCustomClauseTypeChange = (index, value) => {
    const newClauses = clauses.map((clause, i) => {
      if (i === index) {
        return { ...clause, customType: value };
      }
      return clause;
    });
    setClauses(newClauses);
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    setFieldErrors({}); // Clear previous field errors
    setIsSubmitting(true);

    let errors = {};
    if (!selectedPlayerId) {
      errors.playerId = 'Player is required.';
    }
    if (!selectedFromClubId) {
      errors.fromClubId = 'From Club is required.';
    }
    if (!selectedToClubId) {
      errors.toClubId = 'To Club is required.';
    }
    if (selectedFromClubId && selectedToClubId && selectedFromClubId === selectedToClubId) {
      errors.toClubId = 'To Club cannot be the same as From Club.'; // Or assign to fromClubId, or a general message
      // Alternatively, you could have a common error: errors.clubs = 'From and To clubs cannot be the same.'
    }

    // Validate clauses
    const clauseErrors = [];
    clauses.forEach((clause, index) => {
      const currentClauseErrors = {};
      const finalClauseType = clause.type === 'OTHER' ? clause.customType : clause.type;
      if (!finalClauseType || finalClauseType.trim() === '') {
        currentClauseErrors.type = 'Type is required.';
      }
      const hasPercentage = clause.percentage !== '' && clause.percentage != null;
      const hasAmount = clause.amount !== '' && clause.amount != null;

      if (!hasPercentage && !hasAmount) {
        currentClauseErrors.value = 'Either Percentage or Amount must be provided.';
      } else {
        if (hasPercentage) {
          const percentageVal = parseFloat(clause.percentage);
          if (isNaN(percentageVal) || percentageVal < 0 || percentageVal > 100) {
            currentClauseErrors.percentage = 'Must be between 0 and 100.';
          }
        }
        if (hasAmount) {
          const amountVal = parseFloat(clause.amount);
          if (isNaN(amountVal) || amountVal < 0) {
            currentClauseErrors.amount = 'Must be a positive number.';
          }
        }
      }
      if (Object.keys(currentClauseErrors).length > 0) {
        clauseErrors[index] = currentClauseErrors;
      }
    });

    if (clauseErrors.length > 0) {
      errors.clauses = clauseErrors;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    const payloadClauses = clauses.map(clause => {
      const finalClauseType = clause.type === 'OTHER' ? clause.customType : clause.type;
      return {
        type: finalClauseType.trim().toUpperCase(),
        percentage: (clause.percentage === '' || clause.percentage == null) ? null : parseFloat(clause.percentage),
        amount: (clause.amount === '' || clause.amount == null) ? null : parseFloat(clause.amount),
      };
    }).filter(clause => clause.type && (clause.percentage != null || clause.amount != null));


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
            onChange={(id) => { setSelectedPlayerId(id); setFieldErrors(prev => ({...prev, playerId: null})); }}
            disabled={isSubmitting}
          />
          {fieldErrors.playerId && <p className="error-message-inline">{fieldErrors.playerId}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="fromClub">From Club:</label>
          <ClubDropdown
            selectedClubId={selectedFromClubId}
            onChange={(id) => { setSelectedFromClubId(id); setFieldErrors(prev => ({...prev, fromClubId: null, toClubId: null})); }}
            disabled={isSubmitting}
            label="Select From Club"
          />
          {fieldErrors.fromClubId && <p className="error-message-inline">{fieldErrors.fromClubId}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="toClub">To Club:</label>
          <ClubDropdown
            selectedClubId={selectedToClubId}
            onChange={(id) => { setSelectedToClubId(id); setFieldErrors(prev => ({...prev, toClubId: null})); }}
            disabled={isSubmitting}
            label="Select To Club"
          />
          {fieldErrors.toClubId && <p className="error-message-inline">{fieldErrors.toClubId}</p>}
        </div>

        <div className="clause-section">
          <h3>Contract Clauses</h3> {/* Styling for h3 in .clause-section is in index.css */}
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '-0.75rem', marginBottom: '1rem' }}>
            Clauses defined here are used for transfer fee estimation. They are not stored as part of the transfer record itself.
          </p>
          {clauses.map((clause, index) => (
            <div key={index} className="clause-item-container mb-3 p-2 border rounded"> {/* Added padding and border */}
              <div className="clause-item-row align-items-start"> {/* Align items start for better error message placement */}
                <div className="flex-grow-1 me-2"> {/* Wrapper for type inputs */}
                  <select
                    value={clause.type}
                    onChange={(e) => handleClauseTypeChange(index, e.target.value)}
                    disabled={isSubmitting}
                    className={`form-select mb-1 ${fieldErrors.clauses && fieldErrors.clauses[index]?.type ? 'input-error' : ''}`}
                  >
                    <option value="">Select Type</option>
                    <option value="SELL_ON">Sell-on</option>
                    <option value="APPEARANCE_BONUS">Appearance Bonus</option>
                    <option value="GOAL_BONUS">Goal Bonus</option>
                    <option value="LOYALTY_FEE">Loyalty Fee</option>
                    <option value="OTHER">Other (Specify)</option>
                  </select>
                  {clause.type === 'OTHER' && (
                    <input
                      type="text"
                      placeholder="Specify Clause Type"
                      value={clause.customType || ''}
                      onChange={(e) => handleCustomClauseTypeChange(index, e.target.value)}
                      disabled={isSubmitting}
                      className={`form-control ${fieldErrors.clauses && fieldErrors.clauses[index]?.type ? 'input-error' : ''}`}
                    />
                  )}
                </div>
                <div className="me-2" style={{width: '150px'}}> {/* Wrapper for percentage */}
                  <input
                    type="number"
                    placeholder="Percentage (%)"
                    value={clause.percentage}
                    onChange={(e) => handleClauseChange(index, 'percentage', e.target.value)}
                    min="0" max="100" step="0.01"
                    disabled={isSubmitting}
                    className={`form-control ${fieldErrors.clauses && fieldErrors.clauses[index]?.percentage ? 'input-error' : ''}`}
                  />
                </div>
                <div style={{width: '150px'}}> {/* Wrapper for amount */}
                  <input
                    type="number"
                    placeholder="Amount"
                    value={clause.amount}
                    onChange={(e) => handleClauseChange(index, 'amount', e.target.value)}
                    min="0" step="0.01"
                    disabled={isSubmitting}
                    className={`form-control ${fieldErrors.clauses && fieldErrors.clauses[index]?.amount ? 'input-error' : ''}`}
                  />
                </div>
                <button type="button" onClick={() => handleRemoveClause(index)} className="button-danger ms-2" disabled={isSubmitting}>
                  <span className="material-icons icon-text-spacing">remove_circle_outline</span>Remove
                </button>
              </div>
              {/* Display clause-specific errors more cleanly */}
              {fieldErrors.clauses && fieldErrors.clauses[index] && (
                <div className="clause-errors mt-1 text-danger" style={{ fontSize: '0.8rem' }}>
                  {fieldErrors.clauses[index].type && <p>{fieldErrors.clauses[index].type}</p>}
                  {fieldErrors.clauses[index].percentage && <p>{fieldErrors.clauses[index].percentage}</p>}
                  {fieldErrors.clauses[index].amount && <p>{fieldErrors.clauses[index].amount}</p>}
                  {fieldErrors.clauses[index].value && <p>{fieldErrors.clauses[index].value}</p>}
                </div>
              )}
            </div>
          ))}
          <div className="clause-actions">
            {/* Smaller button style for add is in .clause-actions .button-success */}
            <button type="button" onClick={handleAddClause} className="button-success" disabled={isSubmitting}>
              <span className="material-icons icon-text-spacing">add</span>Add Clause
            </button>
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

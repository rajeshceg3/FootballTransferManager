import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClubDropdown from './ClubDropdown'; // Reusing the ClubDropdown
import LoadingSpinner from './LoadingSpinner';

function CreatePlayerPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [marketValue, setMarketValue] = useState('');
  const [clubId, setClubId] = useState(''); // Can be empty if player is unassigned
  const [error, setError] = useState(null); // For general/server errors
  const [fieldErrors, setFieldErrors] = useState({}); // For specific field errors
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({}); // Clear previous field errors
    setIsSubmitting(true);

    let errors = {};
    if (!name.trim()) {
      errors.name = 'Player name is required.';
    }

    const parsedMarketValue = parseFloat(marketValue);
    if (marketValue.trim() && (isNaN(parsedMarketValue) || parsedMarketValue < 0)) {
      errors.marketValue = 'Market value must be a valid positive number or empty.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: name.trim(),
      marketValue: marketValue.trim() ? parsedMarketValue : null, // Send null if empty
      clubId: clubId === '' ? null : clubId, // Send null if no club is selected
    };

    try {
      await axios.post('/api/v1/players', payload);
      navigate('/players'); // Navigate to player list page on success
    } catch (err) {
      console.error("Error creating player:", err);
      setError(err.response?.data?.message || 'Failed to create player. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // formStyle and inputGroupStyle constants are removed, using CSS classes instead.

  return (
    <div className="form-card"> {/* Applied .form-card class */}
      <h2 className="text-center mb-3">Create New Player</h2> {/* Applied utility classes */}
      <form onSubmit={handleSubmit}>
        <div className="input-group"> {/* Applied .input-group class */}
          <label htmlFor="name">Player Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setFieldErrors(prev => ({...prev, name: null})); }}
            required
            disabled={isSubmitting}
            className={fieldErrors.name ? 'input-error' : ''}
          />
          {fieldErrors.name && <p className="error-message-inline">{fieldErrors.name}</p>}
        </div>

        <div className="input-group"> {/* Applied .input-group class */}
          <label htmlFor="marketValue">Market Value:</label>
          <input
            type="number"
            id="marketValue"
            value={marketValue}
            onChange={(e) => { setMarketValue(e.target.value); setFieldErrors(prev => ({...prev, marketValue: null})); }}
            min="0"
            step="1000"
            placeholder="e.g., 5000000"
            disabled={isSubmitting}
            className={fieldErrors.marketValue ? 'input-error' : ''}
          />
          {fieldErrors.marketValue && <p className="error-message-inline">{fieldErrors.marketValue}</p>}
        </div>

        <div className="input-group"> {/* Applied .input-group class */}
          <label htmlFor="club">Assign to Club (Optional):</label>
          <ClubDropdown // This component should use global select styles
            selectedClubId={clubId}
            onChange={setClubId}
            disabled={isSubmitting}
            label="Select Club (Optional)"
          />
        </div>

        {error && <p className="error-message text-center mt-2">{error}</p>}
        {Object.keys(fieldErrors).length > 0 && !error && ( // Display a general message if there are field errors but no general error
            <p className="error-message text-center mt-2">Please correct the highlighted fields.</p>
        )}

        {isSubmitting && <LoadingSpinner text="Creating player..." />}

        <button
            type="submit"
            className="button-primary w-100 button-lg mt-3" // Applied utility classes for styling
            disabled={isSubmitting || Object.keys(fieldErrors).some(key => fieldErrors[key] !== null)}
        >
          {isSubmitting ? 'Processing...' : 'Create Player'}
        </button>
      </form>
    </div>
  );
}

export default CreatePlayerPage;

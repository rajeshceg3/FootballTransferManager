import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClubDropdown from './ClubDropdown';
import LoadingSpinner from './LoadingSpinner';

function EditPlayerPage() {
  const { id: playerId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [marketValue, setMarketValue] = useState('');
  const [clubId, setClubId] = useState('');

  const [loading, setLoading] = useState(true); // For fetching initial data
  const [fetchError, setFetchError] = useState(null); // Separate error for initial data fetching
  const [submitError, setSubmitError] = useState(null); // Separate error for form submission
  const [fieldErrors, setFieldErrors] = useState({}); // For specific field validation errors
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlayerData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await axios.get(`/api/v1/players/${playerId}`);
      const player = response.data;
      setName(player.name);
      setMarketValue(player.marketValue != null ? String(player.marketValue) : ''); // Ensure string for input
      setClubId(player.club?.id || ''); // Set to current club ID or empty string
    } catch (err) {
      console.error("Error fetching player data:", err);
      setFetchError(err.response?.data?.message || `Failed to fetch data for player ID ${playerId}.`);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchPlayerData();
  }, [fetchPlayerData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    setFieldErrors({});
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
      marketValue: marketValue.trim() ? parsedMarketValue : null,
      clubId: clubId === '' ? null : clubId,
    };

    try {
      await axios.put(`/api/v1/players/${playerId}`, payload);
      navigate('/players'); // Navigate to player list page
    } catch (err) {
      console.error("Error updating player:", err);
      setSubmitError(err.response?.data?.message || 'Failed to update player. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // formStyle and inputGroupStyle constants are removed, using CSS classes instead.

  if (loading) {
    return <LoadingSpinner text={`Loading player data for ID ${playerId}...`} />;
  }

  if (fetchError) { // Display fetch error prominently if it occurs
    return (
        <div className="form-card text-center">
            <h2 className="text-center mb-3">Error Loading Player</h2>
            <p className="error-message">{fetchError}</p>
            <button onClick={() => navigate('/players')} className="button-secondary mt-3">Back to Player List</button>
            <button onClick={fetchPlayerData} className="button-primary mt-2 ms-2">Try Again</button>
        </div>
    );
  }

  return (
    <div className="form-card">
      <h2 className="text-center mb-3">Edit Player (ID: {playerId})</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="name">Player Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setFieldErrors(prev => ({...prev, name: null})); }}
            required
            disabled={isSubmitting || loading}
            className={fieldErrors.name ? 'input-error' : ''}
          />
          {fieldErrors.name && <p className="error-message-inline">{fieldErrors.name}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="marketValue">Market Value:</label>
          <input
            type="number"
            id="marketValue"
            value={marketValue}
            onChange={(e) => { setMarketValue(e.target.value); setFieldErrors(prev => ({...prev, marketValue: null})); }}
            min="0"
            step="1000"
            placeholder="e.g., 5000000"
            disabled={isSubmitting || loading}
            className={fieldErrors.marketValue ? 'input-error' : ''}
          />
          {fieldErrors.marketValue && <p className="error-message-inline">{fieldErrors.marketValue}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="club">Assign to Club (Optional):</label>
          <ClubDropdown
            selectedClubId={clubId}
            onChange={setClubId}
            disabled={isSubmitting || loading}
            label="Select Club (Optional)"
          />
        </div>

        {submitError && <p className="error-message text-center mt-2">{submitError}</p>}
        {Object.keys(fieldErrors).length > 0 && !submitError && (
            <p className="error-message text-center mt-2">Please correct the highlighted fields.</p>
        )}

        {isSubmitting && <LoadingSpinner text="Updating player..." />}

        <button
            type="submit"
            className="button-primary w-100 button-lg mt-3"
            disabled={isSubmitting || loading || Object.keys(fieldErrors).some(key => fieldErrors[key] !== null)}
        >
          {isSubmitting ? 'Processing...' : 'Update Player'}
        </button>
      </form>
    </div>
  );
}

export default EditPlayerPage;

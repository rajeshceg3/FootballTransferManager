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
  const [error, setError] = useState(null); // For any error (fetch or submit)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlayerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/v1/players/${playerId}`);
      const player = response.data;
      setName(player.name);
      setMarketValue(player.marketValue != null ? String(player.marketValue) : ''); // Ensure string for input
      setClubId(player.club?.id || ''); // Set to current club ID or empty string
    } catch (err) {
      console.error("Error fetching player data:", err);
      setError(err.response?.data?.message || `Failed to fetch data for player ID ${playerId}.`);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchPlayerData();
  }, [fetchPlayerData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!name.trim()) {
      setError('Player name is required.');
      setIsSubmitting(false);
      return;
    }

    const parsedMarketValue = parseFloat(marketValue);
    if (marketValue.trim() && (isNaN(parsedMarketValue) || parsedMarketValue < 0)) {
        setError('Market value must be a valid positive number or empty.');
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
      setError(err.response?.data?.message || 'Failed to update player. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // formStyle and inputGroupStyle constants are removed, using CSS classes instead.

  if (loading) {
    return <LoadingSpinner text={`Loading player data for ID ${playerId}...`} />;
  }

  // Handling for initial fetch error - if name is not set, implies fetch failed before form could be displayed
  if (error && !isSubmitting && !name) {
    return (
        <div className="form-card text-center"> {/* Centering content in the card */}
            <h2 className="text-center mb-3">Error Loading Player</h2>
            <p className="error-message">{error}</p>
            <button onClick={() => navigate('/players')} className="button-secondary mt-3">Back to Player List</button>
        </div>
    );
  }

  return (
    <div className="form-card"> {/* Applied .form-card class */}
      <h2 className="text-center mb-3">Edit Player (ID: {playerId})</h2> {/* Applied utility classes */}
      <form onSubmit={handleSubmit}>
        <div className="input-group"> {/* Applied .input-group class */}
          <label htmlFor="name">Player Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
            // Inputs will use global styles from index.css
          />
        </div>

        <div className="input-group"> {/* Applied .input-group class */}
          <label htmlFor="marketValue">Market Value:</label>
          <input
            type="number"
            id="marketValue"
            value={marketValue}
            onChange={(e) => setMarketValue(e.target.value)}
            min="0"
            step="1000"
            placeholder="e.g., 5000000"
            disabled={isSubmitting}
          />
        </div>

        <div className="input-group"> {/* Applied .input-group class */}
          <label htmlFor="club">Assign to Club (Optional):</label>
          <ClubDropdown // This component should use global select styles
            selectedClubId={clubId}
            onChange={setClubId}
            disabled={isSubmitting || loading} // Disable if initial data is still loading
            label="Select Club (Optional)"
          />
        </div>

        {/* Display submission error here */}
        {error && isSubmitting && <p className="error-message text-center mt-2">{error}</p>}
        {/* Show error if form was populated but submission failed after fields were loaded */}
        {error && !isSubmitting && name && <p className="error-message text-center mt-2">{error}</p>}


        {isSubmitting && <LoadingSpinner text="Updating player..." />}

        <button
            type="submit"
            className="button-primary w-100 button-lg mt-3" // Applied utility classes for styling
            disabled={isSubmitting || loading} // Disable if initial data is loading
        >
          {isSubmitting ? 'Processing...' : 'Update Player'}
        </button>
      </form>
    </div>
  );
}

export default EditPlayerPage;

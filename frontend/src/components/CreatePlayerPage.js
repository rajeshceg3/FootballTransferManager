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
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const formStyle = { maxWidth: '600px', margin: '20px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
  const inputGroupStyle = { marginBottom: '1.25rem' };

  return (
    <div style={formStyle}>
      <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Create New Player</h2>
      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label htmlFor="name">Player Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div style={inputGroupStyle}>
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

        <div style={inputGroupStyle}>
          <label htmlFor="club">Assign to Club (Optional):</label>
          <ClubDropdown
            selectedClubId={clubId}
            onChange={setClubId}
            disabled={isSubmitting}
            label="Select Club (Optional)"
          />
        </div>

        {error && <p className="error-message mt-2">{error}</p>}

        {isSubmitting && <LoadingSpinner text="Creating player..." />}

        <button
            type="submit"
            className="button-primary mt-3"
            style={{width: '100%', padding: '12px'}}
            disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Create Player'}
        </button>
      </form>
    </div>
  );
}

export default CreatePlayerPage;

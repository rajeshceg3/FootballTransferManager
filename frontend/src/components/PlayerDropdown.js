import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

function PlayerDropdown({ selectedPlayerId, onChange, disabled, style }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/v1/players');
        setPlayers(response.data || []);
      } catch (err) {
        console.error("Error fetching players:", err);
        setError('Failed to load players. Please refresh or try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  if (loading) {
    // Using a simpler text message for dropdowns to avoid large spinner in form
    return <select disabled style={style}><option>Loading players...</option></select>;
  }

  if (error) {
    // Display error message within the select area or as a separate text
    return (
      <div>
        <select disabled style={style}><option>Error loading players</option></select>
        <p className="error-message" style={{fontSize: '0.8rem', padding: '5px', marginTop: '5px'}}>{error}</p>
      </div>
    );
  }

  if (players.length === 0) {
    return <select disabled style={style}><option>No players available</option></select>;
  }

  return (
    <select
      id="player"
      value={selectedPlayerId}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled} // Removed players.length === 0 from here as it's handled above
      required
      style={style} // Uses inputStyle from NewTransferPage
    >
      <option value="">Select Player</option>
      {players.map(player => (
        <option key={player.id} value={player.id}>
          {player.name} (Current Club: {player.club?.name || 'N/A'})
        </option>
      ))}
    </select>
  );
}

export default PlayerDropdown;

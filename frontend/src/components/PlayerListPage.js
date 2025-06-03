import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

function PlayerListPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/players');
      setPlayers(response.data || []);
    } catch (err) {
      console.error("Error fetching players:", err);
      setError(err.response?.data?.message || 'Failed to fetch players. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleDeletePlayer = async (playerId) => {
    // Simple confirmation, enhance with a modal for better UX
    if (window.confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/v1/players/${playerId}`);
        // Refresh player list
        fetchPlayers();
      } catch (err) {
        console.error("Error deleting player:", err);
        setError(err.response?.data?.message || 'Failed to delete player. They might be involved in active transfers.');
      }
    }
  };

  // Basic table styling - consider moving to CSS file for more complex styling
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thStyle = { borderBottom: '2px solid #ddd', padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa'};
  const tdStyle = { borderBottom: '1px solid #eee', padding: '10px' };
  const actionButtonStyle = { marginRight: '8px', padding: '6px 10px', fontSize: '0.85rem' };

  if (loading) {
    return <LoadingSpinner text="Loading players..." />;
  }

  return (
    <div className="container mt-3">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Manage Players</h2>
        <Link to="/players/new" className="button-link button-primary">
          Create New Player
        </Link>
      </div>

      {error && <p className="error-message">{error}</p>}

      {players.length === 0 && !loading && !error && (
        <p>No players found. <Link to="/players/new">Create one now!</Link></p>
      )}

      {players.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Market Value</th>
              <th style={thStyle}>Current Club</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id}>
                <td style={tdStyle}>{player.id}</td>
                <td style={tdStyle}>{player.name}</td>
                <td style={tdStyle}>${player.marketValue?.toLocaleString() || 'N/A'}</td>
                <td style={tdStyle}>{player.club?.name || 'Unassigned'}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => navigate(`/players/edit/${player.id}`)}
                    className="button-secondary"
                    style={actionButtonStyle}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(player.id)}
                    className="button-danger"
                    style={actionButtonStyle}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PlayerListPage;

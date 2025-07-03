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
      setLoading(true); // Indicate loading state during deletion
      setError(null); // Clear previous errors
      try {
        await axios.delete(`/api/v1/players/${playerId}`);
        // Refresh player list, fetchPlayers will reset loading and error states
        fetchPlayers();
      } catch (err) {
        console.error("Error deleting player:", err);
        setError(err.response?.data?.message || 'Failed to delete player. They might be involved in active transfers.');
        setLoading(false); // Ensure loading is false on error
      }
    }
  };

  // Inline styles (tableStyle, thStyle, tdStyle, actionButtonStyle) are removed.
  // Styles will be handled by index.css (table, .table-responsive, .page-header, .empty-state-container)

  if (loading) {
    return <LoadingSpinner text="Loading players..." />;
  }

  return (
    <div className="container mt-3 mb-3"> {/* Added mb-3 */}
      <div className="page-header">
        <h2>Manage Players</h2>
        <Link to="/players/new" className="button-link button-primary">
          <span className="material-icons icon-text-spacing">add_circle</span>
          Create New Player
        </Link>
      </div>

      {error && <p className="error-message text-center">{error}</p>} {/* Added text-center */}

      {players.length === 0 && !loading && !error ? (
        <div className="empty-state-container">
          <p>No players found in the system.</p>
          <Link to="/players/new" className="button-link button-primary">
            <span className="material-icons icon-text-spacing">add_circle</span>
            Register First Player
          </Link>
        </div>
      ) : players.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Market Value</th>
                <th>Current Club</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id}>
                  <td>{player.id}</td>
                  <td>{player.name}</td>
                  <td>${player.marketValue?.toLocaleString() || 'N/A'}</td>
                  <td>{player.club?.name || 'Unassigned'}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/players/edit/${player.id}`)}
                      className="button-secondary"
                      // Inline style removed, relying on .table td .button-secondary from index.css
                    >
                      <span className="material-icons icon-text-spacing">edit</span>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      className="button-danger"
                      // Inline style removed, relying on .table td .button-danger from index.css
                    >
                      <span className="material-icons icon-text-spacing">delete</span>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PlayerListPage;

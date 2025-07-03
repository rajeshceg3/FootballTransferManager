import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

function ClubListPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/clubs');
      setClubs(response.data || []);
    } catch (err) {
      console.error("Error fetching clubs:", err);
      setError(err.response?.data?.message || 'Failed to fetch clubs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const handleDeleteClub = async (clubId) => {
    if (window.confirm('Are you sure you want to delete this club? This may affect players and transfers associated with it.')) {
      setLoading(true); // Indicate loading state
      setError(null);   // Clear previous errors
      try {
        await axios.delete(`/api/v1/clubs/${clubId}`);
        fetchClubs(); // Refresh club list, also resets loading state
      } catch (err) {
        console.error("Error deleting club:", err);
        setError(err.response?.data?.message || 'Failed to delete club. It might have associated players or be involved in transfers.');
        setLoading(false); // Ensure loading is false on error
      }
    }
  };

  // Inline styles (tableStyle, thStyle, tdStyle, actionButtonStyle) are removed
  // Styles will be handled by index.css (table, .table-responsive, .page-header, .empty-state-container)

  if (loading) {
    return <LoadingSpinner text="Loading clubs..." />;
  }

  return (
    <div className="container mt-3 mb-3"> {/* Added mb-3 for consistency */}
      <div className="page-header">
        <h2>Manage Clubs</h2>
        <Link to="/clubs/new" className="button-link button-primary">
          <span className="material-icons icon-text-spacing">add_circle</span>
          Create New Club
        </Link>
      </div>

      {error && <p className="error-message text-center">{error}</p>} {/* Added text-center */}

      {clubs.length === 0 && !loading && !error ? (
        <div className="empty-state-container">
          <p>No clubs found at the moment.</p>
          <Link to="/clubs/new" className="button-link button-primary">
            <span className="material-icons icon-text-spacing">add_circle</span>
            Add Your First Club
          </Link>
        </div>
      ) : clubs.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Budget</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map(club => (
                <tr key={club.id}>
                  <td>{club.id}</td>
                  <td>{club.name}</td>
                  <td>${club.budget?.toLocaleString() || 'N/A'}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/clubs/edit/${club.id}`)}
                      className="button-secondary"
                      // Inline style removed, relying on .table td .button-secondary from index.css
                    >
                      <span className="material-icons icon-text-spacing">edit</span>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club.id)}
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

export default ClubListPage;

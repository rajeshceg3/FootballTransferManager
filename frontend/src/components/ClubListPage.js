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
      try {
        await axios.delete(`/api/v1/clubs/${clubId}`);
        fetchClubs(); // Refresh club list
      } catch (err) {
        console.error("Error deleting club:", err);
        setError(err.response?.data?.message || 'Failed to delete club. It might have associated players or be involved in transfers.');
      }
    }
  };

  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thStyle = { borderBottom: '2px solid #ddd', padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa'};
  const tdStyle = { borderBottom: '1px solid #eee', padding: '10px' };
  const actionButtonStyle = { marginRight: '8px', padding: '6px 10px', fontSize: '0.85rem' };


  if (loading) {
    return <LoadingSpinner text="Loading clubs..." />;
  }

  return (
    <div className="container mt-3">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Manage Clubs</h2>
        <Link to="/clubs/new" className="button-link button-primary">
          Create New Club
        </Link>
      </div>

      {error && <p className="error-message">{error}</p>}

      {clubs.length === 0 && !loading && !error && (
        <p>No clubs found. <Link to="/clubs/new">Create one now!</Link></p>
      )}

      {clubs.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Budget</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map(club => (
              <tr key={club.id}>
                <td style={tdStyle}>{club.id}</td>
                <td style={tdStyle}>{club.name}</td>
                <td style={tdStyle}>${club.budget?.toLocaleString() || 'N/A'}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => navigate(`/clubs/edit/${club.id}`)}
                    className="button-secondary"
                    style={actionButtonStyle}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClub(club.id)}
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

export default ClubListPage;

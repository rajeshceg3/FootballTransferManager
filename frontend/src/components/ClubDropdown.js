import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

function ClubDropdown({ selectedClubId, onChange, disabled, label = "Select Club", style }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/v1/clubs');
        setClubs(response.data || []);
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setError('Failed to load clubs. Please refresh or try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  if (loading) {
    return <select disabled style={style}><option>Loading clubs...</option></select>;
  }

  if (error) {
     return (
      <div>
        <select disabled style={style}><option>Error loading clubs</option></select>
        <p className="error-message" style={{fontSize: '0.8rem', padding: '5px', marginTop: '5px'}}>{error}</p>
      </div>
    );
  }

  if (clubs.length === 0) {
    return <select disabled style={style}><option>No clubs available</option></select>;
  }

  return (
    <select
      value={selectedClubId}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled} // Removed clubs.length === 0 from here
      required
      style={style} // Uses inputStyle from NewTransferPage
    >
      <option value="">{label}</option>
      {clubs.map(club => (
        <option key={club.id} value={club.id}>{club.name}</option>
      ))}
    </select>
  );
}

export default ClubDropdown;

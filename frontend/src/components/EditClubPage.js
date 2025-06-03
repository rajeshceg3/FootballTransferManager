import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

function EditClubPage() {
  const { id: clubId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');

  const [loading, setLoading] = useState(true); // For fetching initial data
  const [error, setError] = useState(null); // For any error (fetch or submit)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClubData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/v1/clubs/${clubId}`);
      const club = response.data;
      setName(club.name);
      setBudget(club.budget != null ? String(club.budget) : '');
    } catch (err) {
      console.error("Error fetching club data:", err);
      setError(err.response?.data?.message || `Failed to fetch data for club ID ${clubId}.`);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchClubData();
  }, [fetchClubData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!name.trim()) {
      setError('Club name is required.');
      setIsSubmitting(false);
      return;
    }

    const parsedBudget = parseFloat(budget);
    if (!budget.trim() || isNaN(parsedBudget) || parsedBudget < 0) {
        setError('Budget must be a valid positive number.');
        setIsSubmitting(false);
        return;
    }

    const payload = {
      name: name.trim(),
      budget: parsedBudget,
    };

    try {
      await axios.put(`/api/v1/clubs/${clubId}`, payload);
      navigate('/clubs'); // Navigate to club list page
    } catch (err) {
      console.error("Error updating club:", err);
      setError(err.response?.data?.message || 'Failed to update club. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formStyle = { maxWidth: '600px', margin: '20px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
  const inputGroupStyle = { marginBottom: '1.25rem' };

  if (loading) {
    return <LoadingSpinner text={`Loading club data for ID ${clubId}...`} />;
  }

  if (error && !isSubmitting) {
    return (
        <div style={formStyle}>
            <h2 style={{textAlign: 'center', color: 'red'}}>Error</h2>
            <p className="error-message">{error}</p>
            <button onClick={() => navigate('/clubs')} className="button-secondary">Back to Club List</button>
        </div>
    );
  }

  return (
    <div style={formStyle}>
      <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Edit Club (ID: {clubId})</h2>
      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label htmlFor="name">Club Name:</label>
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
          <label htmlFor="budget">Budget:</label>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            min="0"
            step="10000"
            placeholder="e.g., 100000000"
            disabled={isSubmitting}
          />
        </div>

        {error && isSubmitting && <p className="error-message mt-2">{error}</p>}

        {isSubmitting && <LoadingSpinner text="Updating club..." />}

        <button
            type="submit"
            className="button-primary mt-3"
            style={{width: '100%', padding: '12px'}}
            disabled={isSubmitting || loading}
        >
          {isSubmitting ? 'Processing...' : 'Update Club'}
        </button>
      </form>
    </div>
  );
}

export default EditClubPage;

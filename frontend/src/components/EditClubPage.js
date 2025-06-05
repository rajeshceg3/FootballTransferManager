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

  // formStyle and inputGroupStyle constants are removed, using CSS classes instead.

  if (loading) {
    return <LoadingSpinner text={`Loading club data for ID ${clubId}...`} />;
  }

  // Handling for initial fetch error
  if (error && !isSubmitting && !name) { // Check if name is not set, indicating fetch failure before form can be shown
    return (
        <div className="form-card text-center"> {/* Centering content in the card */}
            <h2 className="text-center mb-3">Error Loading Club</h2>
            <p className="error-message">{error}</p>
            <button onClick={() => navigate('/clubs')} className="button-secondary mt-3">Back to Club List</button>
        </div>
    );
  }

  return (
    <div className="form-card"> {/* Applied .form-card class */}
      <h2 className="text-center mb-3">Edit Club (ID: {clubId})</h2> {/* Applied utility classes */}
      <form onSubmit={handleSubmit}>
        <div className="input-group"> {/* Applied .input-group class */}
          <label htmlFor="name">Club Name:</label>
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

        {/* Display submission error here if it occurs during submission process */}
        {error && isSubmitting && <p className="error-message text-center mt-2">{error}</p>}
        {error && !isSubmitting && name && <p className="error-message text-center mt-2">{error}</p>} {/* Show error if form was populated but submission failed */}


        {isSubmitting && <LoadingSpinner text="Updating club..." />}

        <button
            type="submit"
            className="button-primary w-100 button-lg mt-3" // Applied utility classes for styling
            disabled={isSubmitting || loading} // Keep loading disable as fetch might still be considered active by some logic
        >
          {isSubmitting ? 'Processing...' : 'Update Club'}
        </button>
      </form>
    </div>
  );
}

export default EditClubPage;

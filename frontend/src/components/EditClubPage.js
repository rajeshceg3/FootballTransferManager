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
  const [fetchError, setFetchError] = useState(null); // Separate error for initial data fetching
  const [submitError, setSubmitError] = useState(null); // Separate error for form submission
  const [fieldErrors, setFieldErrors] = useState({}); // For specific field validation errors
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClubData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await axios.get(`/api/v1/clubs/${clubId}`);
      const club = response.data;
      setName(club.name);
      setBudget(club.budget != null ? String(club.budget) : '');
    } catch (err) {
      console.error("Error fetching club data:", err);
      setFetchError(err.response?.data?.message || `Failed to fetch data for club ID ${clubId}.`);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchClubData();
  }, [fetchClubData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    let errors = {};
    if (!name.trim()) {
      errors.name = 'Club name is required.';
    }

    const parsedBudget = parseFloat(budget);
    if (!budget.trim()) {
      errors.budget = 'Budget is required.';
    } else if (isNaN(parsedBudget) || parsedBudget < 0) {
      errors.budget = 'Budget must be a valid positive number.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
      setSubmitError(err.response?.data?.message || 'Failed to update club. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // formStyle and inputGroupStyle constants are removed, using CSS classes instead.

  if (loading) {
    return <LoadingSpinner text={`Loading club data for ID ${clubId}...`} />;
  }

  if (fetchError) { // Display fetch error prominently
    return (
        <div className="form-card text-center">
            <h2 className="text-center mb-3">Error Loading Club</h2>
            <p className="error-message">{fetchError}</p>
            <button onClick={() => navigate('/clubs')} className="button-secondary mt-3">Back to Club List</button>
            <button onClick={fetchClubData} className="button-primary mt-2 ms-2">Try Again</button>
        </div>
    );
  }

  return (
    <div className="form-card">
      <h2 className="text-center mb-3">Edit Club (ID: {clubId})</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="name">Club Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setFieldErrors(prev => ({...prev, name: null})); }}
            required
            disabled={isSubmitting || loading}
            className={fieldErrors.name ? 'input-error' : ''}
          />
          {fieldErrors.name && <p className="error-message-inline">{fieldErrors.name}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="budget">Budget:</label>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => { setBudget(e.target.value); setFieldErrors(prev => ({...prev, budget: null})); }}
            required
            min="0"
            step="10000"
            placeholder="e.g., 100000000"
            disabled={isSubmitting || loading}
            className={fieldErrors.budget ? 'input-error' : ''}
          />
          {fieldErrors.budget && <p className="error-message-inline">{fieldErrors.budget}</p>}
        </div>

        {submitError && <p className="error-message text-center mt-2">{submitError}</p>}
        {Object.keys(fieldErrors).length > 0 && !submitError && (
            <p className="error-message text-center mt-2">Please correct the highlighted fields.</p>
        )}

        {isSubmitting && <LoadingSpinner text="Updating club..." />}

        <button
            type="submit"
            className="button-primary w-100 button-lg mt-3"
            disabled={isSubmitting || loading || Object.keys(fieldErrors).some(key => fieldErrors[key] !== null)}
        >
          {isSubmitting ? 'Processing...' : 'Update Club'}
        </button>
      </form>
    </div>
  );
}

export default EditClubPage;

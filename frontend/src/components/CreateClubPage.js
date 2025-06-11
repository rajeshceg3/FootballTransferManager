import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

function CreateClubPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState(null); // For general/server errors
  const [fieldErrors, setFieldErrors] = useState({}); // For specific field errors
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({}); // Clear previous field errors
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
      await axios.post('/api/v1/clubs', payload);
      navigate('/clubs'); // Navigate to club list page on success
    } catch (err) {
      console.error("Error creating club:", err);
      setError(err.response?.data?.message || 'Failed to create club. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // formStyle and inputGroupStyle constants are removed, using CSS classes instead.

  return (
    <div className="form-card"> {/* Applied .form-card class */}
      <h2 className="text-center mb-3">Create New Club</h2> {/* Applied utility classes */}
      <form onSubmit={handleSubmit}>
        <div className="input-group"> {/* Applied .input-group class */}
          <label htmlFor="name">Club Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setFieldErrors(prev => ({...prev, name: null})); }}
            required
            disabled={isSubmitting}
            className={fieldErrors.name ? 'input-error' : ''}
          />
          {fieldErrors.name && <p className="error-message-inline">{fieldErrors.name}</p>}
        </div>

        <div className="input-group"> {/* Applied .input-group class */}
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
            disabled={isSubmitting}
            className={fieldErrors.budget ? 'input-error' : ''}
          />
          {fieldErrors.budget && <p className="error-message-inline">{fieldErrors.budget}</p>}
        </div>

        {error && <p className="error-message text-center mt-2">{error}</p>}
        {Object.keys(fieldErrors).length > 0 && !error && (
             <p className="error-message text-center mt-2">Please correct the highlighted fields.</p>
        )}

        {isSubmitting && <LoadingSpinner text="Creating club..." />}

        <button
            type="submit"
            className="button-primary w-100 button-lg mt-3" // Applied utility classes for styling
            disabled={isSubmitting || Object.keys(fieldErrors).some(key => fieldErrors[key] !== null)}
        >
          {isSubmitting ? 'Processing...' : 'Create Club'}
        </button>
      </form>
    </div>
  );
}

export default CreateClubPage;

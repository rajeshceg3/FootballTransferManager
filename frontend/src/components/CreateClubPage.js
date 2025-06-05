import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

function CreateClubPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        {error && <p className="error-message text-center mt-2">{error}</p>} {/* Added text-center */}

        {isSubmitting && <LoadingSpinner text="Creating club..." />}

        <button
            type="submit"
            className="button-primary w-100 button-lg mt-3" // Applied utility classes for styling
            disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Create Club'}
        </button>
      </form>
    </div>
  );
}

export default CreateClubPage;

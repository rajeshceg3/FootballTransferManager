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

  const formStyle = { maxWidth: '600px', margin: '20px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
  const inputGroupStyle = { marginBottom: '1.25rem' };


  return (
    <div style={formStyle}>
      <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Create New Club</h2>
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

        {error && <p className="error-message mt-2">{error}</p>}

        {isSubmitting && <LoadingSpinner text="Creating club..." />}

        <button
            type="submit"
            className="button-primary mt-3"
            style={{width: '100%', padding: '12px'}}
            disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Create Club'}
        </button>
      </form>
    </div>
  );
}

export default CreateClubPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const AddItem = () => {
  // 1. Component State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Lost',
    location: '',
    date: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { title, description, category, location, date } = formData;

  // 2. Handle Input Change
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // 3. Handle Form Submission
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // The token is automatically attached by our API interceptor
      await API.post('/lost-items', formData);
      alert('Item added successfully!');
      navigate('/items'); // Redirect to items feed
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item. Are you logged in?');
    }
  };

  return (
    <div className="page-container">
      <h2>Report Lost or Found Item</h2>
      <Link to="/items" style={{ marginBottom: '20px' }}>Back to Items</Link>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
        <input
          type="text"
          name="title"
          placeholder="Title (e.g. Blue iPhone 14)"
          value={title}
          onChange={onChange}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={description}
          onChange={onChange}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />
        <select
          name="category"
          value={category}
          onChange={onChange}
          style={{ marginBottom: '10px', padding: '8px' }}
        >
          <option value="Lost">Lost</option>
          <option value="Found">Found</option>
        </select>
        <input
          type="text"
          name="location"
          placeholder="Location found/lost"
          value={location}
          onChange={onChange}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />
        <input
          type="date"
          name="date"
          value={date}
          onChange={onChange}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px' }}>Submit Item</button>
      </form>
    </div>
  );
};

export default AddItem;

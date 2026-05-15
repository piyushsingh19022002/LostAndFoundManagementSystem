import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
  // 1. Component State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Destructure for easier use
  const { name, email, password } = formData;

  // 2. Handle Input Change
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // 3. Handle Form Submission
  const onSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError(''); // Clear previous errors

    try {
      // API call to backend
      const response = await API.post('/auth/register', { name, email, password });
      
      if (response.data) {
        alert('Registration successful! Please login.');
        navigate('/'); // Redirect to login page
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="page-container">
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={name}
          onChange={onChange}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={onChange}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={onChange}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px' }}>Register</button>
      </form>
    </div>
  );
};

export default Register;

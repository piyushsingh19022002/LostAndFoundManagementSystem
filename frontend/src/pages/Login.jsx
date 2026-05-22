import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  // 1. Component State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password } = formData;

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
      // API call to backend
      const response = await API.post('/auth/login', { email, password });
      
      if (response.data) {
        // Save token to LocalStorage
        localStorage.setItem('token', response.data.token);
        setUser(response.data);
        alert('Login successful!');
        navigate('/dashboard'); // Redirect to dashboard
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="page-container">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
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
          style={{ marginBottom: '5px', padding: '8px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#61dafb', textDecoration: 'none' }}>
            Forgot Password?
          </Link>
        </div>
        <button type="submit" style={{ padding: '10px' }}>Login</button>
      </form>
      <div style={{ marginTop: '10px' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </div>
    </div>
  );
};

export default Login;

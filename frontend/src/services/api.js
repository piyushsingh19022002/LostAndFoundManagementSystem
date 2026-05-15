import axios from 'axios';

// Create an Axios instance with base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api', // Uses .env or falls back to local
});

// Add a request interceptor to attach the JWT token to every request
API.interceptors.request.use((req) => {
  // Try to get token from localStorage
  const token = localStorage.getItem('token');
  
  if (token) {
    // If token exists, attach it to the Authorization header
    req.headers.Authorization = `Bearer ${token}`;
  }
  
  return req; // Return the modified request
});

export default API;

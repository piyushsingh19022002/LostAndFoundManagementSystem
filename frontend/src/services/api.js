import axios from 'axios';
import { showWarning } from '../utils/toast';

// Create an Axios instance with base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api', // Uses .env or falls back to local
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

// Add a response interceptor to intercept global responses and handle errors
API.interceptors.response.use(
  (res) => res,
  (error) => {
    // Check if error response is 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        // Clear token
        localStorage.removeItem('token');
        // Trigger a non-duplicating warning toast
        showWarning('Your session has expired. Please log in again.');
        // Redirect to login if possible (or force a page reload to let auth state update)
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

export default API;

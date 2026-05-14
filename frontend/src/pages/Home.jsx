import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="page-container">
      <h1>Welcome to Lost & Found Management System</h1>
      <p>Report lost items or help others find theirs.</p>
      <div>
        <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default Home;

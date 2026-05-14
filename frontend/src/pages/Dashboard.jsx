import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="page-container">
      <h1>Dashboard</h1>
      <p>Dashboard page placeholder</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

export default Dashboard;

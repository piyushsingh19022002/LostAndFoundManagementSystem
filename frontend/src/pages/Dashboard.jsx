import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#282c34', borderBottom: '2px solid #61dafb', paddingBottom: '10px' }}>
        Welcome back, {user?.name}!
      </h1>
      
      <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <h3>Your Control Panel</h3>
        <p>Email: {user?.email}</p>
        <p>Account Type: {user?.role}</p>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
        <Link to="/items" style={{
          padding: '10px 20px', backgroundColor: '#282c34', color: 'white', textDecoration: 'none', borderRadius: '4px'
        }}>View All Items</Link>
        
        <Link to="/add-item" style={{
          padding: '10px 20px', backgroundColor: '#61dafb', color: '#282c34', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold'
        }}>Report New Item</Link>
      </div>
    </div>
  );
};

export default Dashboard;

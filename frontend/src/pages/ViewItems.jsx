import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const ViewItems = () => {
  // 1. Component State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 2. Fetch Items on Mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await API.get('/lost-items');
        setItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch items');
        setLoading(false);
      }
    };

    fetchItems();
  }, []); // Empty dependency array ensures this runs only once when component loads

  // 3. Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Logged out');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Lost & Found Items feed</h2>
        <div>
          <Link to="/add-item" style={{ marginRight: '15px' }}>+ Report Item</Link>
          {localStorage.getItem('token') ? (
            <button onClick={handleLogout} style={{ padding: '5px' }}>Logout</button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>

      {loading && <p>Loading items...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && items.length === 0 && <p>No items reported yet.</p>}

      <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
        {items.map((item) => (
          <div key={item._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>
              <span style={{ color: item.category === 'Lost' ? 'red' : 'green' }}>
                [{item.category}]
              </span> {item.title}
            </h3>
            <p style={{ margin: '5px 0' }}><strong>Description:</strong> {item.description}</p>
            <p style={{ margin: '5px 0' }}><strong>Location:</strong> {item.location}</p>
            <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#555' }}>
              <strong>Reported by:</strong> {item.user?.name} ({item.user?.email})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewItems;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import AddItem from '../pages/AddItem';
import AddLostItem from '../pages/AddLostItem';
import LostItems from '../pages/LostItems';
import LostItemDetails from '../pages/LostItemDetails';
import FoundItems from '../pages/FoundItems';
import FoundItemDetails from '../pages/FoundItemDetails';
import AddFoundItem from '../pages/AddFoundItem';
import ViewItems from '../pages/ViewItems';
import MyItems from '../pages/MyItems';
import EditItem from '../pages/EditItem';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Router>
      <Navbar />
      <div style={{ flex: 1, padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-item" 
            element={
              <ProtectedRoute>
                <AddItem />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-lost-item" 
            element={
              <ProtectedRoute>
                <AddLostItem />
              </ProtectedRoute>
            } 
          />
          <Route path="/lost-items" element={<LostItems />} />
          <Route path="/lost-items/:id" element={<LostItemDetails />} />
          <Route path="/found-items" element={<FoundItems />} />
          <Route path="/found-items/:id" element={<FoundItemDetails />} />
          <Route
            path="/add-found-item"
            element={
              <ProtectedRoute>
                <AddFoundItem />
              </ProtectedRoute>
            }
          />
          <Route path="/items" element={<ViewItems />} />
          <Route 
            path="/my-items" 
            element={
              <ProtectedRoute>
                <MyItems />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-item/:id" 
            element={
              <ProtectedRoute>
                <EditItem />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRoutes;

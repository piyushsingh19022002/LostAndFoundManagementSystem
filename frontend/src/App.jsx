import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-container relative" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div className="radial-glow-tr"></div>
          <div className="radial-glow-bl"></div>
          <AppRoutes />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [userRole, setUserRole] = useState('');

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setCurrentPage('login');
  };

  return (
    <div>
      {currentPage === 'login' && (
        <Login onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />
      )}
      
      {currentPage === 'signup' && (
        <Signup onNavigate={setCurrentPage} />
      )}

      {currentPage === 'dashboard' && (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
          <h1>Dashboard SPA Marketplace</h1>
          <p>Te-ai conectat cu succes ca <strong>{userRole.toUpperCase()}</strong>!</p>
          <p style={{ color: 'green' }}>Autentificarea Stateless prin JWT a fost validată de Backend.</p>
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#DC3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>
            Deconectare
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
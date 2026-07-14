import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import CreateProfile from './components/CreateProfile';
import Marketplace from './marketplace/Marketplace';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [userRole, setUserRole] = useState('');

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    setCurrentPage('marketplace');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setCurrentPage('login');
  };

  useEffect(() => {
    const checkProviderProfile = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (currentPage === 'marketplace' && role === 'provider') {
        try {
          const response = await fetch('http://127.0.0.1:5000/api/provider/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.status === 404) {
            setCurrentPage('create_profile');
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    checkProviderProfile();
  }, [currentPage, userRole]);

  return (
    <div>
      {currentPage === 'login' && (
        <Login onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />
      )}
      
      {currentPage === 'signup' && (
        <Signup onNavigate={setCurrentPage} />
      )}

      {currentPage === 'create_profile' && (
        <CreateProfile onNavigate={setCurrentPage} />
      )}

      {currentPage === 'marketplace' && (
        <Marketplace onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
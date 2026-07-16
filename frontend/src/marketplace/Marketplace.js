import React, { useState, useEffect } from 'react';
import UpdateProfile from '../components/UpdateProfile';
import CreateService from '../components/services/CreateService';
import GetServices from '../components/services/GetServices';
import UpdateService from '../components/services/UpdateService';

function Marketplace({ onLogout }) {
  const [role, setRole] = useState('');
  const [providerData, setProviderData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [loadingServices, setLoadingServices] = useState(false);

  const fetchServices = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingServices(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/services/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setServices(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    setRole(userRole);

    if (userRole === 'provider' && token) {
      fetch('http://127.0.0.1:5000/api/provider/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Nu s-a putut încărca profilul.');
        })
        .then((data) => {
          setProviderData(data); 
        })
        .catch((err) => console.error(err));

      fetchServices();
    }
  }, []);

  const handleProfileUpdated = (newName, newCity) => {
    setProviderData((prev) => ({
      ...prev,
      nume: newName,
      oras: newCity
    }));
    setIsEditing(false);
  };

  const handleServiceUpdated = () => {
    setEditingService(null);
    fetchServices();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>Marketplace SPA</div>
        
        <div style={styles.headerRight}>
          {role === 'provider' && providerData ? (
            <div style={styles.profileArea}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                style={styles.profileButton}
              >
                 {providerData.nume} ({providerData.oras})
              </button>
              
              {showDropdown && (
                <div style={styles.dropdown}>
                  <button 
                    onClick={() => {
                      setIsEditing(true);
                      setShowDropdown(false);
                    }} 
                    style={styles.dropdownItem}
                  >
                     Actualizare date
                  </button>
                  <button 
                    onClick={onLogout} 
                    style={{ ...styles.dropdownItem, color: '#DC3545' }}
                  >
                     Deconectare
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onLogout} style={styles.logoutButton}>Deconectare</button>
          )}
        </div>
      </header>

      <main style={styles.mainContent}>
        {isEditing ? (
          <div>
            <UpdateProfile 
              currentName={providerData?.nume}
              currentCity={providerData?.oras}
              onProfileUpdated={handleProfileUpdated}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div>
            <div style={styles.welcomeBox}>
              <h1>Bine ai venit pe Marketplace!</h1>
              <p>Ești conectat cu rolul de: <strong>{role ? role.toUpperCase() : 'Vizitator'}</strong></p>
              
              {role === 'provider' && providerData && (
                <div style={styles.infoCard}>
                  <h3>Profilul tău de furnizor activează în:</h3>
                  <p><strong>Nume Brand:</strong> {providerData.nume}</p>
                  <p><strong>Oraș:</strong> {providerData.oras}</p>
                </div>
              )}

              {role === 'client' && (
                <p style={{ color: '#007BFF' }}>Aici vei vedea în curând lista cu toate serviciile disponibile!</p>
              )}
            </div>

            {role === 'provider' && (
              <div style={styles.servicesSection}>
                <div style={styles.servicesGrid}>
                  <div style={styles.servicesColumn}>
                    {editingService ? (
                      <UpdateService 
                        service={editingService} 
                        onServiceUpdated={handleServiceUpdated}
                        onCancel={() => setEditingService(null)}
                      />
                    ) : (
                      <CreateService onServiceAdded={fetchServices} />
                    )}
                  </div>

                  <div style={styles.servicesColumn}>
                    {loadingServices ? (
                      <p>Se încarcă serviciile...</p>
                    ) : (
                      <GetServices 
                        services={services} 
                        onRefresh={fetchServices} 
                        onEditSelect={(service) => setEditingService(service)}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#F8F9FA'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#343A40',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fff'
  },
  headerRight: {
    position: 'relative'
  },
  profileArea: {
    position: 'relative'
  },
  profileButton: {
    background: '#007BFF',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '35px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    width: '180px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
  },
  dropdownItem: {
    background: 'none',
    border: 'none',
    padding: '10px 15px',
    textAlign: 'left',
    width: '100%',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
    borderBottom: '1px solid #f1f1f1'
  },
  logoutButton: {
    background: '#DC3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  mainContent: {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  welcomeBox: {
    textAlign: 'center',
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginBottom: '30px'
  },
  infoCard: {
    marginTop: '20px',
    padding: '20px',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    backgroundColor: '#F1F5F9',
    textAlign: 'left',
    display: 'inline-block',
    minWidth: '300px'
  },
  servicesSection: {
    marginTop: '30px'
  },
  servicesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '30px',
    justifyContent: 'space-between'
  },
  servicesColumn: {
    flex: '1 1 450px',
    minWidth: '320px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }
};

export default Marketplace;
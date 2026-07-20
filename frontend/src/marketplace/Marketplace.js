import React, { useState, useEffect } from 'react';
import UpdateProfile from '../components/UpdateProfile';
import CreateService from '../components/services/CreateService';
import GetServices from '../components/services/GetServices';
import UpdateService from '../components/services/UpdateService';
import GetAllServices from '../components/services/GetAllServices';
import BookingModal from '../components/BookingModal';
import DashboardBookings from '../components/DashboardBookings';

function Marketplace({ onLogout }) {
  const [role, setRole] = useState('');
  const [userData, setUserData] = useState(null);
  const [view, setView] = useState('marketplace'); 
  const [showDropdown, setShowDropdown] = useState(false);
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

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

  const fetchProfile = (isInitialLoad = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setErrorMessage('');
    
    fetch('http://127.0.0.1:5000/api/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(`Serverul a răspuns cu codul: ${res.status}`);
      })
      .then((data) => {
        setUserData(data);
        
        // Deschide automat formularul DOAR dacă e prima încărcare și datele lipsesc complet
        if (isInitialLoad && (!data.name || !data.oras)) {
          setView('update-profile');
        } else if (isInitialLoad) {
          setView('profile');
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage(err.message || 'Nu s-a putut încărca profilul.');
      });
  };

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole);
    fetchProfile(true);

    if (userRole === 'provider') {
      fetchServices();
    }
  }, []);

  const handleProfileUpdated = () => {
    fetchProfile(false);
    setView('profile');
  };

  const handleServiceUpdated = () => {
    setEditingService(null);
    fetchServices();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => setView('marketplace')}>Marketplace SPA</div>

        <div style={styles.headerRight}>
          <div style={styles.profileArea}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={styles.profileButton}
            >
              Profilul meu ▾
            </button>

            {showDropdown && (
              <div style={styles.dropdown}>
                <button
                  onClick={() => {
                    setView('profile');
                    setShowDropdown(false);
                    if (!userData) fetchProfile(false);
                  }}
                  style={styles.dropdownItem}
                >
                  Vezi Profil
                </button>
                <button
                  onClick={() => {
                    setView('update-profile');
                    setShowDropdown(false);
                    if (!userData) fetchProfile(false);
                  }}
                  style={styles.dropdownItem}
                >
                  Actualizare date
                </button>
                {role === 'provider' && (
                  <button
                    onClick={() => {
                      setView('add-service');
                      setShowDropdown(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    Adaugă Serviciu
                  </button>
                )}
                <button
                  onClick={onLogout}
                  style={{ ...styles.dropdownItem, color: '#DC3545' }}
                >
                  Deconectare
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.mainContent}>
        {errorMessage && (
          <div style={{ padding: '20px', background: '#F8D7DA', color: '#721C24', borderRadius: '4px', marginBottom: '20px' }}>
            <strong>Eroare la încărcare:</strong> {errorMessage}
          </div>
        )}

        {view === 'update-profile' && (
          <div>
            {userData ? (
              <UpdateProfile
                currentName={userData.name}
                currentCity={userData.oras || userData.city || ''}
                onProfileUpdated={handleProfileUpdated}
                onCancel={() => setView('profile')}
              />
            ) : (
              <p>Se încarcă datele pentru actualizare...</p>
            )}
          </div>
        )}

        {view === 'add-service' && role === 'provider' && (
          <div style={styles.welcomeBox}>
            {editingService ? (
              <UpdateService
                service={editingService}
                onServiceUpdated={handleServiceUpdated}
                onCancel={() => setEditingService(null)}
              />
            ) : (
              <CreateService onServiceAdded={() => { fetchServices(); setView('profile'); }} />
            )}
          </div>
        )}

        {view === 'profile' && (
          <div style={styles.welcomeBox}>
            {userData ? (
              role === 'client' ? (
                <div>
                  <h1>Profil Client</h1>
                  <div style={styles.infoCard}>
                    <p><strong>Nume Complet:</strong> {userData.name || 'Necompletat'}</p>
                    <p><strong>Oraș Rezidență:</strong> {userData.oras || userData.city || 'Necompletat'}</p>
                    <p><strong>Rol platformă:</strong> CLIENT</p>
                    <p style={styles.balanceText}><strong>Sold Portofel:</strong> {userData.wallet_balance} RON</p>
                  </div>

                  <hr style={styles.divider} />

                  <div style={styles.servicesSection}>
                    <h2>Istoric Rezervări Active</h2>
                    <DashboardBookings />
                  </div>
                </div>
              ) : (
                <div>
                  <h1>Profil Furnizor</h1>
                  <div style={styles.infoCard}>
                    <p><strong>Nume Brand / Companie:</strong> {userData.name || 'Necompletat'}</p>
                    <p><strong>Oraș afacere:</strong> {userData.oras || userData.city || 'Necompletat'}</p>
                    <p><strong>Rol platformă:</strong> PROVIDER</p>
                    <p style={styles.balanceText}><strong>Sold Portofel:</strong> {userData.wallet_balance} RON</p>
                  </div>

                  <hr style={styles.divider} />

                  <div style={styles.servicesSection}>
                    <h2>Serviciile și Programările mele</h2>
                    <div style={styles.servicesGrid}>
                      <div style={styles.servicesColumn}>
                        {loadingServices ? (
                          <p>Se încarcă serviciile...</p>
                        ) : (
                          <GetServices
                            services={services}
                            onRefresh={fetchServices}
                            onEditSelect={(service) => { setEditingService(service); setView('add-service'); }}
                          />
                        )}
                      </div>
                      <div style={styles.servicesColumn}>
                        <DashboardBookings />
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <p>Se încarcă profilul de pe server...</p>
            )}
          </div>
        )}

        {view === 'marketplace' && (
          <div>
            <div style={styles.welcomeBox}>
              <h1>Bine ai venit pe Marketplace!</h1>
              <p>Explorează toate serviciile disponibile în platformă.</p>
              <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <GetAllServices onBookingSelect={(id, title) => setSelectedService({ id, title })} myServices={services} />
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedService && (
        <BookingModal
          serviceId={selectedService.id}
          serviceTitle={selectedService.title}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#F8F9FA' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: '#343A40', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  logo: { fontSize: '20px', fontWeight: 'bold', color: '#fff', cursor: 'pointer' },
  headerRight: { position: 'relative' },
  profileArea: { position: 'relative' },
  profileButton: { background: '#007BFF', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  dropdown: { position: 'absolute', right: 0, top: '35px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 4px 8px rgba(0,0,0,0.15)', width: '180px', zIndex: 1000, display: 'flex', flexDirection: 'column' },
  dropdownItem: { background: 'none', border: 'none', padding: '10px 15px', textAlign: 'left', width: '100%', cursor: 'pointer', fontSize: '14px', color: '#333', borderBottom: '1px solid #f1f1f1' },
  mainContent: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' },
  welcomeBox: { background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px' },
  infoCard: { marginTop: '20px', padding: '20px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: '#F1F5F9', textAlign: 'left', display: 'inline-block', minWidth: '300px' },
  balanceText: { fontSize: '16px', color: '#28A745', marginTop: '10px' },
  divider: { margin: '30px 0', border: '0', borderTop: '1px solid #E2E8F0' },
  servicesSection: { marginTop: '30px' },
  servicesGrid: { display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'space-between' },
  servicesColumn: { flex: '1 1 450px', minWidth: '320px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
};

export default Marketplace;
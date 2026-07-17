import React, { useState, useEffect } from 'react';

function GetAllServices({ onBookingSelect, myServices = [] }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://127.0.0.1:5000/api/services/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Nu s-au putut încărca serviciile disponibile.');
      })
      .then((data) => {
        setServices(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={styles.message}>Se încarcă serviciile disponibile...</p>;
  if (error) return <p style={{ ...styles.message, color: '#DC3545' }}>{error}</p>;
  if (services.length === 0) return <p style={styles.message}>Momentan nu există servicii disponibile pe platformă.</p>;

  return (
    <div style={styles.container}>
      <h3>Servicii Disponibile pe Marketplace</h3>
      <div style={styles.grid}>
        {services.map((service) => {
          const isOwnService = myServices.some(mySub => mySub.id === service.id);

          return (
            <div key={service.id} style={styles.card}>
              <div style={styles.cardInfo}>
                <h4 style={styles.cardTitle}>
                  {service.title} {isOwnService && <span style={styles.ownBadge}>(Serviciul tău)</span>}
                </h4>
                <p style={styles.cardPrice}>{service.price} RON</p>
              </div>
              
              {!isOwnService && (
                <button 
                  onClick={() => onBookingSelect(service.id, service.title)} 
                  style={styles.bookButton}
                >
                  Rezervă
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  message: { textAlign: 'center', marginTop: '20px', color: '#666' },
  grid: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' },
  card: {
    padding: '15px',
    backgroundColor: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    textAlign: 'left'
  },
  cardTitle: { margin: 0, fontSize: '16px', color: '#333' },
  cardPrice: { margin: 0, fontWeight: 'bold', color: '#28A745', fontSize: '16px' },
  ownBadge: { fontSize: '12px', color: '#6C757D', fontWeight: 'normal', fontStyle: 'italic', marginLeft: '5px' },
  bookButton: {
    padding: '8px 16px',
    background: '#28A745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  }
};

export default GetAllServices;
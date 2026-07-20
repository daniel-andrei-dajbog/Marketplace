import React, { useState, useEffect } from 'react';

function UpdateProfile({ currentName, currentCity, onProfileUpdated, onCancel }) {
  const [name, setName] = useState(currentName || '');
  const [city, setCity] = useState(currentCity || '');
  const [role, setRole] = useState('client');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name,
          oras: city,
          city: city
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Datele au fost salvate cu succes!');
        setTimeout(() => {
          onProfileUpdated();
        }, 1200);
      } else {
        setError(data.error || 'A apărut o eroare la salvare.');
      }
    } catch (err) {
      console.error(err);
      setError('Eroare de conexiune la rețea.');
    } finally {
      setLoading(false);
    }
  };

  const isClient = role === 'client';

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>
        {isClient ? 'Actualizare Profil Client' : 'Actualizare Profil Furnizor'}
      </h3>
      
      {message && <div style={styles.successAlert}>{message}</div>}
      {error && <div style={styles.errorAlert}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            {isClient ? 'Nume Complet' : 'Nume Brand / Companie'}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={isClient ? 'Ex: Andrei Popescu' : 'Ex: Companie SRL'}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            {isClient ? 'Oraș Rezidență' : 'Oraș Sediu Afacere'}
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="Ex: București"
            style={styles.input}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={onCancel}
            style={styles.cancelBtn}
            disabled={loading}
          >
            Anulează
          </button>
          <button
            type="submit"
            style={styles.saveBtn}
            disabled={loading}
          >
            {loading ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: '450px',
    margin: '20px auto',
    padding: '30px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: '1px solid #DEE2E6',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    textAlign: 'left',
    color: '#343A40',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    margin: 0,
    borderBottom: '2px solid #007BFF',
    paddingBottom: '8px'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #CED4DA',
    fontSize: '14px',
    outline: 'none'
  },
  buttonGroup: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', gap: '15px' },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    background: '#6C757D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  saveBtn: {
    flex: 2,
    padding: '10px',
    background: '#28A745',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  successAlert: { padding: '10px', backgroundColor: '#D4EDDA', color: '#155724', borderRadius: '4px', fontSize: '14px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' },
  errorAlert: { padding: '10px', backgroundColor: '#F8D7DA', color: '#721C24', borderRadius: '4px', fontSize: '14px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }
};

export default UpdateProfile;
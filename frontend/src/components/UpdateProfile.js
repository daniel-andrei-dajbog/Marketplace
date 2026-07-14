import React, { useState } from 'react';

function UpdateProfile({ currentName, currentCity, onProfileUpdated, onCancel }) {
  const [name, setName] = useState(currentName || '');
  const [city, setCity] = useState(currentCity || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/provider/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, city })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Profilul a fost actualizat cu succes!');
        if (onProfileUpdated) {
          onProfileUpdated(name, city);
        }
      } else {
        setMessage(`Eroare: ${data.message || 'Nu s-a putut efectua actualizarea.'}`);
      }
    } catch (error) {
      console.error('Eroare de conexiune la update:', error);
      setMessage('Eroare: Nu s-a putut conecta la server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3>Actualizează Profilul</h3>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div>
          <label style={styles.label}>Nume Companie / Brand:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Oraș:</label>
          <input 
            type="text" 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>

        {message && <p style={styles.error}>{message}</p>}

        <div style={styles.buttonGroup}>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            style={styles.saveButton}
          >
            {isSubmitting ? 'Se salvează...' : 'Salvează Modificările'}
          </button>
          
          <button 
            type="button" 
            onClick={onCancel} 
            style={styles.cancelButton}
          >
            Anulează
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  card: {
    background: '#ffffff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '450px',
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    fontSize: '15px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  saveButton: {
    flex: 1,
    padding: '10px',
    background: '#28A745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  cancelButton: {
    padding: '10px 15px',
    background: '#6C757D',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  error: {
    color: '#DC3545',
    fontSize: '14px',
    margin: '5px 0 0 0'
  }
};

export default UpdateProfile;
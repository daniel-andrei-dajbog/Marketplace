import React, { useState } from 'react';

function CreateProfile({ onNavigate }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/provider/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, city })
      });

      const data = await response.json();

      if (response.ok) {
        onNavigate('marketplace');
      } else {
        setMessage(`Eroare: ${data.message || 'Nu s-a putut crea profilul.'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('Eroare: Nu s-a putut conecta la server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Creare Profil Provider</h2>
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
        <button type="submit" disabled={isSubmitting} style={styles.button}>
          {isSubmitting ? 'Se creează...' : 'Salvează Profilul'}
        </button>
      </form>

      {message && <div style={styles.error}>{message}</div>}
    </div>
  );
}

const styles = {
  container: { padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '0 auto' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
  input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
  button: { padding: '10px', background: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  error: { marginTop: '20px', padding: '10px', borderRadius: '4px', background: '#F8D7DA', color: '#721C24' }
};

export default CreateProfile;
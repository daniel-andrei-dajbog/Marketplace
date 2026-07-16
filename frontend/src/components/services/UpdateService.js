import React, { useState, useEffect } from 'react';

function UpdateService({ service, onServiceUpdated, onCancel }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (service) {
      setTitle(service.title);
      setPrice(service.price);
    }
  }, [service]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/services/update/${service.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, price: parseFloat(price) })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Serviciu actualizat cu succes!');
        setTimeout(() => {
          onServiceUpdated();
        }, 1000);
      } else {
        setMessage(`Eroare: ${data.message || 'Nu s-a putut actualiza serviciul.'}`);
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
      <h3>Editează Serviciul</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div>
          <label style={styles.label}>Denumire Serviciu:</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            style={styles.input} 
          />
        </div>
        <div>
          <label style={styles.label}>Preț (RON):</label>
          <input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            required 
            style={styles.input} 
          />
        </div>
        <div style={styles.buttonGroup}>
          <button type="submit" disabled={isSubmitting} style={styles.saveButton}>
            {isSubmitting ? 'Se salvează...' : 'Salvează Modificările'}
          </button>
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            Anulează
          </button>
        </div>
      </form>

      {message && (
        <div style={message.includes('Eroare') ? styles.error : styles.success}>
          {message}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '20px auto', border: '1px solid #FFC107', borderRadius: '8px', backgroundColor: '#FFFDF3' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
  input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
  buttonGroup: { display: 'flex', gap: '10px' },
  saveButton: { flex: 1, padding: '10px', background: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  cancelButton: { flex: 1, padding: '10px', background: '#6C757D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  error: { marginTop: '15px', padding: '10px', borderRadius: '4px', background: '#F8D7DA', color: '#721C24' },
  success: { marginTop: '15px', padding: '10px', borderRadius: '4px', background: '#D4EDDA', color: '#155724' }
};

export default UpdateService;
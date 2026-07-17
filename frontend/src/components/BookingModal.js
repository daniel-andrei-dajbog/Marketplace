import React, { useState } from 'react';
import { bookingService } from './services/BookingService';

function BookingModal({ serviceId, serviceTitle, onClose }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const result = await bookingService.createBooking(serviceId, {
        date,
        start_time: startTime
      });

      if (result.message) {
        setMessage(result.message);
        if (!result.message.toLowerCase().includes('eroare') && !result.message.toLowerCase().includes('invalid')) {
          setTimeout(() => onClose(), 2000);
        }
      }
    } catch (error) {
      console.error(error);
      setMessage('Eroare: Nu s-a putut conecta la server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.container}>
        <h3>Rezervă Serviciul: {serviceTitle}</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Data:</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
              style={styles.input} 
            />
          </div>
          <div>
            <label style={styles.label}>Ora Început:</label>
            <input 
              type="time" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)} 
              required 
              style={styles.input} 
            />
          </div>
          <div style={styles.actions}>
            <button type="submit" disabled={isSubmitting} style={styles.button}>
              {isSubmitting ? 'Se trimite...' : 'Trimite Rezervarea'}
            </button>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Închide
            </button>
          </div>
        </form>

        {message && (
          <div style={message.includes('Eroare') ? styles.error : styles.success}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '400px', width: '100%', margin: '0 auto', background: 'white', borderRadius: '4px', boxSizing: 'border-box' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
  input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
  actions: { display: 'flex', gap: '10px', marginTop: '5px' },
  button: { flex: 1, padding: '10px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  cancelButton: { flex: 1, padding: '10px', background: '#6C757D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  error: { marginTop: '15px', padding: '10px', borderRadius: '4px', background: '#F8D7DA', color: '#721C24' },
  success: { marginTop: '15px', padding: '10px', borderRadius: '4px', background: '#D4EDDA', color: '#155724' }
};

export default BookingModal;
import React, { useEffect, useState, useCallback } from 'react';
import { bookingService } from './services/BookingService';

function DashboardBookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const role = localStorage.getItem('role');

  const loadBookings = useCallback(async () => {
    try {
      if (role === 'client') {
        const data = await bookingService.getClientBookings();
        if (Array.isArray(data)) setBookings(data);
      } else if (role === 'provider') {
        const data = await bookingService.getProviderBookings();
        if (Array.isArray(data)) setBookings(data);
      }
    } catch (error) {
      console.error(error);
      setMessage('Eroare: Nu s-au putut încărca rezervările.');
    }
  }, [role]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const result = await bookingService.updateBookingStatus(bookingId, newStatus);
      if (result.message && !result.message.includes('eroare')) {
        loadBookings();
      } else {
        setMessage(`Eroare: ${result.message}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('Eroare: Acțiunea nu a putut fi finalizată.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Rezervările mele</h2>
      {message && <div style={styles.error}>{message}</div>}

      <div style={styles.list}>
        {bookings.length === 0 ? <p>Nu există nicio rezervare în acest moment.</p> : null}
        
        {bookings.map(b => (
          <div key={b.id} style={styles.item}>
            <div>
              <strong>Programare #{b.id}</strong> - Data: {b.Data} ({b['Ora inceperii']} - {b['Ora finalizarii']})
              <span style={{ ...styles.badge, ...styles[b.Status] }}>{b.Status}</span>
            </div>

            {role === 'client' && b.Status === 'pending' && (
              <button onClick={() => handleStatusChange(b.id, 'cancelled')} style={styles.cancelBtn}>
                Anulează
              </button>
            )}

            {role === 'provider' && b.Status === 'pending' && (
              <div style={styles.actions}>
                <button onClick={() => handleStatusChange(b.id, 'confirmed')} style={styles.confirmBtn}>
                  Acceptă
                </button>
                <button onClick={() => handleStatusChange(b.id, 'rejected')} style={styles.rejectBtn}>
                  Respinge
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' },
  item: { padding: '15px', border: '1px solid #ccc', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9' },
  actions: { display: 'flex', gap: '5px' },
  badge: { marginLeft: '10px', padding: '3px 8px', borderRadius: '3px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' },
  pending: { background: '#FFEBAA', color: '#856404' },
  confirmed: { background: '#D4EDDA', color: '#155724' },
  rejected: { background: '#F8D7DA', color: '#721C24' },
  cancelled: { background: '#E2E3E5', color: '#383D41' },
  cancelBtn: { padding: '6px 12px', background: '#6C757D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  confirmBtn: { padding: '6px 12px', background: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  rejectBtn: { padding: '6px 12px', background: '#DC3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { marginBottom: '15px', padding: '10px', borderRadius: '4px', background: '#F8D7DA', color: '#721C24' }
};

export default DashboardBookings;
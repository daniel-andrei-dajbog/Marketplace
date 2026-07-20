import React, { useEffect, useState, useCallback } from 'react';
import { bookingService } from './services/BookingService';

const DAYS = [
  { label: 'Luni', value: 0 },
  { label: 'Marți', value: 1 },
  { label: 'Miercuri', value: 2 },
  { label: 'Joi', value: 3 },
  { label: 'Vineri', value: 4 },
  { label: 'Sâmbătă', value: 5 },
  { label: 'Duminică', value: 6 }
];

function DashboardBookings() {
  const [bookings, setBookings] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [message, setMessage] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [schedule, setSchedule] = useState(
    DAYS.map(day => ({ day_of_week: day.value, label: day.label, checked: false, start_time: '09:00', end_time: '17:00' }))
  );
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

  const loadServices = useCallback(async () => {
    if (role !== 'provider') return;
    try {
      const data = await bookingService.getProviderServices();
      const servicesArray = Array.isArray(data) ? data : (data.services || []);
      setMyServices(servicesArray);
    } catch (error) {
      console.error(error);
    }
  }, [role]);

  useEffect(() => {
    loadBookings();
    loadServices();
  }, [loadBookings, loadServices]);

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

  const handleCheckboxChange = (index) => {
    const updated = [...schedule];
    updated[index].checked = !updated[index].checked;
    setSchedule(updated);
  };

  const handleTimeChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedServiceId) {
      setMessage('Eroare: Te rog selectează un serviciu.');
      return;
    }

    const activeSchedule = schedule
      .filter(item => item.checked)
      .map(({ day_of_week, start_time, end_time }) => ({ day_of_week, start_time, end_time }));

    if (activeSchedule.length === 0) {
      setMessage('Eroare: Selectează cel puțin o zi de lucru.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/api/bookings/set-availability/${selectedServiceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activeSchedule)
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Programul de lucru a fost salvat cu succes!');
        setShowConfig(false);
      } else {
        setMessage(`Eroare: ${data.message}`);
      }
    } catch (error) {
      setMessage('Eroare: Nu s-a putut conecta la server.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2>Rezervările mele</h2>
        {role === 'provider' && (
          <button onClick={() => setShowConfig(!showConfig)} style={styles.configToggleBtn}>
            {showConfig ? 'Vezi rezervările' : 'Configurarea Disponibilității'}
          </button>
        )}
      </div>

      {message && <div style={styles.error}>{message}</div>}

      {showConfig ? (
        <div style={styles.configContainer}>
          <h3>Setează programul de lucru pentru serviciu</h3>
          <form onSubmit={handleSaveAvailability} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Alege Serviciul:</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                required
                style={styles.input}
              >
                <option value="">-- Selectează un serviciu --</option>
                {myServices.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.title || service.name || `Serviciu #${service.id}`}
                  </option>
                ))}
              </select>
            </div>

            {schedule.map((item, index) => (
              <div key={item.day_of_week} style={styles.scheduleRow}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleCheckboxChange(index)}
                    style={{ marginRight: '8px' }}
                  />
                  {item.label}
                </label>
                <input
                  type="time"
                  value={item.start_time}
                  onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                  disabled={!item.checked}
                  style={styles.timeInput}
                />
                <span>-</span>
                <input
                  type="time"
                  value={item.end_time}
                  onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                  disabled={!item.checked}
                  style={styles.timeInput}
                />
              </div>
            ))}

            <button type="submit" style={styles.saveBtn}>
              Salvează Programul
            </button>
          </form>
        </div>
      ) : (
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
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  configToggleBtn: { padding: '8px 15px', background: '#17A2B8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
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
  error: { marginBottom: '15px', padding: '10px', borderRadius: '4px', background: '#F8D7DA', color: '#721C24' },
  configContainer: { padding: '20px', border: '1px solid #ccc', borderRadius: '4px', background: '#f9f9f9' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontWeight: 'bold' },
  input: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' },
  scheduleRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  checkboxLabel: { width: '100px', display: 'flex', alignItems: 'center' },
  timeInput: { padding: '4px', borderRadius: '4px', border: '1px solid #ccc' },
  saveBtn: { padding: '10px', background: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }
};

export default DashboardBookings;
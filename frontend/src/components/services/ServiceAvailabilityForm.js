import React, { useState } from 'react';

const DAYS = [
  { label: 'Luni', value: 0 },
  { label: 'Marți', value: 1 },
  { label: 'Miercuri', value: 2 },
  { label: 'Joi', value: 3 },
  { label: 'Vineri', value: 4 },
  { label: 'Sâmbătă', value: 5 },
  { label: 'Duminică', value: 6 }
];

function ServiceAvailabilityForm({ serviceId, onSaveSuccess }) {
  const [schedule, setSchedule] = useState(
    DAYS.map(day => ({ day_of_week: day.value, label: day.label, checked: false, start_time: '09:00', end_time: '17:00' }))
  );
  const [message, setMessage] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const activeSchedule = schedule
      .filter(item => item.checked)
      .map(({ day_of_week, start_time, end_time }) => ({ day_of_week, start_time, end_time }));

    if (activeSchedule.length === 0) {
      setMessage('Eroare: Selectează cel puțin o zi de lucru.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/api/bookings/set-availability/${serviceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activeSchedule)
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Programul a fost salvat cu succes!');
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setMessage(`Eroare: ${data.message}`);
      }
    } catch (error) {
      setMessage('Eroare: Nu s-a putut conecta la server.');
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '4px', maxWidth: '500px' }}>
      <h4>Setează programul de lucru pentru acest serviciu</h4>
      <form onSubmit={handleSubmit}>
        {schedule.map((item, index) => (
          <div key={item.day_of_week} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
            <label style={{ width: '100px', fontWeight: 'bold' }}>
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
            />
            <span>până la</span>
            <input 
              type="time" 
              value={item.end_time} 
              onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
              disabled={!item.checked}
            />
          </div>
        ))}
        <button type="submit" style={{ padding: '10px 15px', background: '#28A745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Salvează Programul
        </button>
      </form>
      {message && <div style={{ marginTop: '15px', color: message.includes('Eroare') ? 'red' : 'green' }}>{message}</div>}
    </div>
  );
}

export default ServiceAvailabilityForm;
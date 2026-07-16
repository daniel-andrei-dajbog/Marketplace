import React from 'react';

function GetServices({ services, onRefresh, onEditSelect }) {
  
  const handleDelete = async (serviceId) => {
    if (!window.confirm('Sigur doriți să ștergeți acest serviciu?')) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/services/delete/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Serviciul a fost șters!');
        onRefresh(); 
      } else {
        const data = await response.json();
        alert(`Eroare: ${data.message || 'Nu s-a putut șterge serviciul.'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Eroare de conexiune cu serverul.');
    }
  };

  if (services.length === 0) {
    return <p style={{ textAlign: 'center' }}>Nu ai adăugat niciun serviciu momentan.</p>;
  }

  return (
    <div style={styles.container}>
      <h3>Serviciile mele</h3>
      <table style={styles.table}>
        <thead>
          <tr style={styles.thRow}>
            <th style={styles.th}>Serviciu</th>
            <th style={styles.th}>Preț</th>
            <th style={styles.th}>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} style={styles.tr}>
              <td style={styles.td}>{service.title}</td>
              <td style={styles.td}>{service.price} RON</td>
              <td style={styles.td}>
                <button 
                  onClick={() => onEditSelect(service)} 
                  style={styles.editButton}
                >
                  Editează
                </button>
                <button 
                  onClick={() => handleDelete(service.id)} 
                  style={styles.deleteButton}
                >
                  Șterge
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  thRow: { backgroundColor: '#f2f2f2' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' },
  tr: { borderBottom: '1px solid #ddd' },
  td: { padding: '12px' },
  editButton: { padding: '6px 12px', marginRight: '10px', background: '#FFC107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteButton: { padding: '6px 12px', background: '#DC3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default GetServices;
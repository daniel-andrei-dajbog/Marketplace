import React, { useState } from 'react';

function Signup({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Succes: ${data.message} Te poți loga acum.`);
        setEmail('');
        setPassword('');

      } else {
        setMessage(`Eroare: ${data.error}`);
      }
    } catch (error) {
      setMessage('Eroare: Nu s-a putut conecta la server.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Creare Cont Marketplace</h2>
      <form onSubmit={handleSignup} style={styles.form}>
        <div>
          <label style={styles.label}>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>Parolă:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>Alege Rolul tău:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
            <option value="client">Client (Caut servicii)</option>
            <option value="provider">Furnizor (Ofer servicii)</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <button type="submit" style={styles.button}>Înregistrare</button>
      </form>

      {message && <div style={message.startsWith('Succes') ? styles.success : styles.error}>{message}</div>}

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Ai deja cont?{' '}
        <span onClick={() => onNavigate('login')} style={styles.link}>
          Conectează-te aici
        </span>
      </p>
    </div>
  );
}

const styles = {
  container: { padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '0 auto' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { display: 'block', marginBottom: '5px' },
  input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px', background: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  link: { color: '#007BFF', cursor: 'pointer', textDecoration: 'underline' },
  success: { marginTop: '20px', padding: '10px', borderRadius: '4px', background: '#D4EDDA', color: '#155724' },
  error: { marginTop: '20px', padding: '10px', borderRadius: '4px', background: '#F8D7DA', color: '#721C24' }
};

export default Signup;
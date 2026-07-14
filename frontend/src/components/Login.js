import React, { useState } from 'react';

function Login({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Succes: Te-ai autentificat!');

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        
        if (onLoginSuccess) onLoginSuccess(data.role);

      } else {
        setMessage(`Eroare: ${data.error}`);
      }
    } catch (error) {
      setMessage('Eroare: Nu s-a putut conecta la server.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Autentificare Marketplace</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <div>
          <label style={styles.label}>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>Parolă:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
        </div>
        <button type="submit" style={styles.button}>Conectare</button>
      </form>

      {message && <div style={message.startsWith('Succes') ? styles.success : styles.error}>{message}</div>}

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Nu ai cont?{' '}
        <span onClick={() => onNavigate('signup')} style={styles.link}>
          Înregistrează-te aici
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
  button: { padding: '10px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  link: { color: '#007BFF', cursor: 'pointer', textDecoration: 'underline' },
  success: { marginTop: '20px', padding: '10px', borderRadius: '4px', background: '#D4EDDA', color: '#155724' },
  error: { marginTop: '20px', padding: '10px', borderRadius: '4px', background: '#F8D7DA', color: '#721C24' }
};

export default Login;
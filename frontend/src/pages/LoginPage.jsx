import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode]     = useState('login'); // 'login' or 'register'
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name) { setError('Name is required'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>CRM</div>
          <div>
            <div style={styles.logoTitle}>Mini CRM</div>
            <div style={styles.logoSub}>Lead Management System</div>
          </div>
        </div>

        <h2 style={styles.heading}>{mode === 'login' ? 'Admin Login' : 'Create Admin Account'}</h2>
        <p style={styles.sub}>{mode === 'login' ? 'Sign in to access your dashboard' : 'Set up your CRM admin account'}</p>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input style={styles.input} name="name" placeholder="Your Name" value={form.name} onChange={handle} required />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} name="email" type="email" placeholder="admin@company.com" value={form.email} onChange={handle} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={styles.toggle}>
          {mode === 'login' ? (
            <span>First time? <button style={styles.link} onClick={() => { setMode('register'); setError(''); }}>Create admin account</button></span>
          ) : (
            <span>Already have an account? <button style={styles.link} onClick={() => { setMode('login'); setError(''); }}>Sign in</button></span>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, sans-serif' },
  card: { background: '#fff', borderRadius: 16, border: '1px solid #e5e5e0', padding: '2rem', width: '100%', maxWidth: 400 },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' },
  logoIcon: { width: 44, height: 44, background: '#185FA5', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 },
  logoTitle: { fontWeight: 600, fontSize: 16, color: '#1a1a1a' },
  logoSub: { fontSize: 12, color: '#888' },
  heading: { fontSize: 20, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 },
  sub: { fontSize: 13, color: '#888', marginBottom: '1.5rem' },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 12, color: '#555', marginBottom: 5, fontWeight: 500 },
  input: { width: '100%', padding: '9px 12px', fontSize: 14, border: '1px solid #ddd', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  error: { background: '#fff0f0', border: '1px solid #fcc', color: '#c00', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 12 },
  btn: { width: '100%', padding: '10px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 4 },
  toggle: { textAlign: 'center', marginTop: '1rem', fontSize: 13, color: '#888' },
  link: { background: 'none', border: 'none', color: '#185FA5', cursor: 'pointer', fontSize: 13, fontWeight: 500 }
};

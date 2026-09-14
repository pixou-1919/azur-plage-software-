import { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      onLogin(data.staff);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="card login-card">
        <h2 style={{ marginBottom: 4 }}>Club de Vacance Azur Plage</h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: 20 }}>Staff Login</p>
        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

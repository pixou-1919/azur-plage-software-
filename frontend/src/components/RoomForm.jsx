import { useState } from 'react';
import { api } from '../services/api';

export default function RoomForm({ onCreated }) {
  const [form, setForm] = useState({ number: '', type: 'single', price_per_night: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.number || !form.price_per_night) {
      setError('Room number and price are required.');
      return;
    }

    setLoading(true);
    try {
      await api.createRoom({
        number: form.number,
        type: form.type,
        price_per_night: Number(form.price_per_night)
      });
      setSuccess(`Room ${form.number} added.`);
      setForm({ number: '', type: 'single', price_per_night: '' });
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 320 }}>
      <h3>Add Room</h3>

      <label className="field">
        Number
        <input value={form.number} onChange={update('number')} />
      </label>

      <label className="field">
        Type
        <select value={form.type} onChange={update('type')}>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
        </select>
      </label>

      <label className="field">
        Price per night
        <input type="number" value={form.price_per_night} onChange={update('price_per_night')} />
      </label>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <button type="submit" className="btn secondary" disabled={loading}>
        {loading && <span className="spinner" />}
        {loading ? 'Adding...' : 'Add Room'}
      </button>
    </form>
  );
}

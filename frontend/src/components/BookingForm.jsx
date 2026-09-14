import { useState } from 'react';
import { api } from '../services/api';

export default function BookingForm({ rooms, onCreated }) {
  const [form, setForm] = useState({
    room_id: '',
    full_name: '',
    email: '',
    phone: '',
    check_in: '',
    check_out: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.room_id || !form.full_name || !form.check_in || !form.check_out) {
      setError('Room, guest name, check-in and check-out are required.');
      return;
    }

    setLoading(true);
    try {
      await api.createBooking({
        room_id: Number(form.room_id),
        guest: { full_name: form.full_name, email: form.email, phone: form.phone },
        check_in: form.check_in,
        check_out: form.check_out
      });
      setSuccess('Booking created successfully.');
      setForm({ room_id: '', full_name: '', email: '', phone: '', check_in: '', check_out: '' });
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 400 }}>
      <h3>New Booking</h3>

      <label className="field">
        Room
        <select value={form.room_id} onChange={update('room_id')}>
          <option value="">Select a room</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              Room {r.number} ({r.type}) — {r.status}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Guest full name
        <input value={form.full_name} onChange={update('full_name')} />
      </label>

      <label className="field">
        Guest email (optional)
        <input value={form.email} onChange={update('email')} />
      </label>

      <label className="field">
        Guest phone (optional)
        <input value={form.phone} onChange={update('phone')} />
      </label>

      <label className="field">
        Check-in
        <input type="date" value={form.check_in} onChange={update('check_in')} />
      </label>

      <label className="field">
        Check-out
        <input type="date" value={form.check_out} onChange={update('check_out')} />
      </label>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <button type="submit" className="btn" disabled={loading}>
        {loading && <span className="spinner" />}
        {loading ? 'Creating...' : 'Create Booking'}
      </button>
    </form>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function BookingsList({ refreshKey, onStatusChanged }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const load = () =>
    api.getBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [refreshKey]);

  const handleStatus = async (id, status) => {
    setActingId(id);
    try {
      await api.updateBookingStatus(id, status);
      await load();
      onStatusChanged?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <p className="muted"><span className="spinner" />Loading bookings...</p>;
  if (bookings.length === 0) return <p className="muted">No bookings yet.</p>;

  return (
    <table className="bookings">
      <thead>
        <tr>
          <th>Room</th>
          <th>Guest</th>
          <th>Check-in</th>
          <th>Check-out</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b.id}>
            <td>{b.room_number}</td>
            <td>{b.guest_name}</td>
            <td>{new Date(b.check_in).toLocaleDateString()}</td>
            <td>{new Date(b.check_out).toLocaleDateString()}</td>
            <td><span className={`status-badge ${b.status}`}>{b.status.replace('_', ' ')}</span></td>
            <td>
              {actingId === b.id ? (
                <span className="spinner" />
              ) : (
                <>
                  {b.status === 'confirmed' && (
                    <button className="btn secondary" onClick={() => handleStatus(b.id, 'checked_in')}>
                      Check in
                    </button>
                  )}
                  {b.status === 'checked_in' && (
                    <button className="btn secondary" onClick={() => handleStatus(b.id, 'checked_out')}>
                      Check out
                    </button>
                  )}
                  {(b.status === 'confirmed' || b.status === 'checked_in') && (
                    <button className="btn danger" onClick={() => handleStatus(b.id, 'cancelled')}>
                      Cancel
                    </button>
                  )}
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

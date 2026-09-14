import { useEffect, useState } from 'react';
import { api } from '../services/api';
import RoomBoard from '../components/RoomBoard';
import RoomForm from '../components/RoomForm';
import BookingForm from '../components/BookingForm';
import BookingsList from '../components/BookingsList';

export default function Dashboard({ staff, onLogout }) {
  const [summary, setSummary] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api.getTodayDashboard().then(setSummary).catch(console.error);
  }, [refreshKey]);

  const handleChange = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
      <div className="topbar">
        <div>
          <h1 style={{ marginBottom: 0 }}>Azur Plage — Front Desk</h1>
          <p className="muted" style={{ marginTop: 4 }}>Room & booking management</p>
        </div>
        <div>
          <span className="muted" style={{ marginRight: 12 }}>
            {staff.name} · {staff.role}
          </span>
          <button className="btn secondary" onClick={onLogout}>Log out</button>
        </div>
      </div>

      {summary && (
        <div className="summary-row">
          <div className="summary-stat">
            Occupancy
            <strong>{(summary.occupancy_rate * 100).toFixed(0)}%</strong>
          </div>
          <div className="summary-stat">
            Arrivals today
            <strong>{summary.arrivals.length}</strong>
          </div>
          <div className="summary-stat">
            Departures today
            <strong>{summary.departures.length}</strong>
          </div>
        </div>
      )}

      <div className="section">
        <h2>Rooms</h2>
        <RoomBoard refreshKey={refreshKey} onRoomsLoaded={setRooms} />
      </div>

      {staff.role === 'admin' && (
        <div className="section">
          <RoomForm onCreated={handleChange} />
        </div>
      )}

      <div className="section">
        <BookingForm rooms={rooms} onCreated={handleChange} />
      </div>

      <div className="section">
        <h2>Bookings</h2>
        <BookingsList refreshKey={refreshKey} onStatusChanged={handleChange} />
      </div>
    </div>
  );
}

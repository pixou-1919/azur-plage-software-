import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function RoomBoard({ refreshKey, onRoomsLoaded }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getRooms()
      .then((data) => {
        setRooms(data);
        onRoomsLoaded?.(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <p className="muted"><span className="spinner" />Loading rooms...</p>;
  if (rooms.length === 0) return <p className="muted">No rooms yet — add one below.</p>;

  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <div key={room.id} className={`room-card ${room.status}`}>
          <strong>Room {room.number}</strong>
          <div style={{ fontSize: 12 }}>{room.type}</div>
          <div className="room-status">{room.status}</div>
        </div>
      ))}
    </div>
  );
}

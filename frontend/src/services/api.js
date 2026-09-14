const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getRooms: () => request('/rooms'),

  createRoom: (room) =>
    request('/rooms', { method: 'POST', body: JSON.stringify(room) }),

  getBookings: () => request('/bookings'),

  createBooking: (booking) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(booking) }),

  updateBookingStatus: (id, status) =>
    request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getTodayDashboard: () => request('/bookings/dashboard/today')
};

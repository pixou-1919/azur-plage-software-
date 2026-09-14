import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [staff, setStaff] = useState(null);

  // Keep the user logged in across page refreshes
  useEffect(() => {
    const saved = localStorage.getItem('staff');
    if (saved) setStaff(JSON.parse(saved));
  }, []);

  const handleLogin = (staffData) => {
    localStorage.setItem('staff', JSON.stringify(staffData));
    setStaff(staffData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('staff');
    setStaff(null);
  };

  if (!staff) return <Login onLogin={handleLogin} />;
  return <Dashboard staff={staff} onLogout={handleLogout} />;
}

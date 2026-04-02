import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/">CalorieTracker</NavLink>
      </div>
      <div className="navbar-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/log">Meal Log</NavLink>
        <NavLink to="/history">History</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </div>
      <div className="navbar-user">
        <span>{user?.name || user?.email}</span>
        <button onClick={handleLogout} className="btn-link">Logout</button>
      </div>
    </nav>
  );
}

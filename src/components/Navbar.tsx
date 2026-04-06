import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaParking, FaSignOutAlt } from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FaParking size={24} />
        <span>ParkMaster PMS</span>
      </div>
      
      {currentUser && (
        <div className="navbar-user">
          <div className="user-info">
            <span className="username">{currentUser.username}</span>
            <span className={`role-badge ${currentUser.role}`}>{currentUser.role}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

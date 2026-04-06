import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaSignInAlt, FaThLarge, FaChartBar, FaCog } from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  const { currentUser } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaHome /> Dashboard
        </NavLink>
        <NavLink to="/entry" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaSignInAlt /> Vehicle Entry
        </NavLink>
        <NavLink to="/exit" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaSignOutAlt /> Vehicle Exit
        </NavLink>
        <NavLink to="/slots" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FaThLarge /> Slot Monitoring
        </NavLink>

        {currentUser?.role === 'admin' && (
          <>
            <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FaChartBar /> Reports
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FaCog /> Settings
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

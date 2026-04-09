import React from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const { currentUser } = useApp();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">P</span>
        ParkMaster PMS
      </div>
      <div className="navbar-right">
        {currentUser && (
          <>
            <span className="user-info">
              {currentUser.user_email_id}
              <span className={`role-badge ${currentUser.role === 'admin' ? 'admin' : 'staff'}`}>
                {currentUser.role === 'admin' ? 'Admin' : 'Staff'}
              </span>
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

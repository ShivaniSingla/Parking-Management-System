import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaUserTie } from 'react-icons/fa';
import '../styles/LoginPage.css';

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '600px' }}>
        <h1 className="login-title">ParkMaster PMS</h1>
        <p className="login-subtitle">Select your login role</p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
          <button 
            className="btn btn-primary" 
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', width: '200px', gap: '1rem' }}
            onClick={() => navigate('/admin-login')}
          >
            <FaUserShield size={40} />
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Admin</span>
          </button>

          <button 
            className="btn btn-primary"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', width: '200px', backgroundColor: 'var(--success)', gap: '1rem' }}
            onClick={() => navigate('/staff-login')}
          >
            <FaUserTie size={40} />
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Staff</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

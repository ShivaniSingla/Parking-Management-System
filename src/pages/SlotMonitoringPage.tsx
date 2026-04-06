import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SlotCard from '../components/SlotCard';
import '../styles/SlotMonitoringPage.css';

const SlotMonitoringPage: React.FC = () => {
  const { slots } = useApp();
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredSlots = slots.filter(slot => {
    if (filterType !== 'All' && slot.slotType !== filterType) return false;
    if (filterStatus !== 'All' && slot.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1.5rem' }}>Slot Monitoring</h1>

      <div className="slots-stats">
        <div className="stat-group">
          <div className="stat-circle" style={{ backgroundColor: 'var(--success)' }}></div>
          <span>Available ({slots.filter(s => s.status === 'available').length})</span>
        </div>
        <div className="stat-group">
          <div className="stat-circle" style={{ backgroundColor: 'var(--danger)' }}></div>
          <span>Occupied ({slots.filter(s => s.status === 'occupied').length})</span>
        </div>
        <div className="stat-group">
          <div className="stat-circle" style={{ backgroundColor: 'var(--text-muted)' }}></div>
          <span>Maintenance ({slots.filter(s => s.status === 'maintenance').length})</span>
        </div>
      </div>

      <div className="filters-bar">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginRight: '2rem' }}>
          <span style={{ fontWeight: 600 }}>Type:</span>
          {['All', 'Car', 'Bike', 'EV', 'Handicap'].map(type => (
            <button 
              key={type} 
              className={`filter-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Status:</span>
          {['All', 'available', 'occupied', 'maintenance'].map(status => (
            <button 
              key={status} 
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="slots-grid">
        {filteredSlots.map(slot => (
          <SlotCard key={slot.slotId} slot={slot} />
        ))}
        {filteredSlots.length === 0 && <p>No slots found matching criteria.</p>}
      </div>
    </div>
  );
};

export default SlotMonitoringPage;

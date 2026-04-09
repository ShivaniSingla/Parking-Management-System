import React from 'react';
import { useApp } from '../context/AppContext';
import '../styles/SlotMonitoringPage.css';

const SlotMonitoringPage: React.FC = () => {
  const { parking, vehicles } = useApp();

  const activeVehicles = vehicles.filter(v => !v.exitTime);

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1.5rem' }}>Slot Monitoring</h1>

      <div className="slots-stats">
        <div className="stat-group">
          <div className="stat-circle" style={{ backgroundColor: 'var(--primary)' }}></div>
          <span>Total Slots: {parking.totalSlots}</span>
        </div>
        <div className="stat-group">
          <div className="stat-circle" style={{ backgroundColor: 'var(--success)' }}></div>
          <span>Available: {parking.avaSlots}</span>
        </div>
        <div className="stat-group">
          <div className="stat-circle" style={{ backgroundColor: 'var(--danger)' }}></div>
          <span>Occupied: {parking.totalSlots - parking.avaSlots}</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="chart-title">Currently Parked Vehicles</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle No</th>
                <th>Vehicle Type</th>
                <th>Entry Time</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {activeVehicles.map(v => {
                const durationMs = Date.now() - new Date(v.entryTime).getTime();
                const durationMins = Math.floor(durationMs / 60000);
                const hours = Math.floor(durationMins / 60);
                const mins = durationMins % 60;

                return (
                  <tr key={v.vehicleNo}>
                    <td style={{ fontWeight: 600 }}>{v.vehicleNo}</td>
                    <td>{v.vehicleType}</td>
                    <td>{new Date(v.entryTime).toLocaleString()}</td>
                    <td>{hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}</td>
                  </tr>
                );
              })}

              {activeVehicles.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No vehicles currently parked
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SlotMonitoringPage;

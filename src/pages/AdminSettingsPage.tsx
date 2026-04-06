import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PricingPolicy } from '../types';
import '../styles/AdminSettingsPage.css';

const AdminSettingsPage: React.FC = () => {
  const { pricingPolicy, updatePricing } = useApp();
  
  const [localPricing, setLocalPricing] = useState<PricingPolicy[]>([...pricingPolicy]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePricingChange = (index: number, field: keyof PricingPolicy, value: number) => {
    const updated = [...localPricing];
    updated[index] = { ...updated[index], [field]: value };
    setLocalPricing(updated);
    setSaveSuccess(false);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSavePricing = async () => {
    setIsSaving(true);
    try {
      await updatePricing(localPricing);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save pricing");
    } finally {
      setIsSaving(false);
    }
  };

  // Mock logs
  const logs = [
    { time: '10:45 AM', message: 'User admin logged in' },
    { time: '10:50 AM', message: 'Vehicle entry MH04AB1234 recorded' },
    { time: '11:15 AM', message: 'Slot S012 status changed to maintenance' },
    { time: '11:30 AM', message: 'Pricing policy updated for EV' },
    { time: '12:00 PM', message: 'Vehicle exit MH04AB1234 processed' },
  ];

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1.5rem' }}>Admin Settings</h1>

      <div className="settings-grid">
        <div className="card">
          <h2 className="chart-title">Pricing Policy</h2>
          
          <table className="data-table" style={{ marginBottom: '1.5rem' }}>
            <thead>
              <tr>
                <th>Vehicle Type</th>
                <th>Hourly Rate (₹)</th>
                <th>Grace Period (mins)</th>
              </tr>
            </thead>
            <tbody>
              {localPricing.map((policy, idx) => (
                <tr key={policy.vehicleType}>
                  <td style={{ fontWeight: 600 }}>{policy.vehicleType}</td>
                  <td>
                    <input 
                      type="number" 
                      className="table-input"
                      value={policy.hourlyRate}
                      onChange={e => handlePricingChange(idx, 'hourlyRate', Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="table-input"
                      value={policy.gracePeriodMinutes}
                      onChange={e => handlePricingChange(idx, 'gracePeriodMinutes', Number(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handleSavePricing} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Pricing Options'}
            </button>
            {saveSuccess && <span style={{ color: 'var(--success)', fontWeight: 500 }}>Saved successfully!</span>}
          </div>
        </div>

        <div className="card">
          <h2 className="chart-title">System Logs</h2>
          <div className="system-logs">
            {logs.map((log, i) => (
              <div key={i} className="log-item">
                <span className="log-time">[{log.time}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;

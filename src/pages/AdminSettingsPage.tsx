import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Admin from '../models/Admin';
import '../styles/AdminSettingsPage.css';

const AdminSettingsPage: React.FC = () => {
  const { currentUser, pricing, refreshData } = useApp();

  // Pricing state
  const [localPricing, setLocalPricing] = useState([...pricing]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setLocalPricing([...pricing]);
  }, [pricing]);

  const handlePricingChange = (index: number, newRate: number) => {
    const updated = [...localPricing];
    updated[index] = { ...updated[index], hourlyRate: newRate };
    setLocalPricing(updated);
    setSaveSuccess(false);
  };

  const handleSavePricing = async () => {
    setIsSaving(true);
    try {
      const admin = new Admin(currentUser?.user_email_id || '');
      // Call Admin.updatePrice() for each changed type
      for (const p of localPricing) {
        const result = await admin.updatePrice(p.vehicleType, p.hourlyRate);
        if (!result.success) {
          alert(`Failed to update ${p.vehicleType}: ${result.error}`);
          return;
        }
      }
      setSaveSuccess(true);
      await refreshData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save pricing");
    } finally {
      setIsSaving(false);
    }
  };

  // Staff management state
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [staffCreationStatus, setStaffCreationStatus] = useState('');

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffCreationStatus('Creating...');
    try {
      const admin = new Admin(currentUser?.user_email_id || '');
      // Call Admin.addStaff()
      const result = await admin.addStaff(newStaffEmail.trim(), newStaffPassword);
      if (!result.success) {
        setStaffCreationStatus(`Error: ${result.error}`);
        return;
      }
      setStaffCreationStatus('Staff created successfully! Note: You may be signed out. Please log in again.');
      setNewStaffEmail('');
      setNewStaffPassword('');
    } catch (err: any) {
      setStaffCreationStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1.5rem' }}>Admin Settings</h1>

      <div className="settings-grid">
        <div className="card">
          <h2 className="chart-title">Pricing Policy</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Update hourly rates per vehicle type using <code>Admin.updatePrice()</code>
          </p>

          <table className="data-table" style={{ marginBottom: '1.5rem' }}>
            <thead>
              <tr>
                <th>Vehicle Type</th>
                <th>Hourly Rate (₹)</th>
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
                      onChange={e => handlePricingChange(idx, Number(e.target.value))}
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
          <h2 className="chart-title">Staff Management</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Add new staff via <code>Admin.addStaff()</code>
          </p>
          <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>Email</label>
              <input
                type="email"
                className="table-input"
                value={newStaffEmail}
                onChange={e => setNewStaffEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>Password (min 6 chars)</label>
              <input
                type="password"
                className="table-input"
                value={newStaffPassword}
                onChange={e => setNewStaffPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
              Create Staff Account
            </button>
            {staffCreationStatus && (
              <div style={{ fontSize: '0.9rem', color: staffCreationStatus.includes('Error') ? 'var(--danger)' : 'var(--success)' }}>
                {staffCreationStatus}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;

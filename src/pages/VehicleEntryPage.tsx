import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FaCheckCircle } from 'react-icons/fa';
import Staff from '../models/Staff';
import Parking from '../models/Parking';
import '../styles/VehicleEntryPage.css';

const VehicleEntryPage: React.FC = () => {
  const { currentUser, parking, refreshData } = useApp();

  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ ticketID: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const vNum = vehicleNo.trim().toUpperCase();

    const regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
    if (!regex.test(vNum)) {
      setError('Invalid vehicle number format. Correct format: MH04AB1234');
      return;
    }

    setIsProcessing(true);
    try {
      // Use Staff.vehicleEntry() which internally calls Parking.assignSlots()
      const staff = new Staff(currentUser?.user_email_id || '');
      const parkingInstance = new Parking(parking.totalSlots, parking.avaSlots);

      const result = await staff.vehicleEntry(vNum, vehicleType, parkingInstance);

      if (!result.success) {
        setError(result.error || 'Failed to process entry');
        return;
      }

      setSuccessInfo({ ticketID: result.ticketID || '' });
      setVehicleNo('');
      setVehicleType('Car');
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to process entry');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSuccessInfo(null);
    setError('');
    setVehicleNo('');
  };

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1.5rem' }}>Vehicle Entry</h1>

      <div className="entry-page-content">
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Vehicle Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="MH04AB1234"
                value={vehicleNo}
                onChange={e => setVehicleNo(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type</label>
              <select
                className="form-input"
                value={vehicleType}
                onChange={e => setVehicleType(e.target.value)}
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="EV">Electric Vehicle (EV)</option>
                <option value="Handicap">Handicap</option>
              </select>
            </div>

            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Process Entry'}
            </button>
          </form>
        </div>

        {successInfo && (
          <div className="entry-success-card">
            <div className="success-icon"><FaCheckCircle /></div>
            <h2>Entry Successful!</h2>
            <div className="assigned-slot-display">
              <p style={{ color: 'var(--text-muted)' }}>Ticket ID</p>
              <div className="assigned-slot-number">{successInfo.ticketID}</div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Available Slots: {parking.avaSlots}
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleReset}>
              Process Another Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleEntryPage;

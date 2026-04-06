import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ParkingRecord } from '../types';
import { FaCheckCircle } from 'react-icons/fa';
import '../styles/VehicleEntryPage.css';

const VehicleEntryPage: React.FC = () => {
  const { slots, records, addRecord, updateSlot } = useApp();
  
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'Car'|'Bike'|'EV'|'Handicap'>('Car');
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<{slotId: string, slotNumber: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const vNum = vehicleNumber.trim().toUpperCase();

    // Regex for typical Indian vehicle number as example (e.g., MH04AB1234)
    const regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
    if (!regex.test(vNum)) {
      setError('Invalid vehicle number format. Correct format: MH04AB1234');
      return;
    }

    // Check duplicate active entry
    const isActive = records.find(r => r.vehicleNumber === vNum && r.paymentStatus === 'pending');
    if (isActive) {
      setError(`Vehicle ${vNum} is already parked in slot ${isActive.slotId}!`);
      return;
    }

    // Find nearest available slot
    const availableSlots = slots.filter(s => s.slotType === vehicleType && s.status === 'available');
    if (availableSlots.length === 0) {
      setError(`No available slots for ${vehicleType}.`);
      return;
    }

    const assignedSlot = availableSlots[0];
    const newRecordId = `REC-${Math.floor(Date.now() / 1000)}`;

    const newRecord: ParkingRecord = {
      recordId: newRecordId,
      vehicleNumber: vNum,
      vehicleType,
      slotId: assignedSlot.slotId,
      entryTime: new Date().toISOString(),
      paymentStatus: 'pending'
    };

    setIsProcessing(true);
    try {
      await addRecord(newRecord);
      await updateSlot(assignedSlot.slotId, { status: 'occupied' });
      setSuccessInfo({ slotId: assignedSlot.slotId, slotNumber: assignedSlot.slotNumber });
      
      // Reset form
      setVehicleNumber('');
      setVehicleType('Car');
    } catch (err: any) {
      setError(err.message || 'Failed to process entry');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSuccessInfo(null);
    setError('');
    setVehicleNumber('');
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
                value={vehicleNumber}
                onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type</label>
              <select 
                className="form-input" 
                value={vehicleType} 
                onChange={e => setVehicleType(e.target.value as any)}
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
              <p style={{ color: 'var(--text-muted)' }}>Assigned Slot</p>
              <div className="assigned-slot-number">{successInfo.slotNumber}</div>
            </div>
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

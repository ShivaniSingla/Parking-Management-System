import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ParkingRecord } from '../types';
import ReceiptCard from '../components/ReceiptCard';
import '../styles/VehicleExitPage.css';

const VehicleExitPage: React.FC = () => {
  const { records, pricingPolicy, updateRecord, updateSlot } = useApp();
  
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [error, setError] = useState('');
  const [activeRecord, setActiveRecord] = useState<ParkingRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash'|'Card'|'UPI'>('Cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [processedRecord, setProcessedRecord] = useState<ParkingRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateFee = (record: ParkingRecord) => {
    const entryTime = new Date(record.entryTime);
    const exitTime = new Date();
    const durationMinutes = Math.ceil((exitTime.getTime() - entryTime.getTime()) / 60000);
    
    const policy = pricingPolicy.find(p => p.vehicleType === record.vehicleType);
    if (!policy) return { durationMinutes, feeAmount: 0 };

    if (durationMinutes <= policy.gracePeriodMinutes) {
      return { durationMinutes, feeAmount: 0 };
    }

    const hours = Math.ceil(durationMinutes / 60);
    const feeAmount = hours * policy.hourlyRate;
    
    return { durationMinutes, feeAmount };
  };

  const handleSearch = () => {
    setError('');
    const vNum = vehicleNumber.trim().toUpperCase();
    const record = records.find(r => r.vehicleNumber === vNum && r.paymentStatus === 'pending');
    
    if (!record) {
      setError(`No active parking found for vehicle ${vNum}`);
      setActiveRecord(null);
      return;
    }

    const { durationMinutes, feeAmount } = calculateFee(record);
    setActiveRecord({ ...record, durationMinutes, feeAmount, exitTime: new Date().toISOString() });
  };

  const handleConfirmExit = async () => {
    if (!activeRecord) return;
    setIsProcessing(true);

    const completedRecord: ParkingRecord = {
      ...activeRecord,
      paymentMethod,
      paymentStatus: 'completed'
    };

    try {
      await updateRecord(completedRecord.recordId, {
        exitTime: completedRecord.exitTime,
        durationMinutes: completedRecord.durationMinutes,
        feeAmount: completedRecord.feeAmount,
        paymentStatus: 'completed',
        paymentMethod,
      });

      await updateSlot(activeRecord.slotId, { status: 'available' });
      setProcessedRecord(completedRecord);
      setShowReceipt(true);
      setActiveRecord(null);
    } catch (err: any) {
      setError(err.message || 'Failed to process exit');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setProcessedRecord(null);
    setVehicleNumber('');
  };

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1.5rem' }}>Vehicle Exit</h1>
      
      {!showReceipt ? (
        <div className="exit-page-content">
          <div>
            <div className="card">
              <div className="search-section">
                <div className="form-group">
                  <label>Vehicle Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter Vehicle No..."
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                  />
                </div>
                <button className="btn btn-primary search-btn" onClick={handleSearch}>
                  Search
                </button>
              </div>
              {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
            </div>
          </div>

          <div>
            {activeRecord && (
              <div className="details-card">
                <h2>Parking Details</h2>
                <div style={{ marginTop: '1.5rem' }} className="details-grid">
                  <div className="detail-item">
                    <div className="label">Entry Time</div>
                    <div className="value">{new Date(activeRecord.entryTime).toLocaleString()}</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Duration</div>
                    <div className="value">{activeRecord.durationMinutes} mins</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Vehicle Type</div>
                    <div className="value">{activeRecord.vehicleType}</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Slot Number</div>
                    <div className="value">{activeRecord.slotId}</div>
                  </div>
                </div>

                <div className="fee-calculation">
                  <div style={{ color: 'var(--text-muted)' }}>Total Amount Due</div>
                  <div className="fee-amount">₹{activeRecord.feeAmount}</div>
                  {activeRecord.feeAmount === 0 && <div style={{ color: 'var(--success)' }}>(Within grace period)</div>}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Payment Method</label>
                  <div className="payment-methods">
                    {['Cash', 'Card', 'UPI'].map(pm => (
                      <button 
                        key={pm}
                        className={`pm-btn ${paymentMethod === pm ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(pm as any)}
                      >
                        {pm}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleConfirmExit} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Confirm Payment & Exit'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        processedRecord && <ReceiptCard record={processedRecord} onClose={closeReceipt} />
      )}
    </div>
  );
};

export default VehicleExitPage;

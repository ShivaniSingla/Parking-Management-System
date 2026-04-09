import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Staff from '../models/Staff';
import Parking from '../models/Parking';
import Vehicle from '../models/Vehicle';
import '../styles/VehicleExitPage.css';

const VehicleExitPage: React.FC = () => {
  const { currentUser, parking, refreshData } = useApp();

  const [vehicleNo, setVehicleNo] = useState('');
  const [error, setError] = useState('');
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{ vehicleNo: string; vehicleType: string; entryTime: string; exitTime: string; amount: number; ticketID: string; paymentMethod: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [previewAmount, setPreviewAmount] = useState(0);

  const handleSearch = async () => {
    setError('');
    const vNum = vehicleNo.trim().toUpperCase();

    const vehicle = await Vehicle.getActiveVehicle(vNum);
    if (!vehicle) {
      setError(`No active parking found for vehicle ${vNum}`);
      setActiveVehicle(null);
      return;
    }

    // Preview: set temporary exit time to calculate duration/amount
    vehicle.exitTime = new Date().toISOString();
    const duration = vehicle.calculateTime();
    setPreviewDuration(duration);

    // Rough estimate for preview (will be accurate in processExit)
    const hours = Math.ceil(duration / 60);
    setPreviewAmount(hours * 20); // Rough estimate
    setActiveVehicle(vehicle);
  };

  const handleConfirmExit = async () => {
    if (!activeVehicle) return;
    setIsProcessing(true);

    try {
      const staff = new Staff(currentUser?.user_email_id || '');
      const parkingInstance = new Parking(parking.totalSlots, parking.avaSlots);

      // Staff.processExit() calls Vehicle.calculateTime() → Ticket.generateBill() → Payment.processPay() → Parking.freeSlots()
      const result = await staff.processExit(activeVehicle.vehicleNo, paymentMethod, parkingInstance);

      if (!result.success) {
        setError(result.error || 'Failed to process exit');
        return;
      }

      setReceiptData({
        vehicleNo: activeVehicle.vehicleNo,
        vehicleType: activeVehicle.vehicleType,
        entryTime: activeVehicle.entryTime,
        exitTime: new Date().toISOString(),
        amount: result.amount || 0,
        ticketID: result.ticketID || '',
        paymentMethod,
      });
      setShowReceipt(true);
      setActiveVehicle(null);
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to process exit');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
    setVehicleNo('');
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
                    value={vehicleNo}
                    onChange={e => setVehicleNo(e.target.value.toUpperCase())}
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
            {activeVehicle && (
              <div className="details-card">
                <h2>Parking Details</h2>
                <div style={{ marginTop: '1.5rem' }} className="details-grid">
                  <div className="detail-item">
                    <div className="label">Entry Time</div>
                    <div className="value">{new Date(activeVehicle.entryTime).toLocaleString()}</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Duration</div>
                    <div className="value">{previewDuration} mins</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Vehicle Type</div>
                    <div className="value">{activeVehicle.vehicleType}</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Vehicle No</div>
                    <div className="value">{activeVehicle.vehicleNo}</div>
                  </div>
                </div>

                <div className="fee-calculation">
                  <div style={{ color: 'var(--text-muted)' }}>Estimated Amount</div>
                  <div className="fee-amount">₹{previewAmount}</div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Payment Method</label>
                  <div className="payment-methods">
                    {['Cash', 'Card', 'UPI'].map(pm => (
                      <button
                        key={pm}
                        className={`pm-btn ${paymentMethod === pm ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(pm)}
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
        receiptData && (
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>🧾 Receipt</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div><strong>Ticket ID:</strong> {receiptData.ticketID}</div>
              <div><strong>Vehicle No:</strong> {receiptData.vehicleNo}</div>
              <div><strong>Vehicle Type:</strong> {receiptData.vehicleType}</div>
              <div><strong>Entry Time:</strong> {new Date(receiptData.entryTime).toLocaleString()}</div>
              <div><strong>Exit Time:</strong> {new Date(receiptData.exitTime).toLocaleString()}</div>
              <div><strong>Payment Method:</strong> {receiptData.paymentMethod}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginTop: '1rem', color: 'var(--primary)' }}>
                Amount Paid: ₹{receiptData.amount}
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={closeReceipt}>
              Done
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default VehicleExitPage;

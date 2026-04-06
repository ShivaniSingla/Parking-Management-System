import React from 'react';
import { ParkingRecord } from '../types';
import '../styles/ReceiptCard.css';

interface ReceiptCardProps {
  record: ParkingRecord;
  onClose: () => void;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({ record, onClose }) => {
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="receipt-card">
      <div className="receipt-header">
        <h2>ParkMaster</h2>
        <p>Parking Receipt</p>
      </div>

      <div className="receipt-details">
        <div className="receipt-row">
          <span className="label">Receipt No:</span>
          <span className="value">{record.recordId}</span>
        </div>
        <div className="receipt-row">
          <span className="label">Vehicle No:</span>
          <span className="value">{record.vehicleNumber} ({record.vehicleType})</span>
        </div>
        <div className="receipt-row">
          <span className="label">Slot No:</span>
          <span className="value">{record.slotId}</span>
        </div>
        <div className="receipt-row">
          <span className="label">Entry Time:</span>
          <span className="value">{formatDate(record.entryTime)}</span>
        </div>
        <div className="receipt-row">
          <span className="label">Exit Time:</span>
          <span className="value">{formatDate(record.exitTime)}</span>
        </div>
        <div className="receipt-row">
          <span className="label">Duration:</span>
          <span className="value">{record.durationMinutes} mins</span>
        </div>
        <div className="receipt-row">
          <span className="label">Payment Method:</span>
          <span className="value">{record.paymentMethod}</span>
        </div>

        <div className="receipt-row receipt-total">
          <span className="label">Amount Paid:</span>
          <span className="value" style={{ color: 'var(--success)' }}>₹{record.feeAmount}</span>
        </div>
      </div>

      <div className="receipt-footer">
        <p>Thank you for using ParkMaster!</p>
        <p>Have a safe journey.</p>
      </div>

      <button className="btn btn-primary print-btn" onClick={onClose}>
        Done
      </button>
    </div>
  );
};

export default ReceiptCard;

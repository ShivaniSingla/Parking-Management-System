import React from 'react';
import '../styles/ReceiptCard.css';

interface ReceiptProps {
  record: {
    vehicleNo: string;
    vehicleType: string;
    entryTime: string;
    exitTime?: string;
    amount?: number;
    ticketID?: string;
    paymentMethod?: string;
  };
  onClose: () => void;
}

const ReceiptCard: React.FC<ReceiptProps> = ({ record, onClose }) => {
  return (
    <div className="receipt-card">
      <h2 className="receipt-title">🧾 Parking Receipt</h2>
      <div className="receipt-details">
        {record.ticketID && <div className="receipt-row"><span>Ticket ID</span><span>{record.ticketID}</span></div>}
        <div className="receipt-row"><span>Vehicle No</span><span>{record.vehicleNo}</span></div>
        <div className="receipt-row"><span>Vehicle Type</span><span>{record.vehicleType}</span></div>
        <div className="receipt-row"><span>Entry Time</span><span>{new Date(record.entryTime).toLocaleString()}</span></div>
        {record.exitTime && <div className="receipt-row"><span>Exit Time</span><span>{new Date(record.exitTime).toLocaleString()}</span></div>}
        {record.paymentMethod && <div className="receipt-row"><span>Payment</span><span>{record.paymentMethod}</span></div>}
        <div className="receipt-total">
          <span>Total Amount</span>
          <span>₹{record.amount || 0}</span>
        </div>
      </div>
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>Done</button>
    </div>
  );
};

export default ReceiptCard;

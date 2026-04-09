import React from 'react';
import '../styles/SlotCard.css';

interface SlotCardProps {
  slot: {
    vehicleNo: string;
    vehicleType: string;
    entryTime: string;
  };
}

const SlotCard: React.FC<SlotCardProps> = ({ slot }) => {
  return (
    <div className="slot-card occupied">
      <div className="slot-id">{slot.vehicleNo}</div>
      <div className="slot-type">{slot.vehicleType}</div>
      <div className="slot-status">{new Date(slot.entryTime).toLocaleTimeString()}</div>
    </div>
  );
};

export default SlotCard;

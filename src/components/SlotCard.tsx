import React from 'react';
import { ParkingSlot } from '../types';
import { FaCar, FaMotorcycle, FaChargingStation, FaWheelchair } from 'react-icons/fa';
import '../styles/SlotCard.css';

interface SlotCardProps {
  slot: ParkingSlot;
}

const SlotCard: React.FC<SlotCardProps> = ({ slot }) => {
  const getIcon = () => {
    switch (slot.slotType) {
      case 'Car': return <FaCar />;
      case 'Bike': return <FaMotorcycle />;
      case 'EV': return <FaChargingStation />;
      case 'Handicap': return <FaWheelchair />;
      default: return <FaCar />;
    }
  };

  const getStatusClass = (status: string) => {
    return `status-${status}`;
  };

  return (
    <div className={`slot-card type-${slot.slotType}`}>
      <div className="slot-header">
        <span className="slot-number">{slot.slotNumber}</span>
        <span className="slot-icon" style={{ opacity: slot.status === 'available' ? 0.3 : 1 }}>
          {getIcon()}
        </span>
      </div>
      <div className="slot-type">{slot.slotType}</div>
      <div className={`slot-status ${getStatusClass(slot.status)}`}>
        {slot.status}
      </div>
    </div>
  );
};

export default SlotCard;

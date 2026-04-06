import React from 'react';
import '../styles/SummaryCard.css';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color = 'var(--primary)' }) => {
  return (
    <div className="summary-card" style={{ borderLeftColor: color }}>
      <div className="summary-icon" style={{ color }}>
        {icon}
      </div>
      <div className="summary-content">
        <h3 className="summary-title">{title}</h3>
        <p className="summary-value">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;

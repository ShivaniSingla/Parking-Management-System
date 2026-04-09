import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaCar, FaCheckCircle, FaExclamationCircle, FaRupeeSign, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import SummaryCard from '../components/SummaryCard';
import '../styles/DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { slots, records, currentUser } = useApp();
  const navigate = useNavigate();

  const totalSlots = slots.length;
  const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
  const availableSlots = slots.filter(s => s.status === 'available').length;

  const todayRevenue = records
    .filter(r => r.paymentStatus === 'completed' && new Date(r.exitTime || '').toDateString() === new Date().toDateString())
    .reduce((sum, r) => sum + (r.feeAmount || 0), 0);

  const barChartData = React.useMemo(() => {
    const todayStr = new Date().toDateString();
    const todaysRecords = records.filter(
      r => new Date(r.entryTime).toDateString() === todayStr
    );

    const timeBuckets = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    
    return timeBuckets.map(time => {
      const hourVal = parseInt(time.split(':')[0], 10);
      const count = todaysRecords.filter(r => {
        const h = new Date(r.entryTime).getHours();
        // Fall into the bucket if it's within [hourVal, hourVal + 2)
        return h >= hourVal && h < hourVal + 2;
      }).length;
      return { time, count };
    });
  }, [records]);

  const recentRecords = [...records].slice(0, 5);

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>

      <div className="dashboard-grid">
        <SummaryCard title="Total Slots" value={totalSlots} icon={<FaCar />} color="#3b82f6" />
        <SummaryCard title="Available Slots" value={availableSlots} icon={<FaCheckCircle />} color="var(--success)" />
        <SummaryCard title="Occupied Slots" value={occupiedSlots} icon={<FaExclamationCircle />} color="var(--danger)" />
        <SummaryCard title="Today's Revenue" value={`₹${todayRevenue}`} icon={<FaRupeeSign />} color="var(--warning)" />
      </div>

      {currentUser?.role !== 'admin' && (
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={() => navigate('/entry')}>
            <FaSignInAlt style={{ marginRight: '0.5rem' }} /> New Entry
          </button>
          <button className="btn btn-danger" onClick={() => navigate('/exit')}>
            <FaSignOutAlt style={{ marginRight: '0.5rem' }} /> Process Exit
          </button>
        </div>
      )}

      <div className="dashboard-content">
        <div className="chart-card">
          <h2 className="chart-title">Hourly Vehicle Count</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="recent-activity">
          <h2 className="chart-title">Recent Activity</h2>
          <div className="activity-list">
            {recentRecords.map(rec => (
              <div key={rec.recordId} className="activity-item">
                <div>
                  <div className="vehicle-num">{rec.vehicleNumber}</div>
                  <div className="time">Slot {rec.slotId}</div>
                </div>
                <div>
                  {rec.paymentStatus === 'completed' ? (
                    <span style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>EXITED</span>
                  ) : (
                    <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>ENTERED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

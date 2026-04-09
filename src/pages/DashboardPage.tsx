import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaCar, FaCheckCircle, FaExclamationCircle, FaRupeeSign, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import SummaryCard from '../components/SummaryCard';
import '../styles/DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { parking, tickets, vehicles, currentUser } = useApp();
  const navigate = useNavigate();

  const occupiedSlots = parking.totalSlots - parking.avaSlots;

  const todayRevenue = tickets
    .filter(t => t.exitTime && new Date(t.exitTime).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const barChartData = React.useMemo(() => {
    const todayStr = new Date().toDateString();
    const todaysVehicles = vehicles.filter(
      v => new Date(v.entryTime).toDateString() === todayStr
    );

    const timeBuckets = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

    return timeBuckets.map(time => {
      const hourVal = parseInt(time.split(':')[0], 10);
      const count = todaysVehicles.filter(v => {
        const h = new Date(v.entryTime).getHours();
        return h >= hourVal && h < hourVal + 2;
      }).length;
      return { time, count };
    });
  }, [vehicles]);

  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>

      <div className="dashboard-grid">
        <SummaryCard title="Total Slots" value={parking.totalSlots} icon={<FaCar />} color="#3b82f6" />
        <SummaryCard title="Available Slots" value={parking.avaSlots} icon={<FaCheckCircle />} color="var(--success)" />
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
            {recentTickets.map(t => (
              <div key={t.ticketID} className="activity-item">
                <div>
                  <div className="vehicle-num">{t.vehicleNo}</div>
                  <div className="time">Ticket {t.ticketID}</div>
                </div>
                <div>
                  {t.exitTime ? (
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

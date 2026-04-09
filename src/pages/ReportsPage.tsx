import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Admin from '../models/Admin';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaDownload } from 'react-icons/fa';
import '../styles/ReportsPage.css';



const ReportsPage: React.FC = () => {
  const { currentUser } = useApp();
  const [tickets, setTickets] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  useEffect(() => {
    const fetchReport = async () => {
      const admin = new Admin(currentUser?.user_email_id || '');
      const report = await admin.viewReport();
      setTickets(report.tickets);
      setPayments(report.payments);
    };
    fetchReport();
  }, [currentUser]);

  const revenueData = React.useMemo(() => {
    const completedTickets = tickets.filter(t => t.exitTime && t.amount > 0);
    const data = [];

    if (timeframe === 'Daily') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const revenue = completedTickets
          .filter(t => new Date(t.exitTime).toDateString() === d.toDateString())
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        data.push({ name: dayName, revenue });
      }
    } else if (timeframe === 'Weekly') {
      for (let i = 3; i >= 0; i--) {
        const dEnd = new Date();
        dEnd.setDate(dEnd.getDate() - (i * 7));
        const dStart = new Date(dEnd);
        dStart.setDate(dStart.getDate() - 6);
        const startMillis = new Date(dStart).setHours(0, 0, 0, 0);
        const endMillis = new Date(dEnd).setHours(23, 59, 59, 999);
        const revenue = completedTickets
          .filter(t => {
            const rt = new Date(t.exitTime).getTime();
            return rt >= startMillis && rt <= endMillis;
          })
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        data.push({ name: `Week ${4 - i}`, revenue });
      }
    } else if (timeframe === 'Monthly') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
        const year = d.getFullYear();
        const month = d.getMonth();
        const revenue = completedTickets
          .filter(t => {
            const rd = new Date(t.exitTime);
            return rd.getFullYear() === year && rd.getMonth() === month;
          })
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        data.push({ name: monthName, revenue });
      }
    }
    return data;
  }, [tickets, timeframe]);

  const exportCSV = () => {
    const headers = ['Ticket ID', 'Vehicle No', 'Entry Time', 'Exit Time', 'Amount'];
    const rows = tickets.map(t => [
      t.ticketID,
      t.vehicleNo,
      new Date(t.entryTime).toLocaleString(),
      t.exitTime ? new Date(t.exitTime).toLocaleString() : 'N/A',
      t.amount || '0',
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "parking_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: '1.5rem' }}>Reports & Analytics</h1>

      <div style={{ marginBottom: '2rem' }}>
        {['Daily', 'Weekly', 'Monthly'].map(tf => (
          <button
            key={tf}
            className={`btn ${timeframe === tf ? 'btn-primary' : ''}`}
            style={{ marginRight: '1rem', border: timeframe !== tf ? '1px solid var(--border)' : 'none' }}
            onClick={() => setTimeframe(tf as any)}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="reports-charts">
        <div className="card">
          <h2 className="chart-title">Revenue Trend ({timeframe})</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="chart-title">Payment Summary</h2>
          <div style={{ padding: '1rem' }}>
            <p><strong>Total Tickets:</strong> {tickets.length}</p>
            <p><strong>Total Payments:</strong> {payments.length}</p>
            <p><strong>Total Revenue:</strong> ₹{payments.reduce((sum, p) => sum + (p.amount || 0), 0)}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-header-controls">
          <h2 className="chart-title" style={{ border: 'none', marginBottom: 0 }}>All Tickets</h2>
          <button className="btn btn-success" onClick={exportCSV}>
            <FaDownload style={{ marginRight: '0.5rem' }} /> Export CSV
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Vehicle No</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.ticketID}>
                  <td style={{ fontWeight: 600 }}>{t.ticketID}</td>
                  <td>{t.vehicleNo}</td>
                  <td>{new Date(t.entryTime).toLocaleString()}</td>
                  <td>{t.exitTime ? new Date(t.exitTime).toLocaleString() : '-'}</td>
                  <td>₹{t.amount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

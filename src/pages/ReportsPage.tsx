import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { FaDownload } from 'react-icons/fa';
import '../styles/ReportsPage.css';

const COLORS = ['#2563eb', '#16a34a', '#0ea5e9', '#d97706'];

const ReportsPage: React.FC = () => {
  const { records } = useApp();
  const [timeframe, setTimeframe] = useState<'Daily'|'Weekly'|'Monthly'>('Daily');

  const revenueData = React.useMemo(() => {
    const completedRecords = records.filter(r => r.paymentStatus === 'completed' && r.exitTime);
    const data = [];
    
    if (timeframe === 'Daily') {
      // Past 7 Days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const revenue = completedRecords
          .filter(r => new Date(r.exitTime!).toDateString() === d.toDateString())
          .reduce((sum, r) => sum + (r.feeAmount || 0), 0);
        data.push({ name: dayName, revenue });
      }
    } else if (timeframe === 'Weekly') {
      // Past 4 Weeks
      for (let i = 3; i >= 0; i--) {
        const dEnd = new Date();
        dEnd.setDate(dEnd.getDate() - (i * 7));
        const dStart = new Date(dEnd);
        dStart.setDate(dStart.getDate() - 6);
        
        const startMillis = new Date(dStart).setHours(0,0,0,0);
        const endMillis = new Date(dEnd).setHours(23,59,59,999);
        
        const revenue = completedRecords
          .filter(r => {
            const rt = new Date(r.exitTime!).getTime();
            return rt >= startMillis && rt <= endMillis;
          })
          .reduce((sum, r) => sum + (r.feeAmount || 0), 0);
          
        const label = `Week ${4-i}`;
        data.push({ name: label, revenue });
      }
    } else if (timeframe === 'Monthly') {
      // Past 6 Months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
        const year = d.getFullYear();
        const month = d.getMonth();
        
        const revenue = completedRecords
          .filter(r => {
            const rd = new Date(r.exitTime!);
            return rd.getFullYear() === year && rd.getMonth() === month;
          })
          .reduce((sum, r) => sum + (r.feeAmount || 0), 0);
          
        data.push({ name: monthName, revenue });
      }
    }
    return data;
  }, [records, timeframe]);

  const vehicleTypeDistribution = [
    { name: 'Car', value: records.filter(r => r.vehicleType === 'Car').length || 40 },
    { name: 'Bike', value: records.filter(r => r.vehicleType === 'Bike').length || 25 },
    { name: 'EV', value: records.filter(r => r.vehicleType === 'EV').length || 15 },
    { name: 'Handicap', value: records.filter(r => r.vehicleType === 'Handicap').length || 5 },
  ];

  const exportCSV = () => {
    const headers = ['Record ID', 'Vehicle No', 'Type', 'Entry Time', 'Exit Time', 'Duration (mins)', 'Fee (INR)', 'Payment Method'];
    const rows = records.map(r => [
      r.recordId,
      r.vehicleNumber,
      r.vehicleType,
      new Date(r.entryTime).toLocaleString(),
      r.exitTime ? new Date(r.exitTime).toLocaleString() : 'N/A',
      r.durationMinutes || '-',
      r.feeAmount || '0',
      r.paymentMethod || '-'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\\n" 
      + rows.map(e => e.join(",")).join("\\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "parking_records.csv");
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
          <h2 className="chart-title">Vehicle Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vehicleTypeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {vehicleTypeDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="table-header-controls">
          <h2 className="chart-title" style={{ border: 'none', marginBottom: 0 }}>All Parking Records</h2>
          <button className="btn btn-success" onClick={exportCSV}>
            <FaDownload style={{ marginRight: '0.5rem' }} /> Export CSV
          </button>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle No</th>
                <th>Type</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Duration</th>
                <th>Fee</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.recordId}>
                  <td style={{ fontWeight: 600 }}>{record.vehicleNumber}</td>
                  <td>{record.vehicleType}</td>
                  <td>{new Date(record.entryTime).toLocaleString()}</td>
                  <td>{record.exitTime ? new Date(record.exitTime).toLocaleString() : '-'}</td>
                  <td>{record.durationMinutes ? `${record.durationMinutes}m` : '-'}</td>
                  <td>₹{record.feeAmount || 0}</td>
                  <td>{record.paymentMethod || '-'}</td>
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

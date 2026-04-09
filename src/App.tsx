import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Layout Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import RoleSelectionPage from './pages/RoleSelectionPage';
import AdminLoginPage from './pages/AdminLoginPage';
import StaffLoginPage from './pages/StaffLoginPage';
import DashboardPage from './pages/DashboardPage';
import VehicleEntryPage from './pages/VehicleEntryPage';
import VehicleExitPage from './pages/VehicleExitPage';
import SlotMonitoringPage from './pages/SlotMonitoringPage';
import ReportsPage from './pages/ReportsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

// Layout Wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthLoading } = useApp();

  if (isAuthLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: 600, color: 'var(--text-secondary)' }}>Loading authentication...</div>;
  }

  // If not logged in, just render children (like LoginPage)
  if (!currentUser) return <>{children}</>;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RoleSelectionPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/staff-login" element={<StaffLoginPage />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/entry" element={
        <ProtectedRoute>
          <VehicleEntryPage />
        </ProtectedRoute>
      } />
      
      <Route path="/exit" element={
        <ProtectedRoute>
          <VehicleExitPage />
        </ProtectedRoute>
      } />
      
      <Route path="/slots" element={
        <ProtectedRoute>
          <SlotMonitoringPage />
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute adminOnly>
          <ReportsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute adminOnly>
          <AdminSettingsPage />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </Router>
    </AppProvider>
  );
}

export default App;

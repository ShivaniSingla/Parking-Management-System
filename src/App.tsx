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

// Layout Wrapper — ONLY wraps authenticated pages, NEVER blocks login pages
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const { currentUser, isAuthLoading } = useApp();

  return (
    <Routes>
      {/* Public routes — always accessible, never blocked */}
      <Route path="/" element={<RoleSelectionPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/staff-login" element={<StaffLoginPage />} />

      {/* Protected routes — check auth here, not in parent wrapper */}
      <Route path="/dashboard" element={
        <ProtectedRoute isAuthLoading={isAuthLoading} currentUser={currentUser}>
          <AuthenticatedLayout>
            <DashboardPage />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/entry" element={
        <ProtectedRoute isAuthLoading={isAuthLoading} currentUser={currentUser}>
          <AuthenticatedLayout>
            <VehicleEntryPage />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/exit" element={
        <ProtectedRoute isAuthLoading={isAuthLoading} currentUser={currentUser}>
          <AuthenticatedLayout>
            <VehicleExitPage />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/slots" element={
        <ProtectedRoute isAuthLoading={isAuthLoading} currentUser={currentUser}>
          <AuthenticatedLayout>
            <SlotMonitoringPage />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute isAuthLoading={isAuthLoading} currentUser={currentUser} adminOnly>
          <AuthenticatedLayout>
            <ReportsPage />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute isAuthLoading={isAuthLoading} currentUser={currentUser} adminOnly>
          <AuthenticatedLayout>
            <AdminSettingsPage />
          </AuthenticatedLayout>
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
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;

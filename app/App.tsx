import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Lazy loaded components
const LandingPage = lazy(() => import('./pages/common/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const ClientRidesPage = lazy(() => import('./pages/client/ClientRidesPage'));
const RequestRidePage = lazy(() => import('./pages/client/RequestRidePage'));
const ClientProfilePage = lazy(() => import('./pages/client/ClientProfilePage'));
const RiderDashboard = lazy(() => import('./pages/rider/RiderDashboard'));
const RiderRequestsPage = lazy(() => import('./pages/rider/RiderRequestsPage'));
const RiderEarningsPage = lazy(() => import('./pages/rider/RiderEarningsPage'));
const RiderHistoryPage = lazy(() => import('./pages/rider/RiderHistoryPage'));
const RiderVehiclePage = lazy(() => import('./pages/rider/RiderVehiclePage'));
const RiderProfilePage = lazy(() => import('./pages/rider/RiderProfilePage'));
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'));
const OwnerFleetPage = lazy(() => import('./pages/owner/OwnerFleetPage'));
const OwnerRidersPage = lazy(() => import('./pages/owner/OwnerRidersPage'));
const OwnerTrackRidersPage = lazy(() => import('./pages/owner/OwnerTrackRidersPage'));
const OwnerIncomePage = lazy(() => import('./pages/owner/OwnerIncomePage'));
const OwnerReportsPage = lazy(() => import('./pages/owner/OwnerReportsPage'));
const OwnerProfilePage = lazy(() => import('./pages/owner/OwnerProfilePage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
import './App.css';
import './i18n/config';

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="w-16 h-16 border-4 border-primary-light/20 border-t-primary-light rounded-full animate-spin mb-4"></div>
    <h2 className="text-xl font-black text-slate-900 dark:text-white animate-pulse">BodaKitaa</h2>
    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Loading...</p>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Dashboards */}
              <Route path="/dashboard/client" element={<ClientDashboard />} />
              <Route path="/dashboard/client/rides" element={<ClientRidesPage />} />
              <Route path="/dashboard/client/request" element={<RequestRidePage />} />
              <Route path="/dashboard/client/profile" element={<ClientProfilePage />} />
              <Route path="/dashboard/rider" element={<RiderDashboard />} />
              <Route path="/dashboard/rider/requests" element={<RiderRequestsPage />} />
              <Route path="/dashboard/rider/earnings" element={<RiderEarningsPage />} />
              <Route path="/dashboard/rider/history" element={<RiderHistoryPage />} />
              <Route path="/dashboard/rider/vehicle" element={<RiderVehiclePage />} />
              <Route path="/dashboard/rider/profile" element={<RiderProfilePage />} />
              <Route path="/dashboard/owner" element={<OwnerDashboard />} />
              <Route path="/dashboard/owner/fleet" element={<OwnerFleetPage />} />
              <Route path="/dashboard/owner/riders" element={<OwnerRidersPage />} />
              <Route path="/dashboard/owner/track_riders" element={<OwnerTrackRidersPage />} />
              <Route path="/dashboard/owner/income" element={<OwnerIncomePage />} />
              <Route path="/dashboard/owner/reports" element={<OwnerReportsPage />} />
              <Route path="/dashboard/owner/profile" element={<OwnerProfilePage />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

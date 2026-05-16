import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Bike } from 'lucide-react';
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
const EmployedRiderBossPage = lazy(() => import('./pages/rider/EmployedRiderBossPage'));
import './App.css';
import './i18n/config';

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden">
    <div className="relative w-48 h-24 mb-6 flex items-center justify-center">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-primary-light/10 blur-2xl rounded-full animate-pulse" />
      
      {/* Bouncing Bike */}
      <div className="relative z-10 text-primary-light animate-[bounce_0.6s_ease-in-out_infinite_alternate] drop-shadow-[0_10px_15px_rgba(254,119,67,0.4)]">
        <Bike size={48} strokeWidth={1.5} />
      </div>
      
      {/* Moving Road Lines underneath */}
      <div className="absolute bottom-4 left-0 w-full overflow-hidden">
        <div className="w-[200%] flex h-1 animate-[dash_1s_linear_infinite]">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-8 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-2" />
          ))}
        </div>
      </div>
    </div>
    
    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight animate-pulse">BodaKitaa</h2>
    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-3">Finding your ride...</p>
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
              {/* Employed Rider exclusive routes (reuse same dashboard pages) */}
              <Route path="/dashboard/employed_rider" element={<RiderDashboard />} />
              <Route path="/dashboard/employed_rider/requests" element={<RiderRequestsPage />} />
              <Route path="/dashboard/employed_rider/earnings" element={<RiderEarningsPage />} />
              <Route path="/dashboard/employed_rider/history" element={<RiderHistoryPage />} />
              <Route path="/dashboard/employed_rider/vehicle" element={<RiderVehiclePage />} />
              <Route path="/dashboard/employed_rider/profile" element={<RiderProfilePage />} />
              <Route path="/dashboard/employed_rider/boss" element={<EmployedRiderBossPage />} />
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

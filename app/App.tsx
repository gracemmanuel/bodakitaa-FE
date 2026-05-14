import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/common/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientRidesPage from './pages/client/ClientRidesPage';
import RequestRidePage from './pages/client/RequestRidePage';
import ClientProfilePage from './pages/client/ClientProfilePage';
import RiderDashboard from './pages/rider/RiderDashboard';
import RiderRequestsPage from './pages/rider/RiderRequestsPage';
import RiderEarningsPage from './pages/rider/RiderEarningsPage';
import RiderHistoryPage from './pages/rider/RiderHistoryPage';
import RiderVehiclePage from './pages/rider/RiderVehiclePage';
import RiderProfilePage from './pages/rider/RiderProfilePage';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerFleetPage from './pages/owner/OwnerFleetPage';
import OwnerRidersPage from './pages/owner/OwnerRidersPage';
import OwnerTrackRidersPage from './pages/owner/OwnerTrackRidersPage';
import OwnerIncomePage from './pages/owner/OwnerIncomePage';
import OwnerReportsPage from './pages/owner/OwnerReportsPage';
import OwnerProfilePage from './pages/owner/OwnerProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css';
import './i18n/config';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
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
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

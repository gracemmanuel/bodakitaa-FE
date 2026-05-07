import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientDashboard from './pages/ClientDashboard';
import ClientRidesPage from './pages/ClientRidesPage';
import RequestRidePage from './pages/RequestRidePage';
import RiderDashboard from './pages/RiderDashboard';
import RiderRequestsPage from './pages/RiderRequestsPage';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerFleetPage from './pages/OwnerFleetPage';
import OwnerRidersPage from './pages/OwnerRidersPage';
import AdminDashboard from './pages/AdminDashboard';
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
            <Route path="/dashboard/rider" element={<RiderDashboard />} />
            <Route path="/dashboard/rider/requests" element={<RiderRequestsPage />} />
            <Route path="/dashboard/owner" element={<OwnerDashboard />} />
            <Route path="/dashboard/owner/fleet" element={<OwnerFleetPage />} />
            <Route path="/dashboard/owner/riders" element={<OwnerRidersPage />} />
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

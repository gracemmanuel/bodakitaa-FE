import React from 'react';
import {
  Shield, Users, Map, AlertTriangle, Download,
  Activity, CheckCircle, XCircle, Search, MoreVertical,
  TrendingUp, TrendingDown, Server, Database, Globe, Clock
} from 'lucide-react';
import CombinedNav from '../components/CombinedNav';
import { getTimeBasedGreeting } from '../utils/greeting';

// --- Types ---
interface VerificationRequest {
  id: string;
  name: string;
  type: 'Rider' | 'Owner';
  submittedAt: string;
  documents: { type: string; status: 'Verified' | 'Pending' | 'Rejected' }[];
  status: 'Pending' | 'In Review';
  riskScore: 'Low' | 'Medium' | 'High';
}

interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  module: string;
}

// --- Dummy Data ---
const mockVerifications: VerificationRequest[] = [
  { id: 'VR-1042', name: 'David Mchuma', type: 'Rider', submittedAt: '2 hours ago', status: 'Pending', riskScore: 'Low', documents: [{ type: 'National ID', status: 'Verified' }, { type: 'Driving License', status: 'Pending' }] },
  { id: 'VR-1043', name: 'Kitalu Logistics Ltd', type: 'Owner', submittedAt: '5 hours ago', status: 'In Review', riskScore: 'Medium', documents: [{ type: 'Business Registration', status: 'Pending' }, { type: 'TIN Certificate', status: 'Pending' }] },
  { id: 'VR-1044', name: 'Bakari S.', type: 'Rider', submittedAt: '1 day ago', status: 'Pending', riskScore: 'High', documents: [{ type: 'National ID', status: 'Rejected' }, { type: 'Driving License', status: 'Pending' }] },
  { id: 'VR-1045', name: 'Amani Tours', type: 'Owner', submittedAt: '1 day ago', status: 'Pending', riskScore: 'Low', documents: [{ type: 'Business Registration', status: 'Verified' }, { type: 'TIN Certificate', status: 'Verified' }] },
];

const mockAlerts: SystemAlert[] = [
  { id: 'AL-001', level: 'critical', message: 'Payment gateway timeout (M-Pesa API)', timestamp: '10 mins ago', module: 'Payments' },
  { id: 'AL-002', level: 'warning', message: 'High surge multiplier (>2.5x) in Posta Area', timestamp: '25 mins ago', module: 'Pricing Engine' },
  { id: 'AL-003', level: 'info', message: 'Daily database backup completed successfully', timestamp: '2 hours ago', module: 'Infrastructure' },
  { id: 'AL-004', level: 'critical', message: 'SOS Alert triggered by Rider #882 in Kinondoni', timestamp: '3 hours ago', module: 'Safety' },
  { id: 'AL-005', level: 'warning', message: 'Unusual login pattern detected from IP 192.168.x.x', timestamp: '5 hours ago', module: 'Security' },
];

// --- Sub-Components ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string; trend?: { value: number; isUp: boolean; label: string } }> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:shadow-xl transition-all">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 ${color.replace('text-', 'bg-')} blur-2xl group-hover:blur-xl transition-all`} />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('500', '500/20')} ${color}`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
    </div>
    <div className="relative z-10">
      <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{value}</h4>
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>

      {trend && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${trend.isUp ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
            {trend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}%
          </span>
          <span className="text-xs text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  </div>
);

const VerificationQueue: React.FC = () => (
  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col h-full">
    <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-transparent flex justify-between items-center">
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Verification Queue</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Review pending KYC documents</p>
      </div>
      <button className="text-sm font-bold text-primary-light hover:underline">View All (14)</button>
    </div>

    <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-4">
      {mockVerifications.map((req) => (
        <div key={req.id} className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 hover:border-primary-light/50 transition-colors bg-white dark:bg-black/20">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-700 dark:text-slate-300">
                {req.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{req.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{req.type}</span>
                  <span className="text-xs text-slate-400">{req.submittedAt}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${req.riskScore === 'Low' ? 'bg-green-500/10 text-green-500' :
                  req.riskScore === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-red-500/10 text-red-500'
                }`}>
                Risk: {req.riskScore}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{req.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {req.documents.map((doc, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-100 dark:border-white/5">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{doc.type}</span>
                {doc.status === 'Verified' && <CheckCircle size={14} className="text-green-500" />}
                {doc.status === 'Pending' && <Clock size={14} className="text-amber-500" />}
                {doc.status === 'Rejected' && <XCircle size={14} className="text-red-500" />}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <button className="flex-1 py-2 bg-primary-light text-white rounded-xl text-sm font-bold shadow-md shadow-primary-light/20 hover:bg-primary-dark transition-colors">Review</button>
            <button className="w-10 flex items-center justify-center border border-slate-200 dark:border-white/20 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
              <MoreVertical size={16} className="text-slate-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SystemStatus: React.FC = () => (
  <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl relative">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none" />

    <div className="p-6 border-b border-slate-800 flex justify-between items-center relative z-10">
      <div>
        <h3 className="text-xl font-black flex items-center gap-2">
          <Activity className="text-green-400" /> System Status
        </h3>
      </div>
      <div className="flex gap-2">
        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded uppercase tracking-wider">All Systems Operational</span>
      </div>
    </div>

    <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800 relative z-10">
      <div className="p-4 text-center">
        <Server size={20} className="mx-auto text-slate-400 mb-2" />
        <p className="text-2xl font-black">99.9%</p>
        <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">API Uptime</p>
      </div>
      <div className="p-4 text-center">
        <Database size={20} className="mx-auto text-slate-400 mb-2" />
        <p className="text-2xl font-black">34ms</p>
        <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">DB Latency</p>
      </div>
      <div className="p-4 text-center">
        <Globe size={20} className="mx-auto text-slate-400 mb-2" />
        <p className="text-2xl font-black">1.2k</p>
        <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Active WS</p>
      </div>
    </div>

    <div className="p-6 flex-1 relative z-10">
      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Alerts</h4>
      <div className="space-y-3">
        {mockAlerts.map((alert) => (
          <div key={alert.id} className={`p-3 rounded-xl border flex items-start gap-3 ${alert.level === 'critical' ? 'bg-red-500/10 border-red-500/20' :
              alert.level === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                'bg-blue-500/10 border-blue-500/20'
            }`}>
            <div className={`mt-1 ${alert.level === 'critical' ? 'text-red-500' :
                alert.level === 'warning' ? 'text-amber-500' :
                  'text-blue-500'
              }`}>
              {alert.level === 'critical' ? <AlertTriangle size={16} /> : alert.level === 'warning' ? <AlertTriangle size={16} /> : <Activity size={16} />}
            </div>
            <div>
              <p className="text-sm font-medium leading-snug text-slate-200">{alert.message}</p>
              <div className="flex gap-2 mt-1.5">
                <span className="text-[10px] font-mono text-slate-500">{alert.module}</span>
                <span className="text-[10px] text-slate-500">•</span>
                <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
  }, []);

  return (
    <CombinedNav role="admin">
      <div className="max-w-[1600px] mx-auto space-y-8 w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {getTimeBasedGreeting()}, <span className="text-primary-light">{user?.fullName || user?.full_name || 'Admin'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Platform-wide overview, moderation, and system health monitoring.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Global search..." className="pl-9 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary-light w-full lg:w-64 transition-colors font-medium shadow-sm" />
            </div>
            <button className="premium-btn bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl flex items-center gap-2 px-6">
              <Download size={18} /> Export Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Platform Users" value="12,450" icon={Users} color="text-blue-500" trend={{ value: 5.2, isUp: true, label: 'vs last month' }} />
          <StatCard title="Platform Revenue (MTD)" value="TZS 45M" icon={Shield} color="text-green-500" trend={{ value: 12.5, isUp: true, label: 'vs last month' }} />
          <StatCard title="Active Rides Now" value="342" icon={Map} color="text-primary-light" trend={{ value: 2.1, isUp: false, label: 'vs yesterday peak' }} />
          <StatCard title="Pending Verifications" value="14" icon={AlertTriangle} color="text-amber-500" trend={{ value: 8, isUp: false, label: 'waiting in queue' }} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Heatmap Placeholder */}
          <div className="xl:col-span-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[400px] md:h-[600px] relative">
            <div className="absolute top-6 left-6 z-10 glass px-4 py-2 rounded-xl border border-white/20 shadow-lg">
              <h3 className="font-black text-slate-900 dark:text-white">Live Demand Heatmap</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300">Dar es Salaam Region</p>
            </div>
            <div className="absolute top-6 right-6 z-10 flex gap-2">
              <button className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg text-xs font-bold shadow-md border border-slate-200 dark:border-white/10">Surge Pricing</button>
              <button className="px-3 py-1.5 bg-primary-light text-white rounded-lg text-xs font-bold shadow-md">Demand</button>
            </div>

            {/* Map Background Mock */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-30 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

              {/* Heatmap Blobs */}
              <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-red-500/40 rounded-full blur-[60px] animate-pulse" />
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-amber-500/40 rounded-full blur-[50px] animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary-light/40 rounded-full blur-[70px] animate-pulse" style={{ animationDelay: '0.5s' }} />

              <Map size={100} className="text-slate-300 dark:text-slate-700 opacity-50" />
              <p className="absolute text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase mt-32">Interactive Map Interface</p>
            </div>
          </div>

          <div className="xl:col-span-1 space-y-8 flex flex-col h-auto xl:h-[600px]">
            <div className="flex-1 min-h-[400px] xl:min-h-0">
              <VerificationQueue />
            </div>
            <div className="h-[250px]">
              <SystemStatus />
            </div>
          </div>
        </div>
      </div>
    </CombinedNav>
  );
};

export default AdminDashboard;

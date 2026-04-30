import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wallet, Navigation, Clock, Star, Activity, MapPin,
  ChevronRight, Calendar, TrendingUp, AlertTriangle,
  CheckCircle2, Flame, Target, Battery, SignalHigh
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

// --- Types ---
interface EarningData {
  day: string;
  amount: number;
  trips: number;
  onlineHours: number;
}

interface IncomingRequest {
  id: string;
  pickup: string;
  destination: string;
  estDistance: string;
  estTime: string;
  estFare: number;
  clientRating: number;
  timeRemaining: number; // seconds to accept
}

// --- Dummy Data ---
const mockWeeklyEarnings: EarningData[] = [
  { day: 'Mon', amount: 35000, trips: 12, onlineHours: 6.5 },
  { day: 'Tue', amount: 42000, trips: 15, onlineHours: 8.0 },
  { day: 'Wed', amount: 28000, trips: 10, onlineHours: 5.5 },
  { day: 'Thu', amount: 55000, trips: 18, onlineHours: 9.5 },
  { day: 'Fri', amount: 65000, trips: 22, onlineHours: 10.0 },
  { day: 'Sat', amount: 75000, trips: 25, onlineHours: 11.0 },
  { day: 'Sun', amount: 45000, trips: 14, onlineHours: 7.0 },
];

const mockIncoming: IncomingRequest = {
  id: 'REQ-8892',
  pickup: 'Makumbusho Village',
  destination: 'Masaki, Slipway',
  estDistance: '6.5 km',
  estTime: '18 mins',
  estFare: 4500,
  clientRating: 4.8,
  timeRemaining: 15,
};

// --- Sub-Components ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string; subtitle?: string; trend?: { value: number; isUp: boolean } }> = ({ title, value, icon: Icon, color, subtitle, trend }) => (
  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
    <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150 ${color.replace('text-', 'bg-')}`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('500', '500/20')} ${color}`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend.isUp ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
          {trend.isUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="transform rotate-180" />}
          {trend.value}%
        </div>
      )}
    </div>
    <div>
      <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{value}</h4>
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{subtitle}</p>}
    </div>
  </div>
);

const DriverStatusToggle: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
      <div className={`absolute inset-0 opacity-10 transition-colors duration-500 ${isOnline ? 'bg-green-500' : 'bg-slate-500'}`} />

      <div className="relative z-10 space-y-6">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-colors duration-500 ${isOnline ? 'bg-green-500/20 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
          <Activity size={40} />
        </div>

        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            {isOnline ? "You're Online" : "You're Offline"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isOnline ? "Finding nearby ride requests..." : "Go online to start receiving ride requests."}
          </p>
        </div>

        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full py-4 rounded-xl font-black text-white text-lg transition-all duration-300 shadow-xl ${isOnline
            ? 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 shadow-slate-900/20'
            : 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
            }`}
        >
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>

        {isOnline && (
          <div className="flex justify-center gap-6 pt-4 border-t border-slate-200 dark:border-white/10 w-full">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <SignalHigh size={14} className="text-green-500" /> Strong GPS
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Battery size={14} className="text-green-500" /> 84%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const IncomingRequestOverlay: React.FC = () => (
  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 rounded-3xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
    <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-primary-light rounded-[2rem] shadow-[0_0_50px_rgba(254,119,67,0.3)] overflow-hidden">
      {/* Timer Bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800">
        <div className="h-full bg-primary-light animate-[shrink_15s_linear_forwards]" />
      </div>

      <div className="p-8 text-center border-b border-slate-100 dark:border-white/5">
        <div className="w-20 h-20 bg-primary-light/10 text-primary-light rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <MapPin size={40} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">New Request</h3>
        <p className="text-primary-light font-bold text-lg mt-1">TZS {mockIncoming.estFare.toLocaleString()}</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
          <div className="flex gap-4 relative z-10">
            <div className="w-6 h-6 rounded-full bg-slate-800 border-4 border-white dark:border-slate-900 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Pickup (1.2 km away)</p>
              <p className="font-bold text-slate-900 dark:text-white">{mockIncoming.pickup}</p>
            </div>
          </div>
          <div className="flex gap-4 relative z-10">
            <div className="w-6 h-6 rounded-full bg-primary-light border-4 border-white dark:border-slate-900 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-primary-light uppercase">Dropoff</p>
              <p className="font-bold text-slate-900 dark:text-white">{mockIncoming.destination}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Est. Time</p>
            <p className="font-black text-slate-900 dark:text-white">{mockIncoming.estTime}</p>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Distance</p>
            <p className="font-black text-slate-900 dark:text-white">{mockIncoming.estDistance}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Client" alt="client" /></div>
            <div className="flex items-center gap-1 text-amber-500 text-sm font-bold"><Star size={14} className="fill-current" /> {mockIncoming.clientRating}</div>
          </div>
          <p className="text-red-500 font-bold animate-pulse">{mockIncoming.timeRemaining}s left</p>
        </div>

        <div className="flex gap-4 pt-4">
          <button className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Reject</button>
          <button className="flex-1 py-4 bg-primary-light text-white font-black rounded-xl shadow-lg shadow-primary-light/30 hover:scale-[1.02] transition-transform text-lg">Accept Ride</button>
        </div>
      </div>
    </div>
  </div>
);

const EarningsChart: React.FC = () => {
  const maxAmount = Math.max(...mockWeeklyEarnings.map(d => d.amount));

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Weekly Earnings</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your income for the past 7 days</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-green-500">TZS 345,000</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total this week</p>
        </div>
      </div>

      <div className="flex-1 flex items-end gap-2 sm:gap-4 mt-auto">
        {mockWeeklyEarnings.map((data, i) => {
          const heightPercent = (data.amount / maxAmount) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 relative group h-[250px]">
              {/* Actual Bar */}
              <div
                className="w-full max-w-[40px] bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg relative z-10 transition-all duration-500 group-hover:opacity-80 shadow-lg shadow-green-500/20"
                style={{ height: `${heightPercent}%` }}
              >
                {/* Tooltip */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl border border-white/10 text-center">
                  <p className="text-xs font-bold text-green-400">TZS {data.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">{data.trips} trips • {data.onlineHours}h</p>
                </div>
              </div>

              <span className={`text-xs font-bold mt-2 block w-full text-center ${i === mockWeeklyEarnings.length - 1 ? 'text-primary-light' : 'text-slate-400 dark:text-slate-500'}`}>
                {data.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Page Component ---
const RiderDashboard: React.FC = () => {
  const { t } = useTranslation();
  // Set to true to see the incoming request UI
  const [showIncoming, setShowIncoming] = useState(false);

  return (
    <DashboardLayout role="rider">
      <div className="max-w-7xl mx-auto space-y-8 w-full relative">
        {/* Toggle overlay for demo purposes */}
        <button
          onClick={() => setShowIncoming(!showIncoming)}
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl font-bold text-xs border border-white/20"
        >
          Toggle Request Demo
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Hello, <span className="text-primary-light">Juma Ali</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              You are assigned to <span className="font-bold">TVS HLX 150 (MC 123 ABC)</span> under fleet owner <b>Baraka M.</b>
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
            <Flame size={18} /> High demand in your area!
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Today's Earnings" value="TZS 45,200" icon={Wallet} color="text-green-500" trend={{ value: 12, isUp: true }} subtitle="Target: TZS 50,000" />
          <StatCard title="Trips Completed" value="14" icon={Navigation} color="text-blue-500" />
          <StatCard title="Online Time" value="6h 30m" icon={Clock} color="text-primary-light" />
          <StatCard title="Rating" value="4.9" icon={Star} color="text-amber-500" trend={{ value: 0.1, isUp: true }} subtitle="Based on 450 trips" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative">

          {showIncoming && <IncomingRequestOverlay />}

          <div className="xl:col-span-1">
            <DriverStatusToggle />

            <div className="mt-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
                <Target size={24} className="text-primary-light" />
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">Owner Target</h3>
                  <p className="text-xs text-slate-500">Daily remittance goal</p>
                </div>
              </div>

              <div className="flex justify-between items-end mb-2">
                <p className="text-2xl font-black text-slate-900 dark:text-white">TZS 25,000</p>
                <p className="text-sm font-bold text-slate-400">/ TZS 30,000</p>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2 shadow-inner">
                <div className="h-full bg-gradient-to-r from-primary-dark to-primary-light w-[83%] rounded-full relative">
                  <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-pulse" />
                </div>
              </div>
              <p className="text-xs font-bold text-primary-light text-right">83% completed</p>
            </div>
          </div>

          <div className="xl:col-span-2">
            <div className="h-[300px] md:h-[500px]">
              <EarningsChart />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RiderDashboard;

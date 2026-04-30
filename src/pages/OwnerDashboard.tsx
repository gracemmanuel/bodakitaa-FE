import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bike, Users, TrendingUp, DollarSign, Plus, Settings2,
  Search, Filter, MoreHorizontal, AlertTriangle, CheckCircle,
  Clock, Activity, MapPin, Wrench, FileText, Download, ChevronRight, ChevronDown, Star
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

// --- Types ---
interface BikeData {
  id: string;
  model: string;
  plate: string;
  year: number;
  assignedRider: string | null;
  status: 'Active' | 'Inactive' | 'Maintenance';
  todayEarnings: number;
  targetEarnings: number;
  maintenanceStatus: 'Good' | 'Due Soon' | 'Overdue';
  lastService: string;
}

interface RiderData {
  id: string;
  name: string;
  phone: string;
  rating: number;
  assignedBike: string | null;
  status: 'Online' | 'Offline' | 'On Trip';
  todayEarnings: number;
  tripsToday: number;
}

// --- Dummy Data ---
const mockBikes: BikeData[] = [
  { id: 'BK-001', model: 'TVS HLX 150', plate: 'MC 123 ABC', year: 2023, assignedRider: 'Juma Ali', status: 'Active', todayEarnings: 35000, targetEarnings: 30000, maintenanceStatus: 'Good', lastService: '2026-04-01' },
  { id: 'BK-002', model: 'Boxer BM 150', plate: 'MC 456 DEF', year: 2022, assignedRider: null, status: 'Inactive', todayEarnings: 0, targetEarnings: 30000, maintenanceStatus: 'Due Soon', lastService: '2026-02-15' },
  { id: 'BK-003', model: 'Honda Ace 110', plate: 'MC 789 GHI', year: 2024, assignedRider: 'Kassim H.', status: 'Active', todayEarnings: 42000, targetEarnings: 35000, maintenanceStatus: 'Good', lastService: '2026-04-10' },
  { id: 'BK-004', model: 'SanLG SL150', plate: 'MC 321 JKL', year: 2021, assignedRider: null, status: 'Maintenance', todayEarnings: 0, targetEarnings: 25000, maintenanceStatus: 'Overdue', lastService: '2025-11-20' },
  { id: 'BK-005', model: 'Yamaha Crux Rev', plate: 'MC 654 MNO', year: 2023, assignedRider: 'Baraka M.', status: 'Active', todayEarnings: 28000, targetEarnings: 35000, maintenanceStatus: 'Good', lastService: '2026-03-05' },
  { id: 'BK-006', model: 'TVS HLX 125', plate: 'MC 987 PQR', year: 2022, assignedRider: 'Ali Said', status: 'Active', todayEarnings: 15000, targetEarnings: 25000, maintenanceStatus: 'Due Soon', lastService: '2026-01-10' },
];

const mockRiders: RiderData[] = [
  { id: 'RD-01', name: 'Juma Ali', phone: '0712345678', rating: 4.8, assignedBike: 'BK-001', status: 'On Trip', todayEarnings: 35000, tripsToday: 12 },
  { id: 'RD-02', name: 'Kassim H.', phone: '0754123987', rating: 4.5, assignedBike: 'BK-003', status: 'Online', todayEarnings: 42000, tripsToday: 15 },
  { id: 'RD-03', name: 'Baraka M.', phone: '0789456123', rating: 4.9, assignedBike: 'BK-005', status: 'Offline', todayEarnings: 28000, tripsToday: 8 },
  { id: 'RD-04', name: 'Ali Said', phone: '0733999888', rating: 4.2, assignedBike: 'BK-006', status: 'Online', todayEarnings: 15000, tripsToday: 5 },
  { id: 'RD-05', name: 'Rashid J.', phone: '0722333444', rating: 4.7, assignedBike: null, status: 'Offline', todayEarnings: 0, tripsToday: 0 },
];

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

const RevenueChartPlaceholder: React.FC = () => (
  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 h-full flex flex-col">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Revenue vs Target</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Past 7 days performance</p>
      </div>
      <div className="flex gap-2">
        <span className="flex items-center gap-1 text-xs font-bold text-slate-500"><div className="w-3 h-3 rounded-full bg-primary-light" /> Actual</span>
        <span className="flex items-center gap-1 text-xs font-bold text-slate-500"><div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" /> Target</span>
      </div>
    </div>

    {/* CSS Grid based Bar Chart Mockup */}
    <div className="flex-1 flex items-end gap-2 sm:gap-4 mt-auto pt-8">
      {[40, 70, 45, 90, 60, 100, 85].map((val, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 relative group h-[200px]">
          {/* Target Line / Background bar */}
          <div className="w-full max-w-[40px] bg-slate-100 dark:bg-white/5 rounded-t-lg absolute bottom-0 h-[80%]" />

          {/* Actual Bar */}
          <div
            className="w-full max-w-[40px] bg-gradient-to-t from-primary-dark to-primary-light rounded-t-lg relative z-10 transition-all duration-500 group-hover:opacity-80"
            style={{ height: `${val}%` }}
          >
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
              TZS {val * 1000}
            </div>
          </div>

          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-2 block w-full text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const BikeManagementTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'maintenance'>('all');

  const filteredBikes = mockBikes.filter(b => {
    if (activeTab === 'active') return b.status === 'Active';
    if (activeTab === 'maintenance') return b.status === 'Maintenance' || b.maintenanceStatus === 'Due Soon' || b.maintenanceStatus === 'Overdue';
    return true;
  });

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-transparent">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Fleet Garage</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage motorcycles, assignments, and maintenance.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by plate or model..." className="pl-9 pr-4 py-2 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary-light w-full lg:w-64 transition-colors" />
            </div>
            <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-2 text-sm font-bold bg-white dark:bg-black/50 hover:bg-slate-50 dark:hover:bg-white/5 whitespace-nowrap">
              <Filter size={16} /> Filter
            </button>
            <button className="px-4 py-2 rounded-xl bg-primary-light text-white flex items-center gap-2 text-sm font-bold hover:bg-primary-dark transition-colors whitespace-nowrap">
              <Plus size={16} /> Add Bike
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200 dark:border-white/10">
          {[
            { id: 'all', label: 'All Bikes', count: mockBikes.length },
            { id: 'active', label: 'Active on Road', count: mockBikes.filter(b => b.status === 'Active').length },
            { id: 'maintenance', label: 'Needs Attention', count: mockBikes.filter(b => b.status === 'Maintenance' || b.maintenanceStatus === 'Overdue').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === tab.id ? 'text-primary-light' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
            >
              {tab.label} <span className="ml-1 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-[10px]">{tab.count}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-light rounded-t-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-50 dark:bg-white/5">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Rider</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Revenue</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Maintenance</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {filteredBikes.map((bike) => (
              <tr key={bike.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 dark:text-slate-500">
                      <Bike size={24} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-sm">{bike.plate}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{bike.model} • {bike.year}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">ID: {bike.id}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  {bike.assignedRider ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-light/20 text-primary-light flex items-center justify-center font-bold text-xs">
                        {bike.assignedRider.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{bike.assignedRider}</p>
                        <button className="text-[10px] font-bold text-primary-light hover:underline uppercase mt-0.5">Change Assignment</button>
                      </div>
                    </div>
                  ) : (
                    <button className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-white/20 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-light hover:border-primary-light transition-colors">
                      + Assign Rider
                    </button>
                  )}
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm font-black text-slate-900 dark:text-white">TZS {bike.todayEarnings.toLocaleString()}</p>
                  <div className="w-full max-w-[120px] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden flex">
                    <div
                      className={`h-full ${bike.todayEarnings >= bike.targetEarnings ? 'bg-green-500' : 'bg-primary-light'}`}
                      style={{ width: `${Math.min(100, (bike.todayEarnings / bike.targetEarnings) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">Target: TZS {bike.targetEarnings.toLocaleString()}</p>
                </td>

                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${bike.maintenanceStatus === 'Good' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                      bike.maintenanceStatus === 'Overdue' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                    <Wrench size={12} /> {bike.maintenanceStatus}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">Last: {bike.lastService}</p>
                </td>

                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${bike.status === 'Active' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30' :
                      bike.status === 'Maintenance' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30' :
                        'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                    }`}>
                    {bike.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-primary-light hover:bg-primary-light/10 rounded-lg transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBikes.length === 0 && (
        <div className="p-12 text-center flex flex-col items-center">
          <Bike size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-lg font-bold text-slate-500">No bikes found in this category.</p>
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---
const OwnerDashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DashboardLayout role="owner">
      <div className="max-w-7xl mx-auto space-y-8 w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Fleet Overview
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              You have <span className="font-bold text-primary-light">6 bikes</span> registered. 4 are currently active on the road.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 font-bold bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2">
              <FileText size={18} /> Reports
            </button>
            <button className="premium-btn bg-primary-light text-white shadow-xl flex items-center gap-2 px-6">
              <Plus size={18} /> Register Bike
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Fleet Revenue" value="TZS 120k" icon={DollarSign} color="text-green-500" trend={{ value: 8.5, isUp: true }} subtitle="Today's collections" />
          <StatCard title="Active Bikes" value="4 / 6" icon={Bike} color="text-primary-light" subtitle="2 Inactive/Maintenance" />
          <StatCard title="Active Riders" value="4 / 5" icon={Users} color="text-blue-500" subtitle="1 Unassigned" />
          <StatCard title="Avg Rating" value="4.6" icon={Star} color="text-amber-500" trend={{ value: 2.1, isUp: false }} subtitle="Across fleet" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <BikeManagementTable />
          </div>

          <div className="xl:col-span-1 space-y-8">
            <div className="h-[400px]">
              <RevenueChartPlaceholder />
            </div>

            {/* Quick Actions / Alerts */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-black">Attention Required</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white dark:bg-black/50 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">MC 321 JKL</p>
                    <p className="text-xs text-slate-500">Service Overdue by 5 days</p>
                  </div>
                  <button className="text-xs font-bold text-red-500 hover:underline">Schedule</button>
                </div>
                <div className="bg-white dark:bg-black/50 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">Rashid J.</p>
                    <p className="text-xs text-slate-500">Rider inactive for 3 days</p>
                  </div>
                  <button className="text-xs font-bold text-slate-900 dark:text-white hover:underline">Contact</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;

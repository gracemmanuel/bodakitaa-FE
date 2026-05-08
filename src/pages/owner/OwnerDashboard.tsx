import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client/react';
import {
  Bike, Users, TrendingUp, DollarSign, Plus, Settings2,
  Search, Filter, MoreHorizontal, AlertTriangle, CheckCircle,
  Clock, Activity, MapPin, Wrench, FileText, Download, ChevronRight, ChevronDown, Star, X
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import { getTimeBasedGreeting } from '../../utils/greeting';
import { graphqlClient } from '../../api';
import { GET_OWNER_STATS } from '../../api/queries';

// --- Types ---
interface BikeData {
  id: string;
  modelName: string;
  plateNumber: string;
  year: number;
  assignedRider: { fullName: string } | null;
  status: string;
  todayEarnings: number;
  targetEarnings: number;
  maintenanceStatus: string;
}

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

const RevenueChartPlaceholder: React.FC<{ data: number[] }> = ({ data }) => {
  const maxVal = Math.max(...data, 1000);
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Revenue Analytics</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Weekly performance</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-xs font-bold text-slate-500"><div className="w-3 h-3 rounded-full bg-primary-light" /> Actual</span>
        </div>
      </div>

      <div className="flex-1 flex items-end gap-2 sm:gap-4 mt-auto pt-8">
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 relative group h-[200px]">
            <div className="w-full max-w-[40px] bg-slate-100 dark:bg-white/5 rounded-t-lg absolute bottom-0 h-[100%]" />
            <div
              className="w-full max-w-[40px] bg-gradient-to-t from-primary-dark to-primary-light rounded-t-lg relative z-10 transition-all duration-700 group-hover:opacity-80"
              style={{ height: `${(val / maxVal) * 100}%` }}
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                TZS {val.toLocaleString()}
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-2 block w-full text-center uppercase">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface AddBikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBikeModal: React.FC<AddBikeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [make, setMake] = useState('');
  const [modelName, setModelName] = useState('');
  const [year, setYear] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const mutation = `
      mutation CreateVehicle($make: String!, $modelName: String!, $year: Int!, $plateNumber: String!) {
        createVehicle(make: $make, modelName: $modelName, year: $year, plateNumber: $plateNumber) {
          success
          message
        }
      }
    `;

    try {
      const data = await graphqlClient(mutation, {
        make,
        modelName,
        year: parseInt(year),
        plateNumber
      });

      if (data.createVehicle.success) {
        onSuccess();
        onClose();
        setMake(''); setModelName(''); setYear(''); setPlateNumber('');
      } else {
        setError(data.createVehicle.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register bike');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bike className="text-primary-light" /> Register New Bike
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Make</label>
              <input type="text" required value={make} onChange={e => setMake(e.target.value)} placeholder="e.g. TVS" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 focus:border-primary-light focus:outline-none transition-colors text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Model</label>
              <input type="text" required value={modelName} onChange={e => setModelName(e.target.value)} placeholder="e.g. HLX 150" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 focus:border-primary-light focus:outline-none transition-colors text-slate-900 dark:text-white" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Year</label>
              <input type="number" required value={year} onChange={e => setYear(e.target.value)} placeholder="2023" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 focus:border-primary-light focus:outline-none transition-colors text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Plate Number</label>
              <input type="text" required value={plateNumber} onChange={e => setPlateNumber(e.target.value)} placeholder="MC 123 ABC" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 focus:border-primary-light focus:outline-none transition-colors text-slate-900 dark:text-white" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-4 mt-6 bg-primary-light hover:bg-primary-dark text-white font-black rounded-xl shadow-lg shadow-primary-light/30 transition-all flex justify-center items-center gap-2">
            {isLoading ? 'Registering...' : <><Plus size={20} /> Add Vehicle</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const BikeManagementTable: React.FC<{ bikes: BikeData[], onAddBike: () => void }> = ({ bikes, onAddBike }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'maintenance'>('all');

  const filteredBikes = bikes.filter(b => {
    if (activeTab === 'active') return b.status.toLowerCase() === 'active';
    if (activeTab === 'maintenance') return b.status.toLowerCase() === 'maintenance' || b.maintenanceStatus === 'Overdue';
    return true;
  });

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col relative min-h-[400px]">
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
            <button className="px-4 py-2 rounded-xl bg-primary-light text-white flex items-center gap-2 text-sm font-bold hover:bg-primary-dark transition-colors whitespace-nowrap" onClick={onAddBike}>
              <Plus size={16} /> Add Bike
            </button>
          </div>
        </div>

        <div className="flex gap-6 border-b border-slate-200 dark:border-white/10">
          {[
            { id: 'all', label: 'All Bikes', count: bikes.length },
            { id: 'active', label: 'Active on Road', count: bikes.filter(b => b.status.toLowerCase() === 'active').length },
            { id: 'maintenance', label: 'Needs Attention', count: bikes.filter(b => b.status.toLowerCase() === 'maintenance' || b.maintenanceStatus === 'Overdue').length }
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

      <div className="overflow-x-auto custom-scrollbar flex-1">
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
                      <p className="font-black text-slate-900 dark:text-white text-sm">{bike.plateNumber}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{bike.modelName} • {bike.year}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">ID: {bike.id}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  {bike.assignedRider ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-light/20 text-primary-light flex items-center justify-center font-bold text-xs">
                        {bike.assignedRider.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{bike.assignedRider.fullName}</p>
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
                  <p className="text-sm font-black text-slate-900 dark:text-white">TZS {(bike.todayEarnings || 0).toLocaleString()}</p>
                  <div className="w-full max-w-[120px] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden flex">
                    <div
                      className={`h-full ${(bike.todayEarnings || 0) >= (bike.targetEarnings || 30000) ? 'bg-green-500' : 'bg-primary-light'}`}
                      style={{ width: `${Math.min(100, ((bike.todayEarnings || 0) / (bike.targetEarnings || 30000)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">Target: TZS {(bike.targetEarnings || 30000).toLocaleString()}</p>
                </td>

                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${bike.maintenanceStatus === 'Good' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                      bike.maintenanceStatus === 'Overdue' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                    <Wrench size={12} /> {bike.maintenanceStatus || 'Good'}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${bike.status.toLowerCase() === 'active' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30' :
                      bike.status.toLowerCase() === 'maintenance' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30' :
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
        
        {filteredBikes.length === 0 && (
          <div className="absolute inset-0 top-[140px] flex flex-col items-center justify-center bg-slate-50/50 dark:bg-black/50 backdrop-blur-sm">
            <Bike size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-lg font-bold text-slate-500">No bikes found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---
const OwnerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [bikes, setBikes] = useState<BikeData[]>([]);
  const [isAddBikeOpen, setIsAddBikeOpen] = useState(false);

  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useQuery(GET_OWNER_STATS, {
    fetchPolicy: 'cache-and-network',
  });

  const fetchDashboardData = async () => {
    try {
      const query = `
        query {
          myFleet {
            id
            modelName
            plateNumber
            year
            status
            todayEarnings
            targetEarnings
            maintenanceStatus
            assignedRider {
              fullName
            }
          }
        }
      `;
      const data = await graphqlClient(query);
      if (data && data.myFleet) {
        setBikes(data.myFleet);
      }
    } catch (err) {
      console.error("Failed to fetch fleet:", err);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
    fetchDashboardData();
  }, []);

  const stats = statsData?.ownerStats;
  const activeCount = bikes.filter(b => b.status.toLowerCase() === 'active').length;

  return (
    <CombinedNav role="owner">
      <div className="max-w-7xl mx-auto space-y-8 w-full pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {getTimeBasedGreeting()}, <span className="text-primary-light">{user?.fullName || user?.full_name || 'Owner'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              You have <span className="font-bold text-primary-light">{bikes.length} bikes</span> registered. {activeCount} are currently active on the road.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 font-bold bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2">
              <FileText size={18} /> Reports
            </button>
            <button onClick={() => setIsAddBikeOpen(true)} className="premium-btn bg-primary-light text-white shadow-xl flex items-center gap-2 px-6">
              <Plus size={18} /> Register Bike
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Fleet Revenue" value={`TZS ${stats?.totalFleetRevenue?.toLocaleString() || '0'}`} icon={DollarSign} color="text-green-500" trend={{ value: 12, isUp: true }} subtitle="Today's collections" />
          <StatCard title="Active Bikes" value={`${stats?.activeBikes || 0} / ${stats?.totalBikes || 0}`} icon={Bike} color="text-primary-light" subtitle={`${(stats?.totalBikes || 0) - (stats?.activeBikes || 0)} Inactive/Maintenance`} />
          <StatCard title="Active Riders" value={`${stats?.activeRiders || 0}`} icon={Users} color="text-blue-500" subtitle="Assigned to vehicles" />
          <StatCard title="Avg Rating" value={`${stats?.avgFleetRating || '0.0'}`} icon={Star} color="text-amber-500" subtitle="Across fleet" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <BikeManagementTable bikes={bikes} onAddBike={() => setIsAddBikeOpen(true)} />
          </div>

          <div className="xl:col-span-1 space-y-8">
            <div className="h-[400px]">
              <RevenueChartPlaceholder data={stats?.revenueData || [0, 0, 0, 0, 0, 0, 0]} />
            </div>

            {/* Quick Actions / Alerts */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-black">Attention Required</h3>
              </div>
              <div className="space-y-4">
                {stats?.alertsCount && stats.alertsCount > 0 ? (
                  <div className="bg-white dark:bg-black/50 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{stats.alertsCount} Bikes need maintenance</p>
                      <p className="text-xs text-slate-500">Check fleet garage for details</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-black/50 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">No alerts</p>
                      <p className="text-xs text-slate-500">Your fleet is running smoothly</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AddBikeModal 
        isOpen={isAddBikeOpen} 
        onClose={() => setIsAddBikeOpen(false)} 
        onSuccess={() => { fetchDashboardData(); refetchStats(); }}
      />
    </CombinedNav>
  );
};

export default OwnerDashboard;

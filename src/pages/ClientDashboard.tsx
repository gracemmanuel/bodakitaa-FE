import React, { useState } from 'react';
import {
  MapPin, Clock, Star, Navigation as NavigationIcon, Calendar,
  CreditCard, Search, Filter, MoreHorizontal,
  AlertCircle, CheckCircle2, Activity, Map as MapIcon,
  PhoneCall, Smartphone, RefreshCcw, User, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import CombinedNav from '../components/CombinedNav';
import MapComponent from '../components/MapComponent';
import { GET_RIDE_HISTORY, GET_CLIENT_STATS, GET_ME } from '../api/queries';
// --- Types ---
interface RideHistory {
  id: string;
  driver: { name: string; avatar: string; rating: number; phone: string; bikeDetails: string };
  pickup: string;
  destination: string;
  date: string;
  time: string;
  amount: number;
  status: 'Completed' | 'Cancelled' | 'In Progress';
  distance: string;
  duration: string;
  paymentMethod: string;
}

interface PaymentMethod {
  id: string;
  type: 'Cash' | 'Visa' | 'Mastercard' | 'Mobile Money';
  provider?: string;
  last4?: string;
  isDefault: boolean;
  balance?: number; // for wallet
}

interface UserStats {
  totalRides: number;
  totalSpent: number;
  loyaltyPoints: number;
  carbonSaved: number;
}

// --- Mock Data (Kept only for missing API models like Wallet) ---

const mockPaymentMethods: PaymentMethod[] = [
  { id: 'pm_1', type: 'Cash', provider: 'Cash Only', isDefault: true },
];

// --- Sub-Components ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string; subtitle?: string; trend?: { value: number; isUp: boolean }, loading?: boolean }> = ({ title, value, icon: Icon, color, subtitle, trend, loading }) => (
  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
    <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150 ${color.replace('text-', 'bg-')}`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('500', '500/20')} ${color}`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
    </div>
    {loading ? (
      <div className="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse mb-2" />
    ) : (
      <div>
        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{value}</h4>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{subtitle}</p>}
      </div>
    )}
  </div>
);

// ─── Active Ride Card ─────────────────────────────────────────────────────────
const ActiveRideCard: React.FC<{ ride: any }> = ({ ride }) => (
  <div className="col-span-full bg-gradient-to-br from-primary-dark via-slate-900 to-black rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl flex flex-col md:flex-row">
    <div className="p-8 md:w-1/2 flex flex-col justify-center relative z-10">
      <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/50 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 w-max animate-pulse">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        Ride in Progress
      </div>

      <h3 className="text-3xl font-black text-white mb-2 line-clamp-1">Heading to {ride.destination}</h3>
      <p className="text-slate-400 text-sm mb-8 flex items-center gap-2"><Clock size={16} /> Est. Arrival: {ride.estimatedArrival || 'Soon'}</p>

      <div className="space-y-6">
        <div className="flex gap-4 relative">
          <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-slate-700" />
          <div className="w-6 h-6 rounded-full bg-slate-800 border-4 border-slate-600 z-10 flex-shrink-0 mt-1" />
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Pickup</p>
            <p className="text-white font-medium">{ride.pickup}</p>
          </div>
        </div>
        <div className="flex gap-4 relative">
          <div className="w-6 h-6 rounded-full bg-primary-light border-4 border-primary-light/30 z-10 flex-shrink-0 mt-1 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <div>
            <p className="text-xs text-primary-light font-bold uppercase">Destination</p>
            <p className="text-white font-medium">{ride.destination}</p>
          </div>
        </div>
      </div>
    </div>

    <div className="p-8 md:w-1/2 bg-white/5 backdrop-blur-md border-l border-white/10 flex flex-col justify-between relative z-10">
      <div className="bg-black/50 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.rider?.fullName || 'Driver'}`} alt="Driver" className="w-16 h-16 rounded-xl bg-slate-800" />
        <div className="flex-1">
          <h4 className="text-white font-bold text-lg">{ride.rider?.fullName || 'Driver Assigned'}</h4>
          <p className="text-slate-400 text-sm flex items-center gap-1">
            <Star size={14} className="text-amber-500 fill-current" /> {ride.rider?.rating || 'New'}
          </p>
        </div>
        <div className="text-right">
          <div className="bg-primary-light/20 text-primary-light font-black px-3 py-1 rounded-lg text-sm border border-primary-light/30 mb-2">{ride.rider?.plateNumber || 'Pending'}</div>
          <button className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors ml-auto">
            <PhoneCall size={16} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Ride History Table ───────────────────────────────────────────────────────
const RideHistoryTable: React.FC<{ clientId?: string }> = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const PAGE_SIZE = 5;

  React.useEffect(() => {
    const fetchRides = async () => {
      try {
        const { graphqlClient } = await import('../api/index');
        const query = `
          query {
            myRides {
              id
              pickupAddress
              destinationAddress
              status
              baseFare
              requestedAt
              rider {
                fullName
              }
            }
          }
        `;
        const data = await graphqlClient(query);
        setRides(data.myRides || []);
      } catch (err) {
        console.error("Failed to load rides:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const filtered = search
    ? rides.filter((r: any) =>
      r.pickupAddress.toLowerCase().includes(search.toLowerCase()) ||
      r.destinationAddress.toLowerCase().includes(search.toLowerCase())
    )
    : rides;

  const total = filtered.length;
  const currentRides = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col h-[500px] md:h-[600px]">
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-transparent">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Ride History</h3>
          <p className="text-sm text-slate-500">{loading ? '...' : `${total} total rides`}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search rides..."
              className="pl-9 pr-4 py-2 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary-light w-full sm:w-48 transition-colors"
            />
          </div>
          <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-2 text-sm font-bold bg-white dark:bg-black/50 hover:bg-slate-50 dark:hover:bg-white/5">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCcw size={28} className="animate-spin text-primary-light" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
            <AlertCircle size={32} className="text-red-400" />
            <p className="font-semibold text-sm">Failed to load ride history</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <MapIcon size={40} className="opacity-30" />
            <p className="font-semibold">No rides found</p>
            <p className="text-sm">Book your first ride to get started!</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ride Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Rider</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {currentRides.map((ride: any) => (
                <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ride.status === 'completed' ? 'bg-green-500/10 text-green-500' : ride.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-primary-light/10 text-primary-light'}`}>
                        <MapIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{ride.destinationAddress}</p>
                        <p className="text-xs text-slate-500 mt-1">from {ride.pickupAddress}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">#{ride.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {ride.rider ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><User size={14} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{ride.rider.fullName}</p>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                            <Star size={10} className="fill-current" /> 4.8
                          </div>
                        </div>
                      </div>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(ride.requestedAt).toLocaleDateString()}</div>
                    <div className="text-xs mt-1 text-slate-400">{new Date(ride.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-900 dark:text-white">TZS {parseFloat(ride.baseFare).toLocaleString()}</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${ride.status === 'completed' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : ride.status === 'cancelled' ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-amber-500/20 text-amber-500'}`}>
                      {ride.status === 'completed' && <CheckCircle2 size={10} />}
                      {ride.status === 'cancelled' && <AlertCircle size={10} />}
                      {ride.status === 'in_progress' && <Activity size={10} />}
                      {ride.status.replace('_', ' ')}
                    </div>
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
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-transparent">
        <p className="text-xs font-bold text-slate-500">Showing {filtered.length} of {total} rides</p>
        <div className="flex gap-1">
          <button onClick={() => setPage(Math.max(1, page - 1))} className="w-8 h-8 rounded border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"><ChevronLeft size={16} /></button>
          <button className="w-8 h-8 rounded bg-primary-light text-white font-bold flex items-center justify-center">{page}</button>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} className="w-8 h-8 rounded border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};

// ─── Wallet Section ───────────────────────────────────────────────────────────
const WalletSection: React.FC<{ totalSpent: number; loading: boolean }> = ({ totalSpent, loading }) => (
  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col h-full">
    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">BodaKitaa Wallet</p>
        {loading ? (
           <div className="h-10 w-32 bg-white/10 rounded-xl animate-pulse mt-2" />
        ) : (
           <h3 className="text-4xl font-black tracking-tight">TZS {totalSpent || 0}</h3>
        )}
      </div>
      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
        <CreditCard size={24} />
      </div>
    </div>
    <div className="flex gap-4 mb-8 relative z-10">
      <button className="flex-1 py-3 bg-primary-light rounded-xl font-bold shadow-[0_10px_20px_-10px_rgba(254,119,67,0.5)] hover:scale-[1.02] transition-transform">Top Up</button>
      <button className="flex-1 py-3 bg-white/10 border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-colors">History</button>
    </div>
    <div className="mt-auto relative z-10">
      <h4 className="font-bold text-sm mb-4">Payment Methods</h4>
      <div className="space-y-3">
        {mockPaymentMethods.map((pm) => (
          <div key={pm.id} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <CreditCard size={18} className="text-green-400" />
              </div>
              <div>
                <p className="font-bold text-sm">{pm.provider || pm.type}</p>
                <p className="text-xs text-slate-400">Pay directly to driver</p>
              </div>
            </div>
            {pm.isDefault && <span className="bg-primary-light/20 text-primary-light text-[10px] font-black uppercase px-2 py-1 rounded">Default</span>}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: statsData, loading: statsLoading } = useQuery<any>(GET_CLIENT_STATS);
  const stats = statsData?.clientStats;
  const activeRide = stats?.activeRide;

  const [userName, setUserName] = React.useState('Client');
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) {
      setUserName(user.fullName);
    } else if (user.full_name) {
      setUserName(user.full_name);
    }
  }, []);

  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour < 18) {
    greeting = 'Good afternoon';
  }

  const totalRides = stats?.totalRides || 0;

  return (
    <CombinedNav role="client">
      <div className="max-w-7xl mx-auto space-y-8 w-full">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {greeting}, <span className="text-primary-light">{userName}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              You have taken {statsLoading ? '...' : totalRides} rides with us. Thank you for choosing BodaKitaa!
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/client/request')}
            className="premium-btn bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
          >
            <NavigationIcon size={18} /> Book a Ride Now
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Rides" value={stats?.totalRides ?? 0} icon={MapPin} color="text-blue-500" trend={{ value: 12, isUp: true }} loading={statsLoading} />
          <StatCard title="Total Spent" value={`TZS ${((stats?.totalSpent ?? 0) / 1000)}k`} icon={CreditCard} color="text-green-500" loading={statsLoading} />
          <StatCard title="Loyalty Points" value={stats?.loyaltyPoints ?? 0} icon={Star} color="text-amber-500" subtitle="Gold Tier Member" loading={statsLoading} />
          <StatCard title="CO2 Saved" value={`${stats?.carbonSaved ?? 0} kg`} icon={Activity} color="text-primary-light" subtitle="Compared to cars" loading={statsLoading} />
        </div>

        {/* Active Ride Banner */}
        {activeRide && (
          <div className="grid grid-cols-1">
            <ActiveRideCard ride={activeRide} />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Map View Section */}
          <div className="col-span-full xl:col-span-2 h-[400px] xl:h-[600px]">
            <MapComponent className="shadow-2xl" />
          </div>
          <div className="xl:col-span-1 h-auto xl:h-[600px]">
            <WalletSection totalSpent={stats?.totalSpent ?? 0} loading={statsLoading} />
          </div>
          <div className="col-span-full">
            <RideHistoryTable />
          </div>
        </div>
      </div>
    </CombinedNav>
  );
};

export default ClientDashboard;

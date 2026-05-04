import React, { useState } from 'react';
import {
  MapPin, TrendingUp, Clock, Star, Navigation as NavigationIcon, Calendar,
  CreditCard, Search, Filter, MoreHorizontal, Shield,
  AlertCircle, CheckCircle2, Activity, Map as MapIcon,
  PhoneCall, Smartphone
} from 'lucide-react';
import CombinedNav from '../components/CombinedNav';
import BookRideModal from '../components/BookRideModal';
import MapComponent from '../components/MapComponent';
import { getTimeBasedGreeting } from '../utils/greeting';

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
  type: 'Visa' | 'Mastercard' | 'Mobile Money';
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

const ActiveRideCard: React.FC<{ ride: any }> = ({ ride }) => {
  if (!ride) return null;
  return (
  <div className="col-span-full xl:col-span-3 bg-gradient-to-br from-primary-dark via-slate-900 to-black rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl flex flex-col md:flex-row mb-8">
    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M 10 90 Q 50 10 90 90" fill="none" stroke="#FE7743" strokeWidth="0.5" strokeDasharray="2 1" className="animate-[dash_10s_linear_infinite]" />
      </svg>
    </div>

    <div className="p-8 md:w-1/2 flex flex-col justify-center relative z-10">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 w-max ${ride.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50 animate-pulse'}`}>
        <div className={`w-2 h-2 rounded-full ${ride.status === 'pending' ? 'bg-amber-400' : 'bg-green-400'}`} />
        {ride.status.replace('_', ' ')}
      </div>

      <h3 className="text-3xl font-black text-white mb-2 line-clamp-1">{ride.destination_address}</h3>
      <p className="text-slate-400 text-sm mb-8 flex items-center gap-2"><Clock size={16} /> Est. Fare: TZS {parseFloat(ride.base_fare).toLocaleString()}</p>

      <div className="space-y-6">
        <div className="flex gap-4 relative">
          <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-slate-700" />
          <div className="w-6 h-6 rounded-full bg-slate-800 border-4 border-slate-600 z-10 flex-shrink-0 mt-1" />
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Pickup</p>
            <p className="text-white font-medium line-clamp-1">{ride.pickup_address}</p>
          </div>
        </div>
        <div className="flex gap-4 relative">
          <div className="w-6 h-6 rounded-full bg-primary-light border-4 border-primary-light/30 z-10 flex-shrink-0 mt-1 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <div>
            <p className="text-xs text-primary-light font-bold uppercase">Destination</p>
            <p className="text-white font-medium line-clamp-1">{ride.destination_address}</p>
          </div>
        </div>
      </div>
    </div>

    <div className="p-8 md:w-1/2 bg-white/5 backdrop-blur-md border-l border-white/10 flex flex-col justify-between relative z-10">
      <div className="bg-black/50 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.rider_name || 'Driver'}`} alt="Driver" className="w-16 h-16 rounded-xl bg-slate-800" />
        <div className="flex-1">
          <h4 className="text-white font-bold text-lg">{ride.rider_name || 'Finding Rider...'}</h4>
          <p className="text-slate-400 text-sm flex items-center gap-1">
            <Star size={14} className="text-amber-500 fill-current" /> 4.9
          </p>
        </div>
        {ride.rider_name && (
        <div className="text-right">
          <button className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors ml-auto">
            <PhoneCall size={16} />
          </button>
        </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <button className="flex-1 py-4 bg-primary-light text-white rounded-xl font-bold shadow-[0_0_20px_rgba(254,119,67,0.3)] hover:scale-[1.02] transition-transform">
          Share Live Location
        </button>
        <button className="w-16 h-16 bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <Shield size={24} />
        </button>
      </div>
    </div>
  </div>
)};

const RideHistoryTable: React.FC<{ rides: any[] }> = ({ rides }) => {
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col h-[500px] md:h-[600px]">
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-transparent">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Ride History</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your most recent trips and transactions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search rides..." className="pl-9 pr-4 py-2 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary-light w-full sm:w-48 transition-colors" />
          </div>
          <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-2 text-sm font-bold bg-white dark:bg-black/50 hover:bg-slate-50 dark:hover:bg-white/5">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ride Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Driver</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Date & Time</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount/Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {rides.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500">No rides found.</td></tr>
            ) : rides.map((ride: any) => (
              <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ride.status === 'completed' ? 'bg-green-500/10 text-green-500' : ride.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-primary-light/10 text-primary-light'}`}>
                      <MapIcon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{ride.destination_address}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> {ride.pickup_address}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">ID: {ride.id}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.rider_name || 'Driver'}`} alt={ride.rider_name || 'Driver'} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{ride.rider_name || 'Pending'}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(ride.requested_at).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs opacity-70"><Clock size={12} /> {new Date(ride.requested_at).toLocaleTimeString()}</div>
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm font-black text-slate-900 dark:text-white">TZS {parseFloat(ride.base_fare).toLocaleString()}</p>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${ride.status === 'completed' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                    ride.status === 'cancelled' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                      'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}>
                    {ride.status === 'completed' && <CheckCircle2 size={10} />}
                    {ride.status === 'cancelled' && <AlertCircle size={10} />}
                    {['pending', 'accepted', 'in_progress'].includes(ride.status) && <Activity size={10} />}
                    {ride.status}
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  {ride.status === 'completed' && !ride.rating ? (
                    <button 
                      onClick={async () => {
                        const stars = window.prompt("Rate this ride (1-5 stars):", "5");
                        if (stars && parseInt(stars) >= 1 && parseInt(stars) <= 5) {
                          try {
                            const { graphqlClient } = await import('../api/index');
                            const rateMutation = `
                              mutation($rideId: Int!, $stars: Int!, $comment: String) {
                                rateRide(rideId: $rideId, stars: $stars, comment: $comment) {
                                  success
                                  message
                                }
                              }
                            `;
                            await graphqlClient(rateMutation, {
                              rideId: parseInt(ride.id),
                              stars: parseInt(stars),
                              comment: "Good ride"
                            });
                            alert("Thank you for your rating!");
                            window.location.reload();
                          } catch (e) {
                            alert("Failed to submit rating.");
                          }
                        }
                      }}
                      className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-lg hover:bg-amber-500/20 transition-colors flex items-center gap-1 ml-auto"
                    >
                      <Star size={12} className="fill-current" /> Rate
                    </button>
                  ) : (
                    <button className="p-2 text-slate-400 hover:text-primary-light hover:bg-primary-light/10 rounded-lg transition-colors ml-auto">
                      <MoreHorizontal size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-transparent">
        <p className="text-xs font-bold text-slate-500">Showing {rides.length} rides</p>
      </div>
    </div>
  );
};

const WalletSection: React.FC = () => (
  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col h-full">
    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

    <div className="flex justify-between items-start mb-8 relative z-10">
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">BodaKitaa Wallet</p>
        <h3 className="text-4xl font-black tracking-tight">TZS 0</h3>
      </div>
      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
        <CreditCard size={24} className="text-white" />
      </div>
    </div>

    <div className="flex gap-4 mb-10 relative z-10">
      <button className="flex-1 py-3 bg-primary-light rounded-xl font-bold shadow-[0_10px_20px_-10px_rgba(254,119,67,0.5)] hover:scale-[1.02] transition-transform">Top Up</button>
      <button className="flex-1 py-3 bg-white/10 border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-colors">Withdraw</button>
    </div>

    <div className="mt-auto relative z-10">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-sm">Payment Methods</h4>
        <button className="text-xs text-primary-light font-bold hover:underline">Manage</button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-slate-400 text-sm">
           Cash Only Supported Right Now
        </div>
      </div>
    </div>
  </div>
);

// --- Main Page Component ---
const ClientDashboard: React.FC = () => {
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const [rides, setRides] = React.useState<any[]>([]);
  const [user, setUser] = React.useState<any>(null);
  const [stats, setStats] = React.useState({ totalRides: 0, totalSpent: 0, loyaltyPoints: 0, carbonSaved: 0 });

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);

        const { graphqlClient } = await import('../api/index');
        const ridesQuery = `
          query {
            myRides {
              id
              status
              vehicleType
              pickupAddress
              pickupLat
              pickupLng
              destinationAddress
              destinationLat
              destinationLng
              baseFare
              requestedAt
              rider {
                id
                fullName
              }
            }
          }
        `;
        const ridesData = await graphqlClient(ridesQuery);
        // Rename keys to match existing format where needed
        const formattedRides = ridesData.myRides.map((r: any) => ({
          ...r,
          rider_name: r.rider ? r.rider.fullName : null,
          pickup_address: r.pickupAddress,
          destination_address: r.destinationAddress,
          base_fare: r.baseFare,
          requested_at: r.requestedAt
        }));
        
        setRides(formattedRides);

        const totalSpent = formattedRides.reduce((acc: number, ride: any) => acc + parseFloat(ride.base_fare || 0), 0);
        setStats({
          totalRides: ridesData.length,
          totalSpent: totalSpent,
          loyaltyPoints: Math.floor(totalSpent / 1000),
          carbonSaved: ridesData.length * 0.5
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <CombinedNav role="client">
      <BookRideModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      <div className="max-w-7xl mx-auto space-y-8 w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {getTimeBasedGreeting()}, <span className="text-primary-light">{user?.fullName || user?.full_name || 'Rider'}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              You have taken {stats.totalRides} rides with us. Thank you for choosing BodaKitaa!
            </p>
          </div>
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="premium-btn bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
          >
            <NavigationIcon size={18} /> Book a Ride Now
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Rides" value={stats.totalRides} icon={MapPin} color="text-blue-500" trend={{ value: 12, isUp: true }} />
          <StatCard title="Total Spent" value={`TZS ${(stats.totalSpent / 1000).toFixed(1)}k`} icon={CreditCard} color="text-green-500" />
          <StatCard title="Loyalty Points" value={stats.loyaltyPoints} icon={Star} color="text-amber-500" subtitle="Gold Tier Member" />
          <StatCard title="CO2 Saved" value={`${stats.carbonSaved} kg`} icon={Activity} color="text-primary-light" subtitle="Compared to cars" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {rides.find((r: any) => ['pending', 'accepted', 'in_progress'].includes(r.status)) && (
             <ActiveRideCard ride={rides.find((r: any) => ['pending', 'accepted', 'in_progress'].includes(r.status))} />
          )}

          {/* Map View Section */}
          <div className="col-span-full xl:col-span-2 h-[400px] xl:h-[600px]">
            <MapComponent className="shadow-2xl" />
          </div>

          <div className="xl:col-span-1 h-auto xl:h-[600px]">
            <WalletSection />
          </div>

          <div className="col-span-full">
            <RideHistoryTable rides={rides} />
          </div>
        </div>
      </div>
    </CombinedNav>
  );
};

export default ClientDashboard;

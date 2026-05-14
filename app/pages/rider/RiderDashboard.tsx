import React, { useState, useEffect } from 'react';
import { 
  Clock, Star, MapPin, Navigation, 
  CheckCircle2, Phone, TrendingUp, Shield,
  RefreshCcw, User, XCircle
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client/react';
import CombinedNav from '../../components/CombinedNav';
import MapComponent from '../../components/MapComponent';
import { GET_RIDER_STATS } from '../../api/queries';
import { ACCEPT_RIDE, START_RIDE, COMPLETE_RIDE } from '../../api/mutations';

// --- Sub-Components ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string; trend?: string }> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:shadow-xl transition-all">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${color.replace('text-', 'bg-')} blur-2xl group-hover:blur-xl transition-all`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('500', '500/20')} ${color}`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      {trend && <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">{trend}</span>}
    </div>
    <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{value}</h4>
    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
  </div>
);

const RiderDashboard: React.FC = () => {
  const [userName, setUserName] = useState('Rider');
  const [location, setLocation] = useState<[number, number] | null>(null);
  
  // 1. Fetch Stats & Active Rides
  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useQuery(GET_RIDER_STATS, {
    pollInterval: 10000, // Refresh every 10s for new requests
  });
  
  const [acceptRide] = useMutation(ACCEPT_RIDE);
  const [startRide] = useMutation(START_RIDE);
  const [completeRide] = useMutation(COMPLETE_RIDE);

  const riderStats = statsData?.riderStats;
  const activeRide = riderStats?.activeRide;
  const pendingRequests = riderStats?.pendingRequests || [];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName || user.full_name) {
      setUserName(user.fullName || user.full_name);
    }
  }, []);

  // ── Real-time Location Tracking ───────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation([latitude, longitude]);
        
        // Push location to backend
        try {
          const { graphqlClient } = await import('../../api/index');
          const mutation = `
            mutation($lat: Float!, $lng: Float!) {
              updateRiderLocation(lat: $lat, lng: $lng) {
                success
              }
            }
          `;
          await graphqlClient(mutation, { lat: latitude, lng: longitude });
        } catch (e) {
          console.error("Location update failed", e);
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleStatusUpdate = async (rideId: string, status: string) => {
    try {
      const vars = { variables: { rideId: parseInt(rideId) } };
      if (status === 'accepted') await acceptRide(vars);
      else if (status === 'in_progress') await startRide(vars);
      else if (status === 'completed') await completeRide(vars);
      
      refetchStats();
    } catch (err) {
      console.error(err);
      alert("Failed to update ride status");
    }
  };

  return (
    <CombinedNav role="rider">
      <div className="max-w-7xl mx-auto space-y-8 w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Karibu tena, <span className="text-primary-light">{userName}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              You are currently <span className="text-green-500 font-bold">Online</span> and visible to customers.
            </p>
          </div>
          <div className="flex gap-3">
             <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1.5 rounded-2xl flex">
                <button className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20">Go Online</button>
                <button className="px-4 py-2 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:text-slate-600">Go Offline</button>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Today's Earnings" value={`TZS ${(riderStats?.todayEarnings || 0).toLocaleString()}`} icon={TrendingUp} color="text-green-500" trend="+12%" />
          <StatCard title="Completed Rides" value={riderStats?.tripsCompleted || 0} icon={CheckCircle2} color="text-blue-500" />
          <StatCard title="Rider Rating" value={parseFloat(riderStats?.rating || 5).toFixed(1)} icon={Star} color="text-amber-500" />
          <StatCard title="Active Hours" value="6.5h" icon={Clock} color="text-primary-light" />
        </div>

        {/* Active Ride / Incoming Requests */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-8">
            {/* ── Active Ride Section ── */}
            {activeRide ? (
              <div className="bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] border border-white/10 p-8 text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                 
                 <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                       <div className="inline-flex items-center gap-2 bg-primary-light/20 text-primary-light px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-light/30 mb-4 animate-pulse">
                          Live Journey
                       </div>
                       <h2 className="text-3xl font-black mb-1">Ride in Progress</h2>
                       <p className="text-slate-400 font-medium">Passenger: {activeRide.client?.fullName}</p>
                    </div>
                    <a href={`tel:${activeRide.client?.phone}`} className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 hover:scale-110 transition-transform">
                       <Phone size={24} />
                    </a>
                 </div>

                 <div className="grid md:grid-cols-2 gap-10 relative z-10">
                    <div className="space-y-6">
                       <div className="flex gap-4 relative">
                          <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-slate-700" />
                          <div className="w-6 h-6 rounded-full bg-slate-800 border-4 border-slate-600 z-10 flex-shrink-0 mt-1" />
                          <div>
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pickup</p>
                             <p className="text-sm font-bold text-slate-200">{activeRide.pickupAddress}</p>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <div className="w-6 h-6 rounded-full bg-primary-light border-4 border-primary-light/30 z-10 flex-shrink-0 mt-1 flex items-center justify-center">
                             <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                          <div>
                             <p className="text-[10px] text-primary-light font-bold uppercase tracking-widest">Destination</p>
                             <p className="text-sm font-bold text-slate-200">{activeRide.destinationAddress}</p>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col justify-end gap-4">
                       <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex justify-between items-center">
                          <div>
                             <p className="text-[10px] text-slate-500 font-bold uppercase">Estimated Fare</p>
                             <p className="text-xl font-black">TZS {parseFloat(activeRide.totalFare).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] text-slate-500 font-bold uppercase">Payment</p>
                             <p className="text-sm font-bold text-green-400">Cash</p>
                          </div>
                       </div>
                       
                       <div className="flex gap-3">
                          {activeRide.status === 'confirmed' && (
                             <button 
                               onClick={() => handleStatusUpdate(activeRide.id, 'in_progress')}
                               className="flex-1 py-4 bg-primary-light text-white font-black rounded-2xl shadow-xl shadow-primary-light/20 hover:scale-[1.02] active:scale-95 transition-all"
                             >
                                Start Ride
                             </button>
                          )}
                          {activeRide.status === 'in_progress' && (
                             <button 
                               onClick={() => handleStatusUpdate(activeRide.id, 'completed')}
                               className="flex-1 py-4 bg-green-500 text-white font-black rounded-2xl shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                             >
                                Complete Ride
                             </button>
                          )}
                          <button className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20">
                             Navigate
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            ) : (
              /* ── Incoming Requests List ── */
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 dark:text-white">Incoming Requests</h2>
                       <p className="text-sm text-slate-500 font-medium">New ride requests in your area</p>
                    </div>
                    <RefreshCcw size={20} className="text-slate-400 hover:text-primary-light cursor-pointer transition-colors" onClick={() => refetchStats()} />
                 </div>

                 {pendingRequests.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                       <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-300">
                          <Navigation size={40} className="animate-pulse" />
                       </div>
                       <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Waiting for new requests...</p>
                    </div>
                 ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                       {pendingRequests.map((req: any) => (
                          <div key={req.id} className="border border-slate-100 dark:border-white/10 rounded-3xl p-6 hover:border-primary-light transition-all bg-slate-50 dark:bg-black/20 group">
                             <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-primary-light/10 text-primary-light flex items-center justify-center">
                                      <User size={20} />
                                   </div>
                                   <div>
                                      <p className="font-bold text-slate-900 dark:text-white">{req.client?.fullName}</p>
                                      <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Star size={10} className="fill-current text-amber-500" /> 4.9</p>
                                   </div>
                                </div>
                                <p className="text-lg font-black text-primary-light">TZS {parseFloat(req.totalFare).toLocaleString()}</p>
                             </div>
                             
                             <div className="space-y-4 mb-6">
                                <div className="flex gap-3">
                                   <MapPin size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                   <p className="text-xs font-bold text-slate-600 dark:text-slate-400 line-clamp-1">From: {req.pickupAddress}</p>
                                </div>
                                <div className="flex gap-3">
                                   <Navigation size={16} className="text-primary-light mt-1 flex-shrink-0" />
                                   <p className="text-xs font-bold text-slate-600 dark:text-slate-400 line-clamp-1">To: {req.destinationAddress}</p>
                                </div>
                             </div>

                             <div className="flex gap-3">
                                <button 
                                  onClick={() => handleStatusUpdate(req.id, 'accepted')}
                                  className="flex-1 py-3 bg-primary-light text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform"
                                >
                                   Accept
                                </button>
                                <button className="px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                   <XCircle size={18} className="text-slate-400" />
                                </button>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
            )}

            {/* Map Component */}
            <div className="h-[500px] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl relative">
               <MapComponent 
                 className="h-full w-full" 
                 activeRiderCoords={location || undefined}
                 pickupCoords={activeRide ? [parseFloat(activeRide.pickupLat), parseFloat(activeRide.pickupLng)] : undefined}
                 destinationCoords={activeRide ? [parseFloat(activeRide.destinationLat), parseFloat(activeRide.destinationLng)] : undefined}
               />
               <div className="absolute top-6 left-6 z-10 glass px-4 py-2 rounded-xl border border-white/20 shadow-lg">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">Live Location Tracking</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-300">You are visible to passengers near you</p>
               </div>
            </div>
          </div>

          {/* Right Sidebar: Quick Actions & News */}
          <div className="space-y-8">
             <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-green-500/20">
                <Shield size={40} className="mb-4 opacity-80" />
                <h3 className="text-xl font-black mb-2">Safe Rider Badge</h3>
                <p className="text-green-50 text-sm font-medium mb-6">You've completed 50 rides without any safety issues. Keep it up!</p>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                   <div className="bg-white h-full w-[85%]" />
                </div>
                <p className="text-[10px] font-black uppercase mt-2 text-white/70">85/100 to next level</p>
             </div>

             <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Service Area</h3>
                <div className="space-y-4">
                   {['Posta & City Center', 'Kinondoni', 'Sinza', 'Mikocheni'].map((area, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{area}</span>
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase">High Demand</span>
                      </div>
                   ))}
                </div>
                <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-primary-light hover:text-primary-light transition-all">
                   View Heatmap
                </button>
             </div>
          </div>

        </div>
      </div>
    </CombinedNav>
  );
};

export default RiderDashboard;

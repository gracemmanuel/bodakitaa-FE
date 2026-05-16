import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_RIDER_VEHICLE } from '../../api/queries';
import { 
  Bike, Settings, Wrench, Fuel, Shield, 
  ChevronRight, AlertTriangle, CheckCircle2,
  Calendar, MapPin, Gauge, Droplet, FileText
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import gsap from 'gsap';

const RiderVehiclePage: React.FC = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role || 'rider';

  const { data, loading } = useQuery(GET_RIDER_VEHICLE, {
    fetchPolicy: 'cache-and-network',
  });

  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!loading && data) {
      gsap.fromTo(contentRef.current?.children || [], 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading, data]);

  const vehicle = data?.myVehicle;
  const fuelLogs = data?.myFuelLogs || [];

  return (
    <CombinedNav role={role as any}>
      <div className="max-w-7xl mx-auto space-y-8" ref={contentRef}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Vehicle</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Vehicle status, fuel tracking, and maintenance</p>
          </div>
          <div className="flex gap-3">
             <button className="px-5 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                <Wrench size={16} /> Report Issue
             </button>
          </div>
        </div>

        {/* Vehicle Overview Card */}
        {!vehicle && !loading ? (
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-primary-light/5 blur-3xl rounded-full translate-y-1/2" />
            <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 relative z-10">
              <Bike size={48} />
            </div>
            <div className="space-y-2 relative z-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">No Assigned Vehicle</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {role === 'employed_rider' 
                  ? "Your fleet manager hasn't assigned a motorcycle to you yet. Please contact your boss to get started." 
                  : "You haven't registered a vehicle yet. Please add your motorcycle to start tracking maintenance and fuel."}
              </p>
            </div>
            {role === 'rider' && (
              <button className="px-8 py-4 bg-primary-light text-white rounded-2xl font-black shadow-lg shadow-primary-light/30 hover:scale-105 transition-all relative z-10">
                Register My Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-primary-light/5 rounded-bl-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                 
                 <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="w-full md:w-64 h-48 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center relative overflow-hidden border border-slate-200 dark:border-white/10">
                       <Bike size={80} className="text-primary-light/40" />
                       <div className="absolute bottom-4 left-4 bg-primary-light text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {vehicle?.plateNumber || 'N/A'}
                       </div>
                    </div>
  
                    <div className="flex-1 space-y-6">
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <h2 className="text-3xl font-black text-slate-900 dark:text-white">{vehicle?.make || 'Honda'} {vehicle?.modelName || 'BM 150'}</h2>
                             <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-black uppercase tracking-widest border border-green-500/20">
                                {vehicle?.status || 'Active'}
                             </span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">Assigned on <span className="font-bold text-slate-700 dark:text-slate-200">{vehicle?.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'}</span></p>
                       </div>
  
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Gauge size={12} /> Odometer</p>
                             <p className="text-lg font-black text-slate-900 dark:text-white">{vehicle?.odometerKm || '0'} km</p>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Droplet size={12} /> Fuel Type</p>
                             <p className="text-lg font-black text-slate-900 dark:text-white capitalize">{vehicle?.fuelType || 'Petrol'}</p>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={12} /> Year</p>
                             <p className="text-lg font-black text-slate-900 dark:text-white">{vehicle?.year || '2023'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
  
            {/* Maintenance Status */}
            <div className="lg:col-span-1">
               <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 h-full shadow-xl">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                     <Settings size={22} className="text-primary-light" /> Health Check
                  </h3>
  
                  <div className="space-y-6">
                     <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vehicle?.maintenanceStatus === 'Good' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              <CheckCircle2 size={20} />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Engine</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{vehicle?.maintenanceStatus === 'Good' ? 'Normal Performance' : 'Check Required'}</p>
                           </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${vehicle?.maintenanceStatus === 'Good' ? 'text-green-500' : 'text-red-500'}`}>{vehicle?.maintenanceStatus === 'Good' ? 'Optimal' : 'Issues'}</span>
                     </div>
  
                     <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vehicle?.lastOilChangeKm < 1500 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                              <Droplet size={20} />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Oil Level</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Last change: {vehicle?.lastOilChangeKm?.toFixed(0)} km ago</p>
                           </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${vehicle?.lastOilChangeKm < 1500 ? 'text-green-500' : 'text-amber-500'}`}>{vehicle?.lastOilChangeKm < 1500 ? 'Good' : 'Check Soon'}</span>
                     </div>
  
                     <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vehicle?.daysToInsuranceExpiry > 30 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              <Shield size={20} />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Insurance</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Expires in {vehicle?.daysToInsuranceExpiry} days</p>
                           </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${vehicle?.daysToInsuranceExpiry > 30 ? 'text-blue-500' : 'text-red-500'}`}>{vehicle?.daysToInsuranceExpiry > 30 ? 'Valid' : 'Near Expiry'}</span>
                     </div>
                  </div>
  
                  <button className="w-full mt-8 py-4 bg-slate-900 dark:bg-white/10 text-white font-black text-sm rounded-2xl hover:bg-primary-light transition-all">
                     View Full Logs
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Bottom Grid: Fuel Logs & Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Fuel History */}
           <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Fuel size={22} className="text-primary-light" /> Fuel History
                 </h3>
                 <button className="text-primary-light font-bold text-xs uppercase tracking-widest flex items-center gap-1 hover:underline">
                    <Droplet size={14} /> Log Refill
                 </button>
              </div>

              <div className="space-y-4">
                 {fuelLogs.length === 0 ? (
                    <div className="py-12 text-center">
                       <p className="text-slate-400 text-sm font-medium">No fuel logs recorded yet.</p>
                    </div>
                 ) : fuelLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                             <Droplet size={18} />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 dark:text-white">{log.litersAdded} Liters</p>
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(log.refilledAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-slate-900 dark:text-white">TZS {log.totalCostTzs?.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">@{log.odometerAtFillKm} km</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Documents */}
           <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                 <FileText size={22} className="text-primary-light" /> Documents
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-primary-light/30 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <FileText size={24} className="text-blue-500" />
                    </div>
                    <h4 className="font-black text-slate-900 dark:text-white mb-1">Registration Card</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Logbook Copy</p>
                 </div>

                 <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-primary-light/30 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <Shield size={24} className="text-green-500" />
                    </div>
                    <h4 className="font-black text-slate-900 dark:text-white mb-1">Insurance Policy</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Valid until Dec 2024</p>
                 </div>
              </div>

              <div className="mt-8 p-6 bg-primary-light/5 border border-primary-light/20 rounded-3xl flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary-light/10 text-primary-light rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    <AlertTriangle size={24} />
                 </div>
                 <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm">Upcoming Inspection</h4>
                    <p className="text-xs text-slate-500 font-medium">Your vehicle is due for government inspection in {vehicle?.daysToInspection || 0} days. Please coordinate with your owner.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </CombinedNav>
  );
};

export default RiderVehiclePage;

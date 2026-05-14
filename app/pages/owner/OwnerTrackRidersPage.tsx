import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ALL_RIDERS } from '../../api/queries';
import { 
  Users, MapPin, Search, Filter, 
  Navigation, Bike, Clock, Phone,
  ChevronRight, AlertCircle
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import MapComponent from '../../components/MapComponent';
import gsap from 'gsap';

const OwnerTrackRidersPage: React.FC = () => {
  const { data, loading } = useQuery(GET_ALL_RIDERS, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 10000, // Poll every 10 seconds for locations
  });

  const riders = data?.allRiders || [];
  const activeRiders = riders.filter((r: any) => r.assignedVehicle);
  
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRiders = riders.filter((r: any) => 
    r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.assignedVehicle?.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CombinedNav role="owner">
      <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 p-4 md:p-8">
        {/* Left Sidebar: Rider List */}
        <div className="w-full lg:w-96 flex flex-col gap-6 h-full">
           <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-xl flex flex-col h-full overflow-hidden">
              <div className="mb-6">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Live Fleet</h2>
                 <p className="text-sm text-slate-500 font-medium">{activeRiders.length} Riders currently on road</p>
              </div>

              <div className="relative mb-6">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search rider or plate..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:border-primary-light transition-all"
                 />
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                 {filteredRiders.length === 0 ? (
                    <div className="py-12 text-center">
                       <Users size={40} className="mx-auto text-slate-300 mb-2" />
                       <p className="text-slate-500 text-sm font-bold">No riders found</p>
                    </div>
                 ) : filteredRiders.map((rider: any) => (
                    <div 
                       key={rider.id}
                       onClick={() => setSelectedRider(rider)}
                       className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                        selectedRider?.id === rider.id 
                           ? 'bg-primary-light/10 border-primary-light shadow-lg' 
                           : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-primary-light/30'
                       }`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                             rider.assignedVehicle ? 'bg-green-500/10 text-green-500' : 'bg-slate-100 dark:bg-white/10 text-slate-400'
                          }`}>
                             {rider.fullName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-black text-slate-900 dark:text-white truncate">{rider.fullName}</h4>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                   {rider.assignedVehicle?.plateNumber || 'Unassigned'}
                                </span>
                                {rider.assignedVehicle && (
                                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                )}
                             </div>
                          </div>
                          <ChevronRight size={16} className={`transition-transform ${selectedRider?.id === rider.id ? 'translate-x-1' : 'text-slate-300'}`} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Section: Map & Detail Overlay */}
        <div className="flex-1 h-full relative group">
           <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl relative">
              <MapComponent className="w-full h-full" />
              
              {/* Map Controls Overlay */}
              <div className="absolute top-6 right-6 z-[400] flex flex-col gap-3">
                 <button className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:scale-105 transition-all">
                    <Navigation size={20} />
                 </button>
                 <button className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:scale-105 transition-all">
                    <Filter size={20} />
                 </button>
              </div>

              {/* Selected Rider Detail Card */}
              {selectedRider && (
                 <div className="absolute bottom-6 left-6 right-6 z-[400] bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-6 items-center animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center gap-6 flex-1 w-full">
                       <div className="w-20 h-20 rounded-3xl bg-primary-light/10 flex items-center justify-center text-primary-light">
                          <img 
                             src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRider.fullName}`} 
                             className="w-16 h-16 rounded-2xl"
                             alt="avatar"
                          />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                             <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedRider.fullName}</h3>
                             <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-md text-[10px] font-black uppercase tracking-widest border border-green-500/20">Active Now</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                             <div className="flex items-center gap-2">
                                <Bike size={16} className="text-primary-light" />
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plate</p>
                                   <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedRider.assignedVehicle?.plateNumber || 'N/A'}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <Clock size={16} className="text-blue-500" />
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Online</p>
                                   <p className="text-sm font-bold text-slate-700 dark:text-slate-200">4h 22m</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <Navigation size={16} className="text-purple-500" />
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Job</p>
                                   <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Ride to Posta</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <Phone size={16} className="text-green-500" />
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</p>
                                   <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedRider.phone}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                       <button className="flex-1 md:flex-none px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all">
                          Message
                       </button>
                       <button 
                          onClick={() => setSelectedRider(null)}
                          className="p-4 bg-slate-100 dark:bg-white/10 text-slate-400 rounded-2xl hover:text-slate-900 dark:hover:text-white transition-all"
                       >
                          <AlertCircle size={24} />
                       </button>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </CombinedNav>
  );
};

export default OwnerTrackRidersPage;

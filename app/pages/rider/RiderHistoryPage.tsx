import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_RIDE_HISTORY } from '../../api/queries';
import { 
  History, Navigation, MapPin, Calendar, 
  ChevronRight, Search, Filter, Star,
  Clock, CreditCard, CheckCircle2, XCircle
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import gsap from 'gsap';

const RiderHistoryPage: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const { data, loading } = useQuery(GET_RIDE_HISTORY, {
    variables: { page, pageSize },
    fetchPolicy: 'cache-and-network',
  });

  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!loading && data) {
      gsap.fromTo(listRef.current?.children || [], 
        { x: -30, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.2)" }
      );
    }
  }, [loading, data]);

  const rides = data?.rideHistory?.rides || [];

  return (
    <CombinedNav role="rider">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Ride History</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Review your past trips and client interactions</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search destination..." 
                 className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary-light outline-none transition-all font-medium text-sm"
               />
            </div>
            <button className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
               <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Ride List */}
        <div className="space-y-4" ref={listRef}>
          {loading && rides.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
               <p className="font-bold text-slate-500 animate-pulse uppercase tracking-widest text-xs">Loading trips history...</p>
             </div>
          ) : rides.length === 0 ? (
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-20 text-center">
               <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <History size={48} className="text-slate-300" />
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No rides recorded</h3>
               <p className="text-slate-500 max-w-sm mx-auto">You haven't completed any rides yet. Go online and start accepting requests!</p>
            </div>
          ) : rides.map((ride: any) => (
            <div key={ride.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
               
               <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                  {/* Left: Info */}
                  <div className="flex-[2] space-y-4">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          ride.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                           {ride.status === 'completed' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-900 dark:text-white">Ride #{ride.id}</h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                ride.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {ride.status}
                              </span>
                           </div>
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                              {new Date(ride.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                           </p>
                        </div>
                     </div>

                     <div className="space-y-3 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5">
                        <div className="flex gap-4 items-start relative z-10">
                           <div className="w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-400 border-2 border-white dark:border-slate-900 mt-1" />
                           <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{ride.pickup}</p>
                        </div>
                        <div className="flex gap-4 items-start relative z-10">
                           <div className="w-4 h-4 rounded-full bg-primary-light border-2 border-white dark:border-slate-900 mt-1" />
                           <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{ride.destination}</p>
                        </div>
                     </div>
                  </div>

                  {/* Right: Metrics */}
                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-1 gap-4 lg:border-l lg:border-slate-100 lg:dark:border-white/5 lg:pl-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                           <CreditCard size={12} /> Earnings
                        </p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">TZS {ride.amount?.toLocaleString()}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                           <Navigation size={12} /> Distance
                        </p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{ride.distance} km</p>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center items-end border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/5 pt-4 lg:pt-0 lg:pl-8">
                     <div className="flex items-center gap-2 mb-4">
                        <div className="text-right">
                           <p className="text-sm font-black text-slate-900 dark:text-white">Client Rated</p>
                           <div className="flex items-center gap-0.5 text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className={i < 4 ? "fill-current" : "opacity-30"} />
                              ))}
                           </div>
                        </div>
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Client${ride.id}`} 
                          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border-2 border-white dark:border-white/10" 
                          alt="client" 
                        />
                     </div>
                     <button className="w-full lg:w-auto px-4 py-2 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-900 hover:text-white dark:hover:bg-primary-light transition-all flex items-center justify-center gap-2">
                        Details <ChevronRight size={14} />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Pagination placeholder */}
        {rides.length > 0 && (
           <div className="flex justify-center items-center gap-4 py-8">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 disabled:opacity-20" disabled>
                 <ChevronRight className="rotate-180" size={20} />
              </button>
              <span className="font-black text-sm text-slate-900 dark:text-white">Page 1</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                 <ChevronRight size={20} />
              </button>
           </div>
        )}
      </div>
    </CombinedNav>
  );
};

export default RiderHistoryPage;

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Calendar, Search, Filter, 
  MoreHorizontal, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, Activity, Star
} from 'lucide-react';
import CombinedNav from '../components/CombinedNav';
import { graphqlClient } from '../api';

// --- Types ---
interface Ride {
  id: string;
  pickup_address: string;
  destination_address: string;
  status: string;
  base_fare: string;
  created_at: string;
  driver?: {
    user: {
      fullName: string;
    }
  }
}

const ClientRidesPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ridesPerPage = 8;

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const query = `
          query {
            myRides {
              id
              pickup_address
              destination_address
              status
              base_fare
              created_at
              driver {
                user {
                  fullName
                }
              }
            }
          }
        `;
        const data = await graphqlClient(query);
        setRides(data.myRides);
      } catch (error) {
        console.error("Failed to fetch rides:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRides();
  }, []);

  // Pagination logic
  const indexOfLastRide = currentPage * ridesPerPage;
  const indexOfFirstRide = indexOfLastRide - ridesPerPage;
  const currentRides = rides.slice(indexOfFirstRide, indexOfLastRide);
  const totalPages = Math.ceil(rides.length / ridesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
    }
  };

  return (
    <CombinedNav role="client">
      <div className="max-w-7xl mx-auto space-y-8 w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              My Rides
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              View and manage all your past and ongoing journeys.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search rides..." 
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary-light w-full transition-all"
              />
            </div>
            <button className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Rides List Section */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Journey Details</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Driver</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Fare</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6">
                        <div className="h-12 bg-slate-100 dark:bg-white/5 rounded-2xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : currentRides.length > 0 ? (
                  currentRides.map((ride) => (
                    <tr key={ride.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{ride.pickup_address}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary-light" />
                            <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{ride.destination_address}</p>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-5">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ride.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(ride.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {ride.driver ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-light/10 text-primary-light flex items-center justify-center font-bold text-xs border border-primary-light/20">
                              {ride.driver.user.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{ride.driver.user.fullName}</p>
                              <div className="flex items-center gap-1 text-[10px] text-amber-500">
                                <Star size={10} className="fill-current" />
                                <span className="font-bold">4.8</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">Searching...</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-slate-900 dark:text-white">TZS {parseFloat(ride.base_fare).toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Cash Payment</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(ride.status)}`}>
                          {ride.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-slate-400 hover:text-primary-light hover:bg-primary-light/10 rounded-xl transition-all">
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <Activity size={48} strokeWidth={1} />
                        <p className="text-lg font-bold">No rides found.</p>
                        <p className="text-sm font-medium">Your journey history will appear here once you take a ride.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!isLoading && rides.length > 0 && (
            <div className="px-8 py-6 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-900 dark:text-white">{indexOfFirstRide + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(indexOfLastRide, rides.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{rides.length}</span> rides
              </p>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-light hover:text-white hover:border-primary-light'}`}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === i + 1 ? 'bg-primary-light text-white shadow-lg shadow-primary-light/30' : 'hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-light hover:text-white hover:border-primary-light'}`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </CombinedNav>
  );
};

export default ClientRidesPage;

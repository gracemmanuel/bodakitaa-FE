import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bike, Users, Search, Plus, Filter, MoreHorizontal, Wrench, ChevronRight } from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import { graphqlClient } from '../../api';

interface BikeData {
  id: string;
  modelName: string;
  plateNumber: string;
  year: number;
  status: string;
  todayEarnings: number;
  targetEarnings: number;
  maintenanceStatus: string;
  assignedRider: { fullName: string } | null;
}

const OwnerFleetPage: React.FC = () => {
  const { t } = useTranslation();
  const [bikes, setBikes] = useState<BikeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFleet = async () => {
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
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const filteredBikes = bikes.filter(b => 
    b.plateNumber.toLowerCase().includes(search.toLowerCase()) || 
    b.modelName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CombinedNav role="owner">
      <div className="max-w-7xl mx-auto space-y-8 w-full pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Fleet Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Manage your motorcycles, track maintenance, and assignments.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col relative min-h-[400px]">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-transparent">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by plate or model..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary-light w-full lg:w-64 transition-colors" 
                  />
                </div>
                <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-2 text-sm font-bold bg-white dark:bg-black/50 hover:bg-slate-50 dark:hover:bg-white/5 whitespace-nowrap">
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Rider</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">Loading fleet...</td>
                  </tr>
                ) : filteredBikes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No vehicles found.</td>
                  </tr>
                ) : (
                  filteredBikes.map((bike) => (
                    <tr key={bike.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 dark:text-slate-500">
                            <Bike size={24} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">{bike.plateNumber}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{bike.modelName} • {bike.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {bike.assignedRider ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-light/20 text-primary-light flex items-center justify-center font-bold text-xs">
                              {bike.assignedRider.fullName.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{bike.assignedRider.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-500">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${bike.status.toLowerCase() === 'active' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30' :
                            bike.status.toLowerCase() === 'maintenance' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30' :
                              'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                          }`}>
                          {bike.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-slate-400 hover:text-primary-light hover:bg-primary-light/10 rounded-lg transition-colors">
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CombinedNav>
  );
};

export default OwnerFleetPage;

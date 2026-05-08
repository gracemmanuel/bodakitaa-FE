import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Search, Filter, Phone, Star, ChevronRight, Activity } from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import { graphqlClient } from '../../api';

interface RiderData {
  id: string;
  fullName: string;
  phone: string;
  rating: number;
}

const OwnerRidersPage: React.FC = () => {
  const { t } = useTranslation();
  const [riders, setRiders] = useState<RiderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRiders = async () => {
    try {
      const query = `
        query {
          myRiders {
            id
            fullName
            phone
            rating
          }
        }
      `;
      const data = await graphqlClient(query);
      if (data && data.myRiders) {
        setRiders(data.myRiders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const filteredRiders = riders.filter(r => 
    r.fullName.toLowerCase().includes(search.toLowerCase()) || 
    r.phone.includes(search)
  );

  return (
    <CombinedNav role="owner">
      <div className="max-w-7xl mx-auto space-y-8 w-full pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Riders Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Oversee the performance and details of your assigned riders.
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
                    placeholder="Search by name or phone..." 
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rider Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">Loading riders...</td>
                  </tr>
                ) : filteredRiders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No riders assigned to your vehicles.</td>
                  </tr>
                ) : (
                  filteredRiders.map((rider) => (
                    <tr key={rider.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary-light/20 text-primary-light flex items-center justify-center font-black text-lg">
                            {rider.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">{rider.fullName}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">ID: {rider.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Phone size={16} />
                          <span className="text-sm font-medium">{rider.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-amber-500 fill-amber-500" />
                          <span className="text-sm font-black text-slate-900 dark:text-white">{rider.rating.toFixed(1)}</span>
                        </div>
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

export default OwnerRidersPage;

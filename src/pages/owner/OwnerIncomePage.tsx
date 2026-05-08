import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_OWNER_STATS, GET_RIDER_WALLET } from '../../api/queries';
import { 
  DollarSign, TrendingUp, ArrowUpRight, ArrowDownLeft, 
  Clock, Filter, Download, Wallet, PieChart,
  ChevronRight, Calendar, Banknote
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import gsap from 'gsap';

const OwnerIncomePage: React.FC = () => {
  const { data: statsData, loading: statsLoading } = useQuery(GET_OWNER_STATS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: walletData, loading: walletLoading } = useQuery(GET_RIDER_WALLET, {
    fetchPolicy: 'cache-and-network',
  });

  const stats = statsData?.ownerStats;
  const wallet = walletData?.myWallet;
  const transactions = walletData?.myTransactions || [];

  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!statsLoading && stats) {
      gsap.fromTo(listRef.current?.children || [], 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [statsLoading, stats]);

  return (
    <CombinedNav role="owner">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Fleet Income & Finance</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor revenue, expenses, and fleet-wide financial health</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
              <Calendar size={16} /> Last 30 Days
            </button>
            <button className="px-4 py-2 bg-primary-light text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-primary-light/20 hover:scale-105 transition-all">
              <Download size={16} /> Financial Report
            </button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary-light/10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                 <div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 mb-6">
                       <Wallet size={24} className="text-primary-light" />
                    </div>
                    <p className="text-white/60 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                    <h2 className="text-4xl font-black tracking-tighter">
                       <span className="text-primary-light text-xl mr-1">TZS</span>
                       {wallet?.balanceTzs?.toLocaleString() || '0'}
                    </h2>
                 </div>
                 <div className="mt-8 flex gap-3">
                    <button className="flex-1 py-3 bg-primary-light text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary-light/20 hover:scale-105 transition-all">
                       Withdraw
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
                    <TrendingUp size={24} />
                 </div>
                 <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+18.2%</span>
              </div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1">TZS {stats?.totalFleetRevenue?.toLocaleString() || '0'}</h4>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Fleet Revenue Today</p>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs text-slate-400">
                 <Clock size={14} /> Updated recently
              </div>
           </div>

           <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <PieChart size={24} />
                 </div>
                 <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">{stats?.activeRiders || 0} Riders</span>
              </div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1">TZS {((stats?.totalFleetRevenue || 0) / (stats?.activeRiders || 1)).toLocaleString()}</h4>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg. Earning Per Bike</p>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs text-slate-400">
                 <Banknote size={14} /> Daily average
              </div>
           </div>
        </div>

        {/* Revenue Chart Section */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
           <div className="flex justify-between items-center mb-10">
              <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white">Revenue Analytics</h3>
                 <p className="text-slate-500 text-sm font-medium">Performance over the last 7 days</p>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10">
                    <div className="w-3 h-3 bg-primary-light rounded-full" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Revenue</span>
                 </div>
              </div>
           </div>

           <div className="h-64 flex items-end gap-3 sm:gap-6">
              {(stats?.revenueData || [20, 35, 25, 45, 30, 60, 40]).map((val: number, i: number) => (
                 <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div className="w-full bg-slate-100 dark:bg-white/5 rounded-t-2xl absolute bottom-0 h-[100%]" />
                    <div 
                       className="w-full bg-gradient-to-t from-primary-dark to-primary-light rounded-t-2xl relative z-10 transition-all duration-700 group-hover:opacity-80"
                       style={{ height: `${(val / 80000) * 100}%` }}
                    >
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                          TZS {val.toLocaleString()}
                       </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-4 uppercase tracking-widest">
                       {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                 </div>
              ))}
           </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial History</h3>
            <button className="text-primary-light font-bold text-sm hover:underline">View All Records</button>
          </div>

          <div ref={listRef} className="space-y-4">
            {transactions.length === 0 ? (
              <div className="bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl p-20 text-center">
                 <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign size={40} className="text-slate-300" />
                 </div>
                 <h4 className="text-slate-900 dark:text-white font-black text-lg">No history available</h4>
                 <p className="text-slate-500 text-sm">Fleet-wide financial activities will appear here.</p>
              </div>
            ) : transactions.map((tx: any) => {
              const isCredit = tx.transactionType === 'ride_earning' || tx.transactionType === 'top_up';
              return (
                <div key={tx.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 hover:border-primary-light/30 transition-all cursor-pointer group shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                      isCredit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {isCredit ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-lg font-black text-slate-900 dark:text-white truncate">
                          {tx.transactionType.replace('_', ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())}
                        </h5>
                        <p className={`text-xl font-black ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                          {isCredit ? '+' : '-'} {tx.amountTzs?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-slate-500 dark:text-slate-400 font-medium truncate pr-10">{tx.description || 'Processed via BodaKitaa Payments'}</p>
                        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter text-[10px]">
                           {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CombinedNav>
  );
};

export default OwnerIncomePage;

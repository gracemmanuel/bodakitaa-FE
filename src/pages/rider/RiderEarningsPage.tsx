import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_RIDER_WALLET, GET_RIDER_STATS } from '../../api/queries';
import { 
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, 
  Clock, Filter, Download, DollarSign, PieChart,
  ChevronRight, Calendar
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import gsap from 'gsap';

const RiderEarningsPage: React.FC = () => {
  const { data, loading, error } = useQuery(GET_RIDER_WALLET, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: statsData } = useQuery(GET_RIDER_STATS, {
    fetchPolicy: 'cache-and-network',
  });

  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!loading && data) {
      gsap.fromTo(listRef.current?.children || [], 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading, data]);

  const wallet = data?.myWallet;
  const transactions = data?.myTransactions || [];
  const riderStats = statsData?.riderStats;

  return (
    <CombinedNav role="rider">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Earnings & Wallet</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your income and view transaction history</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
              <Calendar size={16} /> Last 30 Days
            </button>
            <button className="px-4 py-2 bg-primary-light text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-primary-light/20 hover:scale-105 transition-all">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Balance Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10">
                    <Wallet size={24} className="text-primary-light" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    BodaWallet Premium
                  </div>
                </div>
                <p className="text-white/60 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                <h2 className="text-5xl font-black tracking-tighter">
                  <span className="text-primary-light text-2xl mr-2">TZS</span>
                  {wallet?.balanceTzs?.toLocaleString() || '0'}
                </h2>
              </div>
              <div className="relative z-10 grid grid-cols-2 gap-4 mt-12">
                <button className="py-4 bg-primary-light text-white font-black rounded-2xl shadow-xl shadow-primary-light/30 hover:bg-primary-light/90 transition-all flex items-center justify-center gap-2">
                   Withdraw
                </button>
                <button className="py-4 bg-white/10 backdrop-blur-md text-white font-black rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                   Transfer
                </button>
              </div>
            </div>
          </div>

          {/* Quick Analytics Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
                   <TrendingUp size={24} />
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+12.5%</span>
              </div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1">TZS {riderStats?.weeklyTotal?.toLocaleString() || '0'}</h4>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Net Income this Week</p>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs text-slate-400">
                 <Clock size={14} /> Updated recently
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                   <PieChart size={24} />
                </div>
                <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">{riderStats?.tripsCompleted || 0} Rides</span>
              </div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1">TZS {riderStats?.avgEarningPerRide?.toLocaleString() || '0'}</h4>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg. Earning Per Ride</p>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs text-slate-400">
                 <Filter size={14} /> Across all ride types
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Transactions</h3>
            <button className="text-primary-light font-bold text-sm hover:underline">View All</button>
          </div>

          <div ref={listRef} className="space-y-4">
            {transactions.length === 0 ? (
              <div className="bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl p-20 text-center">
                 <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign size={40} className="text-slate-300" />
                 </div>
                 <h4 className="text-slate-900 dark:text-white font-black text-lg">No transactions yet</h4>
                 <p className="text-slate-500 text-sm">Your financial activities will appear here.</p>
              </div>
            ) : transactions.map((tx: any) => {
              const isCredit = tx.transactionType === 'ride_earning' || tx.transactionType === 'top_up' || tx.transactionType === 'refund';
              return (
                <div key={tx.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 hover:border-primary-light/30 transition-all cursor-pointer group">
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
                        <p className="text-slate-500 dark:text-slate-400 font-medium truncate pr-10">{tx.description || 'Transaction completed successfully'}</p>
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

export default RiderEarningsPage;

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_OWNER_STATS } from '../../api/queries';
import { 
  FileText, Download, BarChart2, Calendar, 
  Search, Filter, ChevronRight, FileSpreadsheet,
  TrendingUp, Users, Bike, DollarSign
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import gsap from 'gsap';

const OwnerReportsPage: React.FC = () => {
  const { data, loading } = useQuery(GET_OWNER_STATS);
  const stats = data?.ownerStats;

  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!loading && stats) {
      gsap.fromTo(contentRef.current?.children || [], 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading, stats]);

  const reportTypes = [
    { title: 'Fleet Performance', description: 'Monthly revenue, trips, and uptime analysis.', icon: BarChart2, color: 'text-blue-500' },
    { title: 'Financial Statements', description: 'Tax reports, payout history, and expense logs.', icon: DollarSign, color: 'text-green-500' },
    { title: 'Rider Behavior', description: 'Safety scores, rating trends, and violation logs.', icon: Users, color: 'text-purple-500' },
    { title: 'Vehicle Health', description: 'Maintenance history and fuel efficiency logs.', icon: Bike, color: 'text-amber-500' },
  ];

  return (
    <CombinedNav role="owner">
      <div className="max-w-7xl mx-auto space-y-8 w-full pb-12" ref={contentRef}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Analytical Reports</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Generate and export detailed insights of your business</p>
          </div>
          <div className="flex gap-3">
             <button className="px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
                <Calendar size={18} /> Schedule Report
             </button>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {reportTypes.map((report, idx) => (
              <div key={idx} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:border-primary-light/30 transition-all cursor-pointer group shadow-xl">
                 <div className={`w-14 h-14 rounded-2xl ${report.color.replace('text-', 'bg-').replace('500', '500/10')} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <report.icon size={28} className={report.color} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{report.title}</h3>
                 <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">{report.description}</p>
                 <button className="flex items-center gap-2 text-primary-light text-xs font-black uppercase tracking-widest hover:underline">
                    Generate <ChevronRight size={14} />
                 </button>
              </div>
           ))}
        </div>

        {/* Generated Reports Table */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
           <div className="p-8 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-transparent">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Exports</h3>
              <div className="flex gap-3">
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search reports..." className="pl-9 pr-4 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary-light" />
                 </div>
                 <button className="p-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400">
                    <Filter size={18} />
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 dark:bg-white/5">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Name</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Generated</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Download</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {[
                       { name: 'Monthly_Revenue_April_2024.pdf', type: 'PDF', date: 'May 02, 2024', size: '2.4 MB' },
                       { name: 'Fleet_Maintenance_Q1.xlsx', type: 'Excel', date: 'Apr 28, 2024', size: '840 KB' },
                       { name: 'Rider_Performance_Summary.pdf', type: 'PDF', date: 'Apr 15, 2024', size: '1.8 MB' },
                       { name: 'Payout_Receipts_Fleet.zip', type: 'Archive', date: 'Apr 10, 2024', size: '12.5 MB' },
                    ].map((file, i) => (
                       <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:bg-primary-light/10 group-hover:text-primary-light transition-colors">
                                   {file.type === 'Excel' ? <FileSpreadsheet size={20} /> : <FileText size={20} />}
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-200">{file.name}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-xs font-black text-slate-400 uppercase">{file.type}</span>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-xs font-bold text-slate-500">{file.date}</span>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-xs font-bold text-slate-500">{file.size}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary-light transition-colors">
                                <Download size={20} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Quick Insight Alert */}
        <div className="bg-primary-light/5 border border-primary-light/20 rounded-[2.5rem] p-8 flex items-center gap-8 shadow-inner">
           <div className="w-20 h-20 bg-primary-light/10 rounded-[2rem] flex items-center justify-center text-primary-light animate-pulse">
              <TrendingUp size={40} />
           </div>
           <div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Performance Boost</h4>
              <p className="text-slate-500 font-medium leading-relaxed mt-1">Your fleet revenue increased by <span className="text-green-500 font-black">12.5%</span> compared to last month. Consider adding more bikes to the <span className="font-bold text-slate-700 dark:text-slate-200">Posta-Kariakoo</span> route to maximize earnings.</p>
           </div>
        </div>
      </div>
    </CombinedNav>
  );
};

export default OwnerReportsPage;

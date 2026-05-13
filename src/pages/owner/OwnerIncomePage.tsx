import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_OWNER_STATS, GET_RECEIVED_SUBMISSIONS, GET_MY_WALLET, GET_MY_EXPENSES, GET_MY_TRANSACTIONS } from '../../api/queries';
import { PROCESS_SUBMISSION, RECORD_EXPENSE } from '../../api/mutations';
import { 
  DollarSign, TrendingUp, ArrowUpRight, ArrowDownLeft, 
  Clock, Filter, Download, Wallet, PieChart,
  ChevronRight, Calendar, Banknote, CheckCircle2, XCircle, 
  AlertCircle, MessageSquare, User, History, Plus, FileText, Settings, Eye
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import gsap from 'gsap';

const OwnerIncomePage: React.FC = () => {
  const [activeView, setActiveView] = useState<'all' | 'income' | 'expenses' | 'pending'>('all');
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [comment, setComment] = useState('');

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    category: 'maintenance',
    amount_tzs: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const { data: statsData } = useQuery(GET_OWNER_STATS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: submissionsData, loading: subLoading, refetch: refetchSubs } = useQuery(GET_RECEIVED_SUBMISSIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: expensesData, refetch: refetchExps } = useQuery(GET_MY_EXPENSES, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: transactionsData, refetch: refetchTrans } = useQuery(GET_MY_TRANSACTIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: walletData, refetch: refetchWallet } = useQuery(GET_MY_WALLET);

  const [processSubmission, { loading: processing }] = useMutation(PROCESS_SUBMISSION, {
    onCompleted: (data) => {
      if (data.processSubmission.success) {
        refetchSubs();
        refetchWallet();
        refetchTrans();
        setSelectedSub(null);
        setComment('');
      } else {
        alert(data.processSubmission.message);
      }
    }
  });

  const [recordExpense, { loading: expRecording }] = useMutation(RECORD_EXPENSE, {
    onCompleted: (data) => {
      if (data.recordExpense.success) {
        refetchExps();
        refetchWallet();
        refetchTrans();
        setIsExpenseOpen(false);
        setExpenseForm({
            category: 'maintenance',
            amount_tzs: '',
            description: '',
            expense_date: new Date().toISOString().split('T')[0]
        });
      } else {
        alert(data.recordExpense.message);
      }
    }
  });

  const stats = statsData?.ownerStats;
  const wallet = walletData?.myWallet;
  const submissions = submissionsData?.receivedSubmissions || [];
  const expenses = expensesData?.myExpenses || [];
  const transactions = transactionsData?.myTransactions || [];

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordExpense({
      variables: {
        input: {
          category: expenseForm.category,
          amountTzs: parseFloat(expenseForm.amount_tzs),
          description: expenseForm.description,
          expenseDate: expenseForm.expense_date
        }
      }
    });
  };

  const combinedHistory = [
    ...submissions.map((s: any) => ({ ...s, type: 'income', category: 'Manual Submission', date: s.submissionDate })),
    ...expenses.map((e: any) => ({ ...e, type: 'expense', date: e.expenseDate })),
    ...transactions.map((t: any) => ({ ...t, type: 'income', category: t.transactionType, date: t.createdAt.split('T')[0] }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <CombinedNav role="owner">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Fleet Financials</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Automatic trip earnings, manual submissions, and expense tracking.</p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => setIsExpenseOpen(true)}
                className="px-6 py-4 bg-red-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-red-500/20 hover:scale-105 transition-all"
             >
                <Plus size={18} /> Record Expense
             </button>
             <button className="px-6 py-4 bg-primary-light text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-primary-light/20 hover:scale-105 transition-all">
                <Download size={18} /> Financial Export
             </button>
          </div>
        </div>

        {/* Financial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/20 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                 <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 mb-8">
                       <Wallet size={28} className="text-primary-light" />
                    </div>
                    <p className="text-white/50 font-black uppercase tracking-widest text-[10px] mb-2">Fleet Operational Balance</p>
                    <h2 className="text-5xl font-black tracking-tighter">
                       <span className="text-primary-light text-2xl mr-2">TZS</span>
                       {wallet?.balanceTzs?.toLocaleString() || '0'}
                    </h2>
                 </div>
                 <div className="mt-8 flex gap-4">
                    <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all" onClick={() => setActiveView('pending')}>
                       <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Incoming Pending</p>
                       <p className="text-lg font-black text-amber-500">
                          {submissions.filter((s:any) => s.status.toLowerCase().includes('pending')).length} Records
                       </p>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10">
                       <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Daily Accrual</p>
                       <p className="text-lg font-black text-primary-light">Active</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-8 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                 <TrendingUp size={24} />
              </div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                 TZS {stats?.totalFleetRevenue?.toLocaleString() || '0'}
              </h4>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Trip Income</p>
              <div className="mt-10 p-4 rounded-2xl bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 text-xs font-bold flex items-center gap-2">
                 <CheckCircle2 size={14} /> Automatically updated
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-8 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
                 <ArrowDownLeft size={24} />
              </div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                 TZS {expenses.reduce((acc:any, e:any) => acc + Number(e.amountTzs), 0).toLocaleString()}
              </h4>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Recorded Expenses</p>
              <div className="mt-10 p-4 rounded-2xl bg-red-500/5 text-red-600 border border-red-500/10 text-xs font-bold flex items-center gap-2">
                 <FileText size={14} /> Manual records
              </div>
           </div>
        </div>

        {/* History Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
           <div className="p-10 border-b border-slate-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <History size={28} className="text-primary-light" />
                  Financial Transactions
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Review all income streams and operational expenses</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-[1.5rem] overflow-x-auto no-scrollbar">
                 {[
                   { id: 'all', label: 'All History' },
                   { id: 'income', label: 'Income Only' },
                   { id: 'expenses', label: 'Expenses Only' },
                   { id: 'pending', label: 'Pending Approval' }
                 ].map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => setActiveView(t.id as any)}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === t.id ? 'bg-white dark:bg-primary-light text-primary-light dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       {t.label}
                    </button>
                 ))}
              </div>
           </div>

           <div className="divide-y divide-slate-50 dark:divide-white/5">
              {combinedHistory.length === 0 ? (
                <div className="p-32 text-center text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No records found for this period</div>
              ) : combinedHistory.filter(item => {
                  if (activeView === 'all') return true;
                  if (activeView === 'pending') return item.type === 'income' && item.status?.toLowerCase().includes('pending');
                  return item.type === activeView;
              }).map((item: any, i) => {
                 const isIncome = item.type === 'income';
                 const status = item.status?.toLowerCase() || '';
                 const isPending = status.includes('pending');
                 const isApproved = status.includes('approved') || status.includes('success');
                 const isRejected = status.includes('rejected') || status.includes('failed');

                 return (
                   <div key={i} className="p-8 group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-all flex items-center gap-8">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                        isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                         {isIncome ? <ArrowUpRight size={32} /> : <ArrowDownLeft size={32} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start mb-1">
                            <div>
                               <h5 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 truncate">
                                  {isIncome ? (item.category || 'Rider Submission') : `Expense: ${item.category}`}
                                  <span className={`px-2 py-1 text-[8px] uppercase tracking-widest rounded-md ${
                                    isPending ? 'bg-amber-500/10 text-amber-600 animate-pulse' :
                                    isApproved ? 'bg-emerald-500/10 text-emerald-600' :
                                    isRejected ? 'bg-red-500/10 text-red-600' :
                                    'bg-slate-500/10 text-slate-600'
                                  }`}>
                                    {item.status || 'Verified'}
                                  </span>
                               </h5>
                               <p className="text-sm font-bold text-slate-500 flex items-center gap-2 truncate">
                                  {isIncome ? <User size={14} /> : <Settings size={14} />}
                                  {isIncome ? (item.rider?.fullName || 'System Transaction') : item.description}
                               </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                               <p className={`text-2xl font-black ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {isIncome ? '+' : '-'} TZS {Number(item.amountTzs).toLocaleString()}
                               </p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.date}</p>
                            </div>
                         </div>
                      </div>

                      {isIncome && isPending && (
                         <button 
                           onClick={() => setSelectedSub(item)}
                           className="w-12 h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-light hover:border-primary-light transition-all shadow-sm flex-shrink-0"
                           title="Review Payment"
                         >
                            <Eye size={20} />
                         </button>
                      )}
                   </div>
                 );
              })}
           </div>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsExpenseOpen(false)} />
           <form onSubmit={handleExpenseSubmit} className="relative w-full max-lg bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-10 border-b border-slate-50 dark:border-white/5 bg-gradient-to-br from-red-500/10 to-transparent">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Record Business Expense</h3>
                 <p className="text-sm text-slate-500 font-medium mt-1">Manual outflow recording for fleet maintenance or fuel.</p>
              </div>

              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Category</label>
                       <select 
                         value={expenseForm.category}
                         onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                         className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black focus:outline-none appearance-none"
                       >
                          <option value="fuel">Fuel</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="repair">Repair</option>
                          <option value="fine">Traffic Fine</option>
                          <option value="other">Other</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Date</label>
                       <input 
                         type="date"
                         value={expenseForm.expense_date}
                         onChange={(e) => setExpenseForm({...expenseForm, expense_date: e.target.value})}
                         className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black focus:outline-none"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Amount (TZS)</label>
                    <input 
                      type="number" 
                      required
                      value={expenseForm.amount_tzs}
                      onChange={(e) => setExpenseForm({...expenseForm, amount_tzs: e.target.value})}
                      placeholder="e.g. 15000"
                      className="w-full p-8 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-3xl placeholder:text-slate-300 focus:outline-none focus:border-red-500 transition-all"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
                    <textarea 
                      required
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                      placeholder="e.g. Oil change for MC101"
                      className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold min-h-[120px] focus:outline-none"
                    />
                 </div>
              </div>

              <div className="p-10 bg-slate-50/50 dark:bg-white/5 flex gap-4">
                 <button 
                   type="button"
                   onClick={() => setIsExpenseOpen(false)}
                   className="flex-1 py-5 border border-slate-200 dark:border-white/10 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
                 >
                    Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={expRecording}
                   className="flex-1 py-5 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-500/30 hover:scale-[1.02] transition-all uppercase tracking-widest text-xs"
                 >
                    {expRecording ? 'Recording...' : 'Save Expense'}
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedSub(null)} />
           <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8 border-b border-slate-50 dark:border-white/5 bg-gradient-to-br from-primary-light/10 to-transparent">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Approve Collection</h3>
                 <p className="text-sm text-slate-500 font-medium mt-1">Review submission details carefully.</p>
              </div>

              <div className="p-8 space-y-6">
                 <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-primary-light/10 flex items-center justify-center text-primary-light">
                          <User size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted By</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{selectedSub.rider?.fullName || 'Unknown Rider'}</p>
                       </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reported Amount</p>
                       <p className="text-3xl font-black text-primary-light">TZS {Number(selectedSub.amountTzs).toLocaleString()}</p>
                       <div className="mt-4 flex justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref: {selectedSub.referenceNumber || 'N/A'}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date: {selectedSub.date}</span>
                       </div>
                    </div>
                 </div>

                 <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Confirmation note..."
                    className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:border-primary-light min-h-[100px]"
                 />
              </div>

              <div className="p-8 bg-slate-50/50 dark:bg-white/5 flex gap-4">
                 <button 
                   onClick={() => processSubmission({ variables: { input: { submissionId: parseInt(selectedSub.id), status: 'rejected', comment }}})}
                   className="flex-1 py-4 border border-red-500/20 text-red-500 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all"
                 >
                    Reject
                 </button>
                 <button 
                   onClick={() => processSubmission({ variables: { input: { submissionId: parseInt(selectedSub.id), status: 'approved', comment }}})}
                   className="flex-1 py-4 bg-primary-light text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                 >
                    Confirm Receipt
                 </button>
              </div>
           </div>
        </div>
      )}
    </CombinedNav>
  );
};

export default OwnerIncomePage;

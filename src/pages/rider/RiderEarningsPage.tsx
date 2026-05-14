import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_RIDER_WALLET, GET_MY_SUBMISSIONS, GET_RIDER_STATS, GET_MY_EXPENSES } from '../../api/queries';
import { SUBMIT_DAILY_FEE, RECORD_EXPENSE } from '../../api/mutations';
import { 
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, 
  Clock, Filter, Download, DollarSign, PieChart,
  ChevronRight, Calendar, AlertCircle, CheckCircle2, 
  XCircle, Send, Plus, History, MessageSquare, Settings, FileText
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import gsap from 'gsap';

const RiderEarningsPage: React.FC = () => {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [refNum, setRefNum] = useState('');
  const [comment, setComment] = useState('');

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    category: 'fuel',
    amount_tzs: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const { data, loading, refetch: refetchWallet } = useQuery(GET_RIDER_WALLET, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: subData, loading: subLoading, refetch: refetchSubs } = useQuery(GET_MY_SUBMISSIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: statsData } = useQuery(GET_RIDER_STATS, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: expensesData, refetch: refetchExps } = useQuery(GET_MY_EXPENSES, {
    fetchPolicy: 'cache-and-network',
  });

  const [submitFee, { loading: submitting }] = useMutation(SUBMIT_DAILY_FEE, {
    onCompleted: (data) => {
      if (data.submitDailyFee.success) {
        alert("Submission sent! Waiting for owner approval.");
        setIsSubmitOpen(false);
        setAmount('');
        setRefNum('');
        setComment('');
        refetchSubs();
      } else {
        alert(data.submitDailyFee.message);
      }
    }
  });

  const [recordExpense, { loading: expRecording }] = useMutation(RECORD_EXPENSE, {
    onCompleted: (data) => {
      if (data.recordExpense.success) {
        refetchExps();
        setIsExpenseOpen(false);
        setExpenseForm({
            category: 'fuel',
            amount_tzs: '',
            description: '',
            expense_date: new Date().toISOString().split('T')[0]
        });
      } else {
        alert(data.recordExpense.message);
      }
    }
  });

  const wallet = data?.myWallet;
  const submissions = subData?.mySubmissions || [];
  const riderStats = statsData?.riderStats;
  const expenses = expensesData?.myExpenses || [];
  
  const consistency = (riderStats?.targetAmount && riderStats.targetAmount > 0)
    ? Math.min(100, Math.round((riderStats?.targetCompletedAmount / riderStats?.targetAmount) * 100))
    : 0;

  const combinedHistory = [
    ...submissions.map((s: any) => ({ ...s, type: 'income', date: s.submissionDate })),
    ...expenses.map((e: any) => ({ ...e, type: 'expense', date: e.expenseDate }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFee({
      variables: {
        input: {
          amountTzs: parseFloat(amount),
          submissionDate: new Date().toISOString().split('T')[0],
          referenceNumber: refNum,
          comment: comment
        }
      }
    });
  };

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

  return (
    <CombinedNav role="rider">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Financial Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2">
              <Wallet size={16} className="text-primary-light" />
              Manage your wallet, debt, and daily owner submissions
            </p>
          </div>
          <div className="flex gap-3">
            <button 
                onClick={() => setIsExpenseOpen(true)}
                className="px-6 py-4 bg-red-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-red-500/20 hover:scale-105 transition-all"
            >
                <Plus size={18} /> Record Expense
            </button>
            <button 
                onClick={() => setIsSubmitOpen(true)}
                className="px-8 py-4 bg-primary-light text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-primary-light/20 hover:scale-105 transition-all group"
            >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                Submit Daily Fee
            </button>
          </div>
        </div>

        {/* Financial Health Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Debt & Balance Overview */}
          <div className="lg:col-span-1 space-y-6">
             {/* Outstanding Debt Card */}
             <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 mb-6">
                      <AlertCircle size={24} className="text-white" />
                   </div>
                   <p className="text-white/60 font-black uppercase tracking-widest text-[10px] mb-2">Current Outstanding Debt</p>
                   <h2 className="text-4xl font-black tracking-tighter">
                      <span className="text-white/40 text-xl mr-2">TZS</span>
                      {wallet?.totalDebtTzs?.toLocaleString() || '0'}
                   </h2>
                   <p className="mt-4 text-xs font-bold text-red-100/70 flex items-center gap-2">
                      <Clock size={14} /> Increases daily based on contract
                   </p>
                </div>
             </div>

             {/* Wallet Balance Card */}
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group">
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-light/10 rounded-full blur-3xl -ml-24 -mb-24" />
                <div className="relative z-10">
                   <p className="text-white/40 font-black uppercase tracking-widest text-[10px] mb-1">In-App Balance</p>
                   <h3 className="text-2xl font-black tracking-tight">TZS {wallet?.balanceTzs?.toLocaleString() || '0'}</h3>
                   <div className="flex gap-2 mt-6">
                      <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Withdraw</button>
                      <button className="flex-1 py-3 bg-primary-light text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-light/20">Transfer</button>
                   </div>
                </div>
             </div>
          </div>

          {/* Quick Stats & Chart Area */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <TrendingUp size={24} />
                   </div>
                   <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest">Growth</span>
                </div>
                <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1">TZS {riderStats?.weeklyTotal?.toLocaleString() || '0'}</h4>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Earned (Week)</p>
             </div>

             <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                      <ArrowDownLeft size={24} />
                   </div>
                   <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest">Expenses</span>
                </div>
                <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-1">TZS {expenses.reduce((acc:any, e:any) => acc + Number(e.amountTzs), 0).toLocaleString()}</h4>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Expenses (Week)</p>
             </div>

             <div className="md:col-span-2 bg-primary-light/5 border border-primary-light/10 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-4 mb-4">
                   <div className="p-3 bg-primary-light text-white rounded-2xl">
                      <PieChart size={24} />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">Repayment Progress</h4>
                      <p className="text-sm font-medium text-slate-500">How consistent are you with your daily fees?</p>
                   </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/5 h-4 rounded-full overflow-hidden mt-6">
                   <div className="bg-primary-light h-full shadow-lg shadow-primary-light/30 transition-all duration-1000" style={{ width: `${consistency}%` }} />
                </div>
                <p className="text-[10px] font-black uppercase mt-4 text-slate-400 tracking-widest">{consistency}% Consistency Rating — <span className={consistency > 70 ? 'text-emerald-500' : 'text-amber-500'}>{consistency > 70 ? 'Excellent' : 'Improving'}</span></p>
             </div>
          </div>
        </div>

        {/* Combined History */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <History size={28} className="text-primary-light" />
                Financial History
              </h3>
              <div className="flex gap-2">
                 <button className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400 hover:text-primary-light transition-all"><Filter size={18} /></button>
                 <button className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400 hover:text-primary-light transition-all"><History size={18} /></button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subLoading ? (
                <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading History...</div>
              ) : combinedHistory.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                   <History size={48} className="mx-auto text-slate-200 mb-4" />
                   <p className="text-slate-500 font-bold">No financial history yet.</p>
                </div>
              ) : combinedHistory.map((item: any, i) => {
                 const isIncome = item.type === 'income';
                 return (
                   <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-lg group hover:translate-y-[-4px] transition-all flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                        isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                         {isIncome ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start mb-1">
                            <div>
                               <h5 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 truncate">
                                  {isIncome ? 'Submission' : `Expense: ${item.category}`}
                                  {isIncome && (
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                      item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                                      item.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                                      'bg-amber-500/10 text-amber-600'
                                    }`}>
                                      {item.status}
                                    </span>
                                  )}
                               </h5>
                               <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                  {isIncome ? <MessageSquare size={12} /> : <Settings size={12} />}
                                  {isIncome ? (item.comment || 'Daily submission') : item.description}
                               </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                               <p className={`text-lg font-black ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {isIncome ? '+' : '-'} TZS {Number(item.amountTzs).toLocaleString()}
                               </p>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.date}</p>
                            </div>
                         </div>
                      </div>
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
           <form onSubmit={handleExpenseSubmit} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8 border-b border-slate-50 dark:border-white/5 bg-gradient-to-br from-red-500/10 to-transparent">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Record Expense</h3>
                 <p className="text-sm text-slate-500 font-medium mt-1">Track fuel, repairs, or maintenance costs.</p>
              </div>

              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Category</label>
                       <select 
                         value={expenseForm.category}
                         onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                         className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black focus:outline-none appearance-none"
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
                         className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black focus:outline-none"
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
                      placeholder="e.g. 5000"
                      className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-2xl placeholder:text-slate-300 focus:outline-none focus:border-red-500"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
                    <textarea 
                      required
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                      placeholder="e.g. Petrol for Posta trip"
                      className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold min-h-[100px] focus:outline-none"
                    />
                 </div>
              </div>

              <div className="p-8 bg-slate-50/50 dark:bg-white/5 flex gap-4">
                 <button 
                   type="button"
                   onClick={() => setIsExpenseOpen(false)}
                   className="flex-1 py-4 border border-slate-200 dark:border-white/10 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px]"
                 >
                    Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={expRecording}
                   className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-500/30 hover:scale-[1.02] transition-all uppercase tracking-widest text-[10px]"
                 >
                    {expRecording ? 'Recording...' : 'Save Expense'}
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* Submission Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSubmitOpen(false)} />
           <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8 border-b border-slate-50 dark:border-white/5 bg-gradient-to-br from-primary-light/10 to-transparent">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Submit Daily Fee</h3>
                 <p className="text-sm text-slate-500 font-medium mt-1">Record your daily collection for owner approval</p>
              </div>

              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Amount Submitted (TZS)</label>
                    <input 
                      type="number" 
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 25000"
                      className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black placeholder:text-slate-400 focus:outline-none focus:border-primary-light text-xl"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">M-Pesa / Reference ID</label>
                    <input 
                      type="text" 
                      value={refNum}
                      onChange={(e) => setRefNum(e.target.value)}
                      placeholder="Transaction ID"
                      className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:border-primary-light"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Message (Optional)</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Details about today's payment..."
                      className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:border-primary-light min-h-[100px]"
                    />
                 </div>
              </div>

              <div className="p-8 bg-slate-50/50 dark:bg-white/5 flex gap-4">
                 <button 
                   type="button"
                   onClick={() => setIsSubmitOpen(false)}
                   className="flex-1 py-4 border border-slate-200 dark:border-white/10 text-slate-500 font-black rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]"
                 >
                    Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={submitting}
                   className="flex-1 py-4 bg-primary-light text-white font-black rounded-2xl shadow-lg shadow-primary-light/20 hover:scale-[1.02] transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                 >
                    {submitting ? 'Sending...' : <><Send size={16} /> Send Report</>}
                 </button>
              </div>
           </form>
        </div>
      )}
    </CombinedNav>
  );
};

export default RiderEarningsPage;

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { SUBMIT_DAILY_FEE } from '../../api/mutations';
import {
  TrendingUp, AlertCircle, CheckCircle2, User, Phone, Building2,
  Target, ArrowUpRight, ArrowDownRight, Send, Plus, Clock, Award,
  BarChart3, Wallet, ChevronRight
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

const GET_BOSS_REPORT = gql`
  query GetBossReport {
    bossReport {
      bossName
      bossPhone
      bossCompany
      dailyTargetTzs
      todayGrossEarnings
      todaySubmittedTzs
      todayRemainingToPay
      todayNetProfit
      weeklySubmitted
      consistencyPercent
      submissionHistory {
        date
        amountTzs
        status
      }
    }
  }
`;

const EmployedRiderBossPage: React.FC = () => {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [refNum, setRefNum] = useState('');
  const [comment, setComment] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const { data, loading, refetch } = useQuery(GET_BOSS_REPORT, {
    fetchPolicy: 'cache-and-network',
  });

  const [submitFee, { loading: submitting }] = useMutation(SUBMIT_DAILY_FEE, {
    onCompleted: (d) => {
      if (d.submitDailyFee.success) {
        setIsSubmitOpen(false);
        setAmount('');
        setRefNum('');
        setComment('');
        refetch();
        alert('Payment submission sent! Waiting for boss approval.');
      } else {
        alert(d.submitDailyFee.message);
      }
    }
  });

  useEffect(() => {
    if (!loading && data && containerRef.current) {
      gsap.fromTo('.boss-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [loading, data]);

  const report = data?.bossReport;

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

  const progressPct = report
    ? Math.min(100, Math.round((report.todaySubmittedTzs / (report.dailyTargetTzs || 1)) * 100))
    : 0;

  return (
    <CombinedNav role="employed_rider">
      <div ref={containerRef} className="max-w-7xl mx-auto space-y-8 pb-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Boss Report
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2">
              <Target size={16} className="text-primary-light" />
              Daily earnings breakdown & owner payment status
            </p>
          </div>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="px-8 py-4 bg-primary-light text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-primary-light/20 hover:scale-105 transition-all group"
          >
            <Send size={18} className="group-hover:translate-x-1 transition-transform" />
            Submit Payment to Boss
          </button>
        </div>

        {loading ? (
          <div className="py-32 text-center">
            <div className="w-12 h-12 border-4 border-primary-light/20 border-t-primary-light rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading report...</p>
          </div>
        ) : !report ? (
          <div className="py-32 text-center glass rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
            <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">No boss report available. Make sure you are assigned to an owner.</p>
          </div>
        ) : (
          <>
            {/* Boss Info Card */}
            <div className="boss-card bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-primary-light/20 border border-primary-light/30 rounded-2xl flex items-center justify-center">
                    <User size={32} className="text-primary-light" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Your Boss / Owner</p>
                    <h2 className="text-2xl font-black">{report.bossName}</h2>
                    <p className="text-sm text-white/60 font-medium flex items-center gap-2 mt-1">
                      <Building2 size={14} /> {report.bossCompany}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={`tel:${report.bossPhone}`}
                    className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all group"
                  >
                    <Phone size={18} className="text-primary-light" />
                    <span className="font-bold text-sm">{report.bossPhone}</span>
                    <ChevronRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </a>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Today's Gross */}
              <div className="boss-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2rem] p-7 shadow-xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-5">
                  <TrendingUp size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Today's Gross Earnings</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  TZS {report.todayGrossEarnings.toLocaleString()}
                </h3>
              </div>

              {/* Daily Target */}
              <div className="boss-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2rem] p-7 shadow-xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-light/10 rounded-full blur-2xl" />
                <div className="w-12 h-12 bg-primary-light/10 text-primary-light rounded-2xl flex items-center justify-center mb-5">
                  <Target size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Target (Boss Fee)</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  TZS {report.dailyTargetTzs.toLocaleString()}
                </h3>
              </div>

              {/* Remaining to Pay */}
              <div className={`boss-card rounded-[2rem] p-7 shadow-xl relative overflow-hidden ${report.todayRemainingToPay > 0 ? 'bg-gradient-to-br from-red-600 to-red-800 text-white' : 'bg-gradient-to-br from-green-500 to-green-700 text-white'}`}>
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                  {report.todayRemainingToPay > 0 ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">
                  {report.todayRemainingToPay > 0 ? 'Still Owe Boss Today' : 'Boss Paid Today!'}
                </p>
                <h3 className="text-2xl font-black">
                  TZS {report.todayRemainingToPay.toLocaleString()}
                </h3>
              </div>

              {/* Net Profit */}
              <div className="boss-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2rem] p-7 shadow-xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-5">
                  <Wallet size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Net Profit Today</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  TZS {report.todayNetProfit.toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Payment Progress + Consistency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Today's Payment Progress */}
              <div className="boss-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary-light text-white rounded-2xl flex items-center justify-center">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">Today's Payment Progress</h4>
                    <p className="text-sm text-slate-500 font-medium">Amount submitted vs daily target</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-500">Submitted</span>
                    <span className="text-slate-900 dark:text-white">TZS {report.todaySubmittedTzs.toLocaleString()} / {report.dailyTargetTzs.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-white/5 h-5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 shadow-lg ${progressPct >= 100 ? 'bg-green-500 shadow-green-500/30' : 'bg-primary-light shadow-primary-light/30'}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-sm font-black text-slate-400">
                    {progressPct}% complete
                    {progressPct >= 100 && <span className="ml-2 text-green-500">✓ Boss paid for today!</span>}
                  </p>
                </div>
              </div>

              {/* Monthly Consistency */}
              <div className="boss-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">Consistency Rating</h4>
                    <p className="text-sm text-slate-500 font-medium">How often you pay on time (last 30 days)</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3" className="dark:stroke-white/5" />
                      <circle
                        cx="18" cy="18" r="15.9155" fill="none"
                        stroke={report.consistencyPercent >= 70 ? '#22c55e' : '#f59e0b'}
                        strokeWidth="3"
                        strokeDasharray={`${report.consistencyPercent} ${100 - report.consistencyPercent}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-black text-slate-900 dark:text-white">{report.consistencyPercent}%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${report.consistencyPercent >= 70 ? 'text-green-500' : 'text-amber-500'}`}>
                      {report.consistencyPercent >= 80 ? 'Excellent!' : report.consistencyPercent >= 60 ? 'Good' : 'Needs Improvement'}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      This week: TZS {report.weeklySubmitted.toLocaleString()} submitted
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission History */}
            <div className="boss-card space-y-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Clock size={28} className="text-primary-light" />
                Recent Submission History
              </h3>
              {report.submissionHistory.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                  <Clock size={40} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-500 font-bold text-sm">No submissions yet this week. Submit your first payment!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.submissionHistory.map((item: any, i: number) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-md flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                        item.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {item.status === 'approved' ? <CheckCircle2 size={22} /> :
                         item.status === 'rejected' ? <AlertCircle size={22} /> :
                         <Clock size={22} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">TZS {Number(item.amountTzs).toLocaleString()}</p>
                            <p className="text-xs text-slate-500 font-medium">{item.date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            item.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                            item.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                            'bg-amber-500/10 text-amber-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Submit Payment Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSubmitOpen(false)} />
          <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-white/5 bg-gradient-to-br from-primary-light/10 to-transparent">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Submit Payment to Boss</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Record your daily fee payment for owner approval</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Amount (TZS)</label>
                <input
                  type="number" required value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={`e.g. ${report?.dailyTargetTzs?.toLocaleString() || '25000'}`}
                  className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-2xl placeholder:text-slate-300 focus:outline-none focus:border-primary-light"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">M-Pesa / Reference ID</label>
                <input
                  type="text" value={refNum}
                  onChange={e => setRefNum(e.target.value)}
                  placeholder="Transaction ID"
                  className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-primary-light"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Note (Optional)</label>
                <textarea
                  value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Any message for your boss..."
                  className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold min-h-[90px] focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-8 bg-slate-50/50 dark:bg-white/5 flex gap-4">
              <button type="button" onClick={() => setIsSubmitOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-white/10 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-[10px]">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 py-4 bg-primary-light text-white font-black rounded-2xl shadow-xl shadow-primary-light/30 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-60">
                {submitting ? 'Sending...' : <><Send size={14} /> Send Report</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </CombinedNav>
  );
};

export default EmployedRiderBossPage;

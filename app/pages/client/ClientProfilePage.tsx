import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ME, GET_CLIENT_STATS } from '../../api/queries';
import { 
  User, Mail, Phone, Shield, 
  MapPin, Star, Award, Settings,
  LogOut, Camera, FileCheck, AlertCircle,
  ChevronRight, CreditCard, Activity, Clock
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import gsap from 'gsap';

const ClientProfilePage: React.FC = () => {
  const { data: meData, loading: meLoading } = useQuery(GET_ME);
  const { data: statsData } = useQuery(GET_CLIENT_STATS);
  
  const user = meData?.me;
  const stats = statsData?.clientStats;

  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!meLoading && user) {
      gsap.fromTo(profileRef.current, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" }
      );
    }
  }, [meLoading, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <CombinedNav role="client">
      <div className="max-w-5xl mx-auto pb-12" ref={profileRef}>
        {/* Profile Header */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl -mr-48 -mt-48" />
          
          <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
            <div className="relative group">
               <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`} 
                    className="w-full h-full object-cover" 
                    alt="profile" 
                  />
               </div>
               <button className="absolute bottom-2 right-2 w-10 h-10 bg-primary-light text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 hover:scale-110 transition-all">
                  <Camera size={18} />
               </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
               <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{user?.fullName}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                     <span className="px-4 py-1 bg-primary-light/10 text-primary-light rounded-full text-xs font-black uppercase tracking-widest border border-primary-light/20">
                        {user?.role || 'Client'}
                     </span>
                     <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full text-xs font-black">
                        <Star size={14} fill="currentColor" /> {stats?.loyaltyPoints || 0} Points
                     </div>
                  </div>
               </div>

               <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2"><Mail size={16} className="text-primary-light" /> {user?.email}</div>
                  <div className="flex items-center gap-2"><Phone size={16} className="text-primary-light" /> {user?.phone}</div>
               </div>
            </div>

            <div className="flex flex-col gap-3">
               <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:scale-105 transition-all shadow-xl">
                  Edit Profile
               </button>
               <button 
                 onClick={handleLogout}
                 className="px-8 py-4 bg-red-500/10 text-red-500 font-black rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
               >
                  <LogOut size={18} /> Logout
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
           {/* Left Column: Quick Stats */}
           <div className="md:col-span-1 space-y-6">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Activity Summary</h3>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <Activity size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Trips</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">{stats?.totalRides || 0}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
                          <CreditCard size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spent</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">TZS {(stats?.totalSpent || 0).toLocaleString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-primary-light/10 text-primary-light flex items-center justify-center">
                          <Shield size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carbon Saved</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">{stats?.carbonSaved || 0} kg</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-gradient-to-br from-primary-dark to-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
                 <Award size={48} className="text-primary-light mb-4" />
                 <h4 className="text-xl font-black mb-2">BodaKitaa Gold</h4>
                 <p className="text-white/60 text-sm font-medium mb-6">You're in the top 5% of our users in Dar es Salaam! Enjoy exclusive discounts on every 10th ride.</p>
                 <button className="w-full py-3 bg-white/10 backdrop-blur-md rounded-xl font-black text-xs uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all">
                    View Benefits
                 </button>
              </div>
           </div>

           {/* Right Column: Settings */}
           <div className="md:col-span-2 space-y-8">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Personal Information</h3>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><User size={12} /> Full Name</p>
                       <p className="text-lg font-black text-slate-900 dark:text-white">{user?.fullName}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail size={12} /> Email Address</p>
                       <p className="text-lg font-black text-slate-900 dark:text-white">{user?.email}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Phone size={12} /> Phone Number</p>
                       <p className="text-lg font-black text-slate-900 dark:text-white">{user?.phone}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={12} /> Home City</p>
                       <p className="text-lg font-black text-slate-900 dark:text-white">Dar es Salaam, TZ</p>
                    </div>
                 </div>

                 <div className="mt-12 space-y-4">
                    <button className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                       <div className="flex items-center gap-4">
                          <CreditCard size={20} className="text-slate-400" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">Manage Payment Methods</span>
                       </div>
                       <ChevronRight size={18} className="text-slate-300" />
                    </button>
                    <button className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                       <div className="flex items-center gap-4">
                          <Settings size={20} className="text-slate-400 group-hover:rotate-90 transition-transform" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">Account Preferences</span>
                       </div>
                       <ChevronRight size={18} className="text-slate-300" />
                    </button>
                    <button className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                       <div className="flex items-center gap-4">
                          <Clock size={20} className="text-slate-400" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">Privacy & Data</span>
                       </div>
                       <ChevronRight size={18} className="text-slate-300" />
                    </button>
                 </div>
              </div>

              <div className="bg-primary-light/10 border border-primary-light/20 rounded-[2.5rem] p-8 flex items-center gap-6">
                 <div className="w-16 h-16 bg-primary-light/20 text-primary-light rounded-3xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={32} />
                 </div>
                 <div>
                    <h4 className="font-black text-slate-900 dark:text-white">Profile Strength</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Add a home address and work address to speed up your booking process. You're 85% verified.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </CombinedNav>
  );
};

export default ClientProfilePage;

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ME } from '../../api/queries';
import { 
  User, Mail, Phone, Shield, 
  MapPin, Star, Award, Settings,
  LogOut, Camera, FileCheck, AlertCircle,
  ChevronRight, Bike, CreditCard
} from 'lucide-react';
import CombinedNav from '../../components/CombinedNav';
import gsap from 'gsap';

const RiderProfilePage: React.FC = () => {
  const { data, loading } = useQuery(GET_ME);
  const user = data?.me;

  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!loading && user) {
      gsap.fromTo(profileRef.current, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" }
      );
    }
  }, [loading, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <CombinedNav role="rider">
      <div className="max-w-5xl mx-auto" ref={profileRef}>
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
                        {user?.role || 'Rider'}
                     </span>
                     <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full text-xs font-black">
                        <Star size={14} className="fill-current" /> 4.9 Rating
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
           {/* Left: Verification Status */}
           <div className="md:col-span-1 space-y-6">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Shield size={22} className="text-primary-light" /> Verification
                 </h3>
                 
                 <div className="space-y-4">
                    <div className={`flex items-center justify-between p-4 ${user?.kycStatus === 'verified' ? 'bg-green-500/5 border-green-500/10' : 'bg-amber-500/5 border-amber-500/10'} border rounded-2xl`}>
                       <div className="flex items-center gap-3">
                          <FileCheck size={20} className={user?.kycStatus === 'verified' ? 'text-green-500' : 'text-amber-500'} />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Identity (KYC)</span>
                       </div>
                       {user?.kycStatus === 'verified' ? <CheckCircle2 size={18} className="text-green-500" /> : <span className="text-[10px] font-black text-amber-500 uppercase">{user?.kycStatus}</span>}
                    </div>
                    
                    <div className={`flex items-center justify-between p-4 ${user?.kycStatus === 'verified' ? 'bg-green-500/5 border-green-500/10' : 'bg-amber-500/5 border-amber-500/10'} border rounded-2xl`}>
                       <div className="flex items-center gap-3">
                          <FileCheck size={20} className={user?.kycStatus === 'verified' ? 'text-green-500' : 'text-amber-500'} />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">License</span>
                       </div>
                       {user?.kycStatus === 'verified' ? <CheckCircle2 size={18} className="text-green-500" /> : <span className="text-[10px] font-black text-amber-500 uppercase">{user?.kycStatus}</span>}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <Shield size={20} className="text-blue-500" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Insurance</span>
                       </div>
                       <span className="text-[10px] font-black text-blue-500 uppercase">Valid</span>
                    </div>
                 </div>
              </div>

              <div className="bg-gradient-to-br from-primary-dark to-primary-light rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                 <Award size={100} className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-125 transition-transform duration-700" />
                 <h4 className="text-xl font-black mb-2">Pro Rider Tier</h4>
                 <p className="text-white/80 text-sm font-medium mb-6">You have completed <span className="font-bold">{user?.totalTrips || 0}</span> rides so far!</p>
                 <button className="w-full py-3 bg-white/20 backdrop-blur-md rounded-xl font-black text-xs uppercase tracking-widest border border-white/20 hover:bg-white/30 transition-all">
                    View Benefits
                 </button>
              </div>
           </div>

           {/* Right: Detailed Settings/Info */}
           <div className="md:col-span-2 space-y-8">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Account Details</h3>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Award size={12} /> License Number</p>
                       <p className="text-lg font-black text-slate-900 dark:text-white">{user?.licenseNumber || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Bike size={12} /> Assigned Plate</p>
                       <p className="text-lg font-black text-slate-900 dark:text-white">{user?.plateNumber || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={12} /> Email</p>
                       <p className="text-lg font-black text-slate-900 dark:text-white">{user?.email}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><CreditCard size={12} /> Phone Number</p>
                       <p className="text-lg font-black text-slate-900 dark:text-white">{user?.phone}</p>
                    </div>
                 </div>

                 <div className="mt-12 space-y-4">
                    <button className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                       <div className="flex items-center gap-4">
                          <Settings size={20} className="text-slate-400 group-hover:rotate-90 transition-transform" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">App Preferences</span>
                       </div>
                       <ChevronRight size={18} className="text-slate-300" />
                    </button>
                    <button className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                       <div className="flex items-center gap-4">
                          <Shield size={20} className="text-slate-400" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">Privacy & Security</span>
                       </div>
                       <ChevronRight size={18} className="text-slate-300" />
                    </button>
                 </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] p-8 flex items-center gap-6">
                 <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-3xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={32} />
                 </div>
                 <div>
                    <h4 className="font-black text-slate-900 dark:text-white">Safety First</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Remember to always wear your helmet and reflective vest. Your safety and your passenger's safety is our top priority.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </CombinedNav>
  );
};

export default RiderProfilePage;

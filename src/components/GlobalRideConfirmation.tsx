import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_MY_ACTIVE_REQUEST, CONFIRM_RIDE } from '../api/queries';
import { 
  CheckCircle2, Star, Bike, Shield, Loader2, X, Bell, Navigation, Phone, 
  MapPin, Clock
} from 'lucide-react';
import { gsap } from 'gsap';

const GlobalRideConfirmation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ride, setRide] = useState<any>(null);
  
  const { data, stopPolling, startPolling } = useQuery(GET_MY_ACTIVE_REQUEST, {
    pollInterval: 5000,
    fetchPolicy: 'network-only',
  });

  const [confirmRide, { loading: isConfirming }] = useMutation(CONFIRM_RIDE);

  useEffect(() => {
    if (!data) return; // Wait for data
    const activeRide = data?.myActiveRequest;
    if (activeRide?.status === 'accepted') {
      setRide(activeRide);
      setIsOpen(true);
    } else if (activeRide?.status === 'confirmed' || !activeRide) {
      setIsOpen(false);
      setRide(null);
    }
  }, [data]);

  const token = localStorage.getItem('token');
  useEffect(() => {
     if (!token) stopPolling();
     else startPolling(5000);
  }, [token, startPolling, stopPolling]);

  useEffect(() => {
    if (isOpen) {
      const modal = document.getElementById('global-confirm-modal');
      if (modal) {
        gsap.fromTo(modal, 
          { scale: 0.9, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
        );
      }
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!ride) return;
    try {
      await confirmRide({ variables: { rideId: parseInt(ride.id) } });
      setIsOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || !ride) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div 
        id="global-confirm-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10"
      >
        <div className="bg-gradient-to-r from-primary-light to-orange-600 p-6 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner">
              <Bike size={32} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Rider Found!</h2>
              <p className="text-white/80 text-sm font-bold">Please confirm to start</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-white/5">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.rider?.fullName}`} 
              className="w-16 h-16 rounded-full border-2 border-primary-light" 
              alt="rider" 
            />
            <div className="flex-1">
              <p className="text-xl font-black text-slate-900 dark:text-white">{ride.rider?.fullName}</p>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1">
                <Star size={14} className="fill-current" />
                {parseFloat(ride.rider?.rating || 5).toFixed(1)} rating
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Motorcycle</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{ride.rider?.plateNumber || 'T 123 ABC'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">License ID</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{ride.rider?.licenseNumber || 'Verified'}</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3">
               <Shield size={20} className="text-blue-500" />
               <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide leading-tight">
                 Your ride is fully insured. Verify the plate number before boarding.
               </p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full py-5 rounded-[1.5rem] bg-primary-light text-white font-black text-lg flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(254,119,67,0.5)] hover:shadow-[0_25px_50px_-10px_rgba(254,119,67,0.6)] hover:-translate-y-1 transition-all"
          >
            {isConfirming ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
            Confirm & Start Journey
          </button>
          
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Ride will auto-cancel in <span className="text-primary-light">5 minutes</span> if not confirmed
          </p>
        </div>
        
        {/* Countdown bar */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 overflow-hidden">
           <div className="h-full bg-primary-light w-full animate-shrink-x origin-left" style={{ animationDuration: '300s' }} />
        </div>
      </div>

      <style>{`
        @keyframes shrink-x {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        .animate-shrink-x {
          animation-name: shrink-x;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default GlobalRideConfirmation;

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_MY_NOTIFICATIONS } from '../api/queries';
import { MARK_NOTIFICATION_READ } from '../api/mutations';
import { X, Info, AlertTriangle, CreditCard, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

interface Notification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const { data, loading, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !isOpen,
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_READ, {
    onCompleted: () => refetch()
  });

  const notifications: Notification[] = data?.myNotifications || [];
  
  const totalPages = Math.max(1, Math.ceil(notifications.length / itemsPerPage));
  const currentNotifications = notifications.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    if (isOpen) {
      refetch();
      
      // Entrance animation: Scale and Fade
      gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(panelRef.current, 
        { scale: 0.95, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)', force3D: true }
      );
      
      if (listRef.current) {
        gsap.fromTo(listRef.current.children, 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
        );
      }
    } else {
      gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
      gsap.to(panelRef.current, { scale: 0.95, opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' });
    }
  }, [isOpen, refetch]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      gsap.fromTo(listRef.current.children, 
        { scale: 0.98, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [page, isOpen, currentNotifications.length]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'PAYMENT': return <CreditCard className="text-emerald-500 w-5 h-5" />;
      case 'RIDE_REQUEST': return <Bell className="text-blue-500 w-5 h-5" />;
      case 'SYSTEM': return <Info className="text-indigo-500 w-5 h-5" />;
      default: return <AlertTriangle className="text-amber-500 w-5 h-5" />;
    }
  };

  const handleMarkRead = (id: string) => {
    markAsRead({ variables: { id } });
  };

  if (!isOpen && !panelRef.current) return null;

  return createPortal(
    <>
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[20000] invisible opacity-0 transition-all"
        onClick={onClose}
      />
      
      <div 
        ref={panelRef}
        className="fixed top-24 right-4 md:right-8 w-[92%] sm:w-[420px] max-h-[80vh] bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] z-[20001] rounded-[2.5rem] flex flex-col overflow-hidden opacity-0"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-br from-primary-light/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-light/10 flex items-center justify-center text-primary-light shadow-inner">
              <Bell size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Activity</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your notifications</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading && !notifications.length ? (
            <div className="flex flex-col justify-center items-center py-20 gap-3">
              <div className="w-8 h-8 border-3 border-primary-light border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching alerts</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 opacity-20" />
              </div>
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">All clear!</h3>
              <p className="text-[11px] font-medium opacity-60 mt-1 px-10">No new notifications at the moment.</p>
            </div>
          ) : (
            <div ref={listRef} className="space-y-3">
              {currentNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`group relative p-4 rounded-3xl border transition-all duration-300 hover:translate-y-[-2px] cursor-pointer ${
                    notif.isRead 
                      ? 'bg-slate-50/50 dark:bg-white/5 border-slate-100 dark:border-white/5' 
                      : 'bg-white dark:bg-slate-800 border-primary-light/20 shadow-lg shadow-primary-light/5'
                  }`}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                >
                  <div className="flex gap-4">
                    <div className="mt-0.5 flex-shrink-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${notif.isRead ? 'bg-slate-100 dark:bg-white/5' : 'bg-primary-light/10'}`}>
                        {getIcon(notif.notificationType)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-bold truncate pr-4 ${notif.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary-light shadow-[0_0_8px_rgba(254,119,67,0.8)]" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-2">
                        {notif.message}
                      </p>
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-white/5 backdrop-blur-md">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-white/20"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex gap-1.5">
               {Array.from({ length: totalPages }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${page === i + 1 ? 'w-4 bg-primary-light' : 'w-1 bg-slate-300 dark:bg-white/20'}`}
                  />
               ))}
            </div>

            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-white/20"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

export default NotificationDrawer;

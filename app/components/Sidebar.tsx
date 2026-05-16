import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Bike, Users, Wallet, FileBarChart, 
  Settings, LogOut, MapPin, ClipboardList, X, Star, Target
} from 'lucide-react';

interface SidebarProps {
  role: 'client' | 'rider' | 'employed_rider' | 'owner' | 'admin';
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, closeSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = {
    client: [
      { path: '/dashboard/client', icon: LayoutDashboard, label: t('dashboard.overview') },
      { path: '/dashboard/client/request', icon: Bike, label: 'Request Ride' },
      { path: '/dashboard/client/rides', icon: MapPin, label: t('dashboard.rides') },
      { path: '/dashboard/client/rating', icon: Star, label: t('dashboard.rating') },
      // { path: '/dashboard/client/wallet', icon: Wallet, label: t('dashboard.wallet') },
    ],
    rider: [
      { path: '/dashboard/rider', icon: LayoutDashboard, label: t('dashboard.overview') },
      { path: '/dashboard/rider/requests', icon: MapPin, label: 'My Requests' },
      { path: '/dashboard/rider/earnings', icon: Wallet, label: t('dashboard.income') },
      { path: '/dashboard/rider/history', icon: ClipboardList, label: t('dashboard.rides') },
      { path: '/dashboard/rider/vehicle', icon: Bike, label: 'My Vehicle' },
      { path: '/dashboard/rider/profile', icon: Settings, label: 'Profile' },
    ],
    employed_rider: [
      { path: '/dashboard/employed_rider', icon: LayoutDashboard, label: 'Overview' },
      { path: '/dashboard/employed_rider/requests', icon: MapPin, label: 'My Requests' },
      { path: '/dashboard/employed_rider/earnings', icon: Wallet, label: 'Earnings' },
      { path: '/dashboard/employed_rider/boss', icon: Target, label: 'Boss Report', highlight: true },
      { path: '/dashboard/employed_rider/history', icon: ClipboardList, label: 'Ride History' },
      { path: '/dashboard/employed_rider/vehicle', icon: Bike, label: 'My Vehicle' },
      { path: '/dashboard/employed_rider/profile', icon: Settings, label: 'Profile' },
    ],
    owner: [
      { path: '/dashboard/owner', icon: LayoutDashboard, label: t('dashboard.overview') },
      { path: '/dashboard/owner/fleet', icon: Bike, label: t('dashboard.fleet') },
      { path: '/dashboard/owner/riders', icon: Users, label: t('dashboard.riders') },
      { path: '/dashboard/owner/track_riders', icon: MapPin, label: t('dashboard.track_riders') },
      { path: '/dashboard/owner/income', icon: Wallet, label: t('dashboard.track_income') },
      { path: '/dashboard/owner/reports', icon: FileBarChart, label: t('dashboard.analysis') },
    ],
    admin: [
      { path: '/dashboard/admin', icon: LayoutDashboard, label: t('dashboard.overview') },
      { path: '/dashboard/admin/users', icon: Users, label: t('dashboard.riders') },
      { path: '/dashboard/admin/reports', icon: FileBarChart, label: t('dashboard.analysis') },
      // { path: '/dashboard/admin/settings', icon: Settings, label: t('dashboard.settings') },
    ]
  };

  const currentMenu = menuItems[role] || [];

  return (
    <aside className="w-64 h-full glass border-r border-slate-200 dark:border-white/10 p-6 flex flex-col bg-slate-50/50 dark:bg-black/50 overflow-y-auto relative">
      <div className="flex items-center justify-between mb-10">
        <Link to="/" className="flex items-center gap-2" onClick={closeSidebar}>
          <Bike className="text-primary-light w-8 h-8" />
          <span className="text-xl font-black tracking-tighter text-primary-light dark:text-white">BodaKitaa</span>
        </Link>
        
        <button 
          onClick={closeSidebar}
          className="p-2 lg:hidden text-slate-500 hover:text-primary-light transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {currentMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary-light text-white shadow-lg shadow-primary-light/30' 
                  : (item as any).highlight && !isActive
                  ? 'text-primary-light bg-primary-light/10 hover:bg-primary-light hover:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-primary-light dark:hover:text-primary-light'
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold text-sm">{item.label}</span>
              {(item as any).highlight && !isActive && (
                <span className="ml-auto text-[9px] font-black bg-primary-light text-white px-2 py-0.5 rounded-full uppercase tracking-widest">New</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
        <Link to={`/dashboard/${role}/profile`} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-primary-light transition-all">
          <Settings size={20} />
          <span className="font-bold text-sm">{t('dashboard.profile')}</span>
        </Link>
        <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
          <LogOut size={20} />
          <span className="font-bold text-sm">{t('dashboard.logout')}</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;

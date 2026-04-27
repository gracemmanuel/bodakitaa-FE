import React from 'react';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, Bell, User } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'client' | 'rider' | 'owner' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const { isDark, toggleTheme } = useTheme();
  const { i18n } = useTranslation();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'sw' : 'en');
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-black transition-colors duration-300 font-sans selection:bg-primary-light/30 selection:text-primary-light overflow-hidden">
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Abstract subtle background for dashboards */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNTYsIDE2MywgMTc1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 pointer-events-none" />

        {/* Dashboard Header */}
        <header className="h-20 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-8 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-primary-light/10 text-primary-light flex items-center justify-center font-bold uppercase md:hidden">
                {role.charAt(0)}
             </div>
             <div>
               <h2 className="text-xl font-black text-slate-900 dark:text-white capitalize hidden md:block">{role} Portal</h2>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:block">BodaKitaa System</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={toggleLang} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-slate-700 dark:text-white">
              <Globe size={18} />
              <span className="text-xs font-bold uppercase hidden sm:block">{i18n.language}</span>
            </button>
            
            <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-700 dark:text-white">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors relative text-slate-700 dark:text-white">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary-light rounded-full border border-white dark:border-black animate-pulse" />
            </button>

            <div className="hidden sm:block h-8 w-[1px] bg-slate-200 dark:bg-white/10" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">John Doe</p>
                <p className="text-xs text-primary-light font-bold uppercase tracking-wider">{role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-dark to-primary-light flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 z-10 custom-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

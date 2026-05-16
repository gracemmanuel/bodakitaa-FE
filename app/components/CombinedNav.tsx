import React from 'react';
import Sidebar from './Sidebar';
import Nav from './Nav';
import GlobalRideConfirmation from './GlobalRideConfirmation';

interface CombinedNavProps {
  children: React.ReactNode;
  role: 'client' | 'rider' | 'employed_rider' | 'owner' | 'admin';
}

const CombinedNav: React.FC<CombinedNavProps> = ({ children, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-black transition-colors duration-300 font-sans selection:bg-primary-light/30 selection:text-primary-light overflow-hidden">
      {/* Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      {/* Sidebar Component */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar role={role} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Abstract subtle background for dashboards */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNTYsIDE2MywgMTc1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 pointer-events-none" />

        {/* Top Navbar Component */}
        <Nav variant="dashboard" role={role} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Dashboard Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 z-10 custom-scrollbar relative">
          {children}
        </main>
        
        {role === 'client' && <GlobalRideConfirmation />}
      </div>
    </div>
  );
};

export default CombinedNav;

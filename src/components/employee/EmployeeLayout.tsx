import React from 'react';
import { useApp } from '../../context/AppContext';
import { HomeDashboard } from './HomeDashboard';
import { AttendanceHistoryView } from './AttendanceHistoryView';
import { LeaveRequestView } from './LeaveRequestView';
import { ProfileView } from './ProfileView';
import { CameraModal } from './CameraModal';
import { 
  Home, 
  Clock, 
  FileText, 
  User, 
  Wifi, 
  Battery, 
  Signal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EmployeeLayout: React.FC = () => {
  const { 
    activeEmployeeTab, 
    setActiveEmployeeTab, 
    isMobileDeviceFrame 
  } = useApp();

  const renderContent = () => {
    switch (activeEmployeeTab) {
      case 'home':
        return <HomeDashboard />;
      case 'history':
        return <AttendanceHistoryView />;
      case 'leave':
        return <LeaveRequestView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <HomeDashboard />;
    }
  };

  const navItems = [
    { id: 'home' as const, label: 'Beranda', icon: Home },
    { id: 'history' as const, label: 'Riwayat', icon: Clock },
    { id: 'leave' as const, label: 'Cuti', icon: FileText },
    { id: 'profile' as const, label: 'Profil', icon: User },
  ];

  return (
    <div className={`min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 ${isMobileDeviceFrame ? 'sm:py-8' : ''}`}>
      {/* Smartphone Mockup Container or Full Responsive Screen */}
      <div
        className={`w-full bg-slate-50 relative flex flex-col transition-all overflow-hidden ${
          isMobileDeviceFrame
            ? 'max-w-[430px] h-[92vh] max-h-[880px] rounded-[48px] shadow-[0_25px_70px_rgba(0,0,0,0.25)] border-[10px] border-slate-900 ring-1 ring-slate-800'
            : 'max-w-lg min-h-screen sm:min-h-[90vh] sm:rounded-3xl sm:shadow-xl sm:border sm:border-slate-200/80'
        }`}
      >
        {/* Smartphone Dynamic Island / Notch & Top Status Bar */}
        {isMobileDeviceFrame && (
          <div className="bg-slate-900 text-white px-7 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold shrink-0 z-30 select-none">
            <span className="font-mono">08:00</span>
            {/* Dynamic island pill */}
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse"></span>
            </div>
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-5 pt-3 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEmployeeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ZONA 4: FLOATING BOTTOM NAVIGATION BAR */}
        <nav className="fixed sm:absolute bottom-0 inset-x-0 z-30 px-4 pb-4 pt-1 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pointer-events-none">
          <div className="pointer-events-auto max-w-sm mx-auto bg-white/95 backdrop-blur-md rounded-full border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-1.5 flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeEmployeeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveEmployeeTab(item.id)}
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all relative ${
                    isActive
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-blue-50 rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Camera Full Screen Modal */}
      <CameraModal />
    </div>
  );
};

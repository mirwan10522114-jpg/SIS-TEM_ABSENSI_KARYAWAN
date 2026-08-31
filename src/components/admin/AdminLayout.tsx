import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminAttendanceView } from './AdminAttendanceView';
import { AdminLeaveApprovalView } from './AdminLeaveApprovalView';
import { AdminEmployeesView } from './AdminEmployeesView';
import { AdminGeofencingView } from './AdminGeofencingView';
import { AdminAnnouncementsView } from './AdminAnnouncementsView';
import { AdminSettingsView } from './AdminSettingsView';
import { AdminOvertimeApprovalView } from './AdminOvertimeApprovalView';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  FileCheck, 
  MapPin, 
  Megaphone, 
  Smartphone, 
  Bell, 
  Search, 
  ShieldCheck, 
  Menu, 
  X,
  LogOut,
  ChevronRight,
  Sliders,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminLayout: React.FC = () => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    setCurrentRole,
    leaveRequests,
    overtimeRequests,
    attendanceRecords,
    announcements,
  } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'pending').length;
  const pendingOvertimesCount = overtimeRequests.filter(o => o.status === 'pending').length;

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance' as const, label: 'Riwayat Absensi', icon: Clock },
    { id: 'leaves' as const, label: 'Approval Cuti', icon: FileCheck, badge: pendingLeavesCount },
    { id: 'overtime' as const, label: 'Approval Lembur', icon: Timer, badge: pendingOvertimesCount },
    { id: 'employees' as const, label: 'Data Karyawan', icon: Users },
    { id: 'geofence' as const, label: 'Pengaturan Geofence', icon: MapPin },
    { id: 'announcements' as const, label: 'Pengumuman Internal', icon: Megaphone },
    { id: 'settings' as const, label: 'Aturan & Kebijakan', icon: Sliders },
  ];

  const renderActiveView = () => {
    switch (activeAdminTab) {
      case 'dashboard':
        return <AdminDashboardView />;
      case 'attendance':
        return <AdminAttendanceView />;
      case 'leaves':
        return <AdminLeaveApprovalView />;
      case 'overtime':
        return <AdminOvertimeApprovalView />;
      case 'employees':
        return <AdminEmployeesView />;
      case 'geofence':
        return <AdminGeofencingView />;
      case 'announcements':
        return <AdminAnnouncementsView />;
      case 'settings':
        return <AdminSettingsView />;
      default:
        return <AdminDashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* SIDEBAR DESKTOP & MOBILE DRAWER */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between p-4 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static shrink-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight text-white leading-tight">
                  ADMIN PORTAL
                </h2>
                <p className="text-[10px] font-mono text-slate-400">Presensi & Geofence</p>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeAdminTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveAdminTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Back to Employee App & Admin Profile */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <button
            onClick={() => setCurrentRole('employee')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Aplikasi Karyawan</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <div className="flex items-center gap-3 p-2 bg-slate-950/60 rounded-xl">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
              alt="Admin Profile"
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Dewi Lestari</p>
              <p className="text-[10px] text-slate-400 truncate">HR & Ops Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-[49px] z-20 shadow-xs">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Admin Panel</span>
              <span>/</span>
              <span className="font-bold text-slate-800 capitalize">{activeAdminTab}</span>
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {pendingLeavesCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white animate-pulse" />
                )}
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-800">Notifikasi Sistem</span>
                    <span className="text-[10px] text-blue-600 font-semibold">Tandai sudah dibaca</span>
                  </div>
                  <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                    {pendingLeavesCount > 0 && (
                      <div
                        onClick={() => {
                          setActiveAdminTab('leaves');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 hover:bg-amber-100/80 transition-colors cursor-pointer"
                      >
                        <p className="font-bold text-amber-900 text-xs">Permohonan Cuti Masuk</p>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Terdapat {pendingLeavesCount} pengajuan cuti menunggu persetujuan Anda.
                        </p>
                      </div>
                    )}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600">
                      <p className="font-bold text-slate-800 text-xs">Geofence GPS Aktif</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Presensi real-time kantor berjalan normal di radius 100m.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Button: Mode Karyawan */}
            <button
              onClick={() => setCurrentRole('employee')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Mode Karyawan</span>
            </button>
          </div>
        </header>

        {/* VIEW CONTAINER */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAdminTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

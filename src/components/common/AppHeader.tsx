import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  LogOut, 
  User, 
  Smartphone, 
  LayoutDashboard,
  Navigation
} from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { 
    currentRole,
    setCurrentRole,
    authRole,
    activeEmployee, 
    logout, 
    geofenceConfig, 
    isInsideOfficeGeofence, 
    distanceToOfficeMeters,
    useRealBrowserGps
  } = useApp();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white text-xs sticky top-0 z-40 shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-xs sm:text-sm text-white tracking-tight flex items-center gap-1.5 leading-tight truncate">
              <span className="hidden sm:inline">Sistem Absensi Karyawan</span>
              <span className="sm:hidden truncate">Absensi</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border shrink-0 ${
                currentRole === 'admin' 
                  ? 'bg-purple-950/80 border-purple-700 text-purple-300' 
                  : 'bg-blue-950/80 border-blue-700 text-blue-300'
              }`}>
                {currentRole === 'admin' ? 'ADMIN' : 'KARYAWAN'}
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate hidden md:block">
              {geofenceConfig.officeName}
            </p>
          </div>

          {/* Admin View Switcher (Only shown if logged in as Admin) */}
          {authRole === 'admin' && (
            <div className="hidden lg:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 ml-2">
              <button
                onClick={() => setCurrentRole('employee')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  currentRole === 'employee'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Portal Karyawan</span>
              </button>
              <button
                onClick={() => setCurrentRole('admin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: GPS Status, User Info, & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Admin Quick Switch Icon Button (For Admin on Mobile) */}
          {authRole === 'admin' && (
            <button
              onClick={() => setCurrentRole(currentRole === 'admin' ? 'employee' : 'admin')}
              title={currentRole === 'admin' ? 'Beralih ke Portal Karyawan' : 'Beralih ke Admin Panel'}
              className="lg:hidden p-1.5 rounded-xl bg-purple-950/60 border border-purple-700/60 text-purple-300 hover:bg-purple-900/60 transition-colors"
            >
              {currentRole === 'admin' ? <Smartphone className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
            </button>
          )}

          {/* GPS Location Real-time Indicator */}
          {currentRole === 'employee' && (
            <button
              onClick={useRealBrowserGps}
              title="Perbarui koordinat GPS Perangkat"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                isInsideOfficeGeofence
                  ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/80'
                  : 'bg-amber-950/80 border-amber-700/80 text-amber-300 hover:bg-amber-900/80'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${isInsideOfficeGeofence ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
              <span className="hidden md:inline">
                {isInsideOfficeGeofence ? 'Di Dalam Area' : 'Di Luar Area'}
              </span>
              <span className="font-mono text-[11px]">({distanceToOfficeMeters}m)</span>
              <Navigation className="w-3 h-3 opacity-80 shrink-0" />
            </button>
          )}

          {/* Active Logged-in User Profile Badge */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-2 sm:px-3 py-1 rounded-xl">
            {authRole === 'employee' || currentRole === 'employee' ? (
              <>
                <img
                  src={activeEmployee.avatar}
                  alt={activeEmployee.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-600 shrink-0"
                />
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-white leading-none text-xs">{activeEmployee.name}</p>
                  <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{activeEmployee.department}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold shrink-0">
                  <User className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-white leading-none text-xs">Administrator HR</p>
                  <p className="text-[9px] text-purple-400 leading-tight mt-0.5">Admin Full Access</p>
                </div>
              </>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Keluar dari Aplikasi"
            className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline text-xs">Keluar</span>
          </button>

        </div>
      </div>
    </header>
  );
};

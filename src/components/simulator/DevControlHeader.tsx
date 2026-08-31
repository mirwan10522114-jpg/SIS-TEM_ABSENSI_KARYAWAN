import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRESET_LOCATIONS } from '../../mockData';
import { 
  Smartphone, 
  LayoutDashboard, 
  MapPin, 
  Navigation, 
  Users, 
  ShieldCheck, 
  Sliders,
  Sparkles,
  ChevronDown,
  Monitor,
  Maximize2
} from 'lucide-react';

export const DevControlHeader: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    isMobileDeviceFrame,
    setIsMobileDeviceFrame,
    activeEmployee,
    setActiveEmployeeId,
    employees,
    geofenceConfig,
    currentCoords,
    currentLocationName,
    isInsideOfficeGeofence,
    distanceToOfficeMeters,
    setPresetLocation,
    useRealBrowserGps,
    activeAdminTab,
    setActiveAdminTab,
  } = useApp();

  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white text-xs sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-400">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <span className="hidden sm:inline">Absensi Geofence</span>
          </div>

          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setCurrentRole('employee')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentRole === 'employee'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Aplikasi Karyawan</span>
            </button>
            <button
              onClick={() => setCurrentRole('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Web Admin Panel</span>
            </button>
          </div>
        </div>

        {/* Simulator Tools & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Employee Switcher (Only in Employee mode) */}
          {currentRole === 'employee' && (
            <div className="relative">
              <button
                onClick={() => {
                  setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen);
                  setIsLocationDropdownOpen(false);
                }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-200"
              >
                <img
                  src={activeEmployee.avatar}
                  alt={activeEmployee.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="max-w-[110px] truncate font-medium">{activeEmployee.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isEmployeeDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-1 z-50 text-slate-200">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-700">
                    PILIH AKUN KARYAWAN
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {employees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          setActiveEmployeeId(emp.id);
                          setIsEmployeeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                          emp.id === activeEmployee.id ? 'bg-blue-600/30 text-blue-300 font-semibold' : 'hover:bg-slate-700'
                        }`}
                      >
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{emp.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GPS Location Selector & Tester */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLocationDropdownOpen(!isLocationDropdownOpen);
                setIsEmployeeDropdownOpen(false);
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                isInsideOfficeGeofence
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-700/60 text-amber-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isInsideOfficeGeofence ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
              <span className="font-medium hidden md:inline">
                {isInsideOfficeGeofence ? 'Di Area Kantor' : 'Di Luar Area'}
              </span>
              <span className="font-mono text-[11px]">({distanceToOfficeMeters}m)</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {isLocationDropdownOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 z-50 text-slate-200">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-700 flex justify-between items-center">
                  <span>SIMULATOR POSISI GPS</span>
                  <span className="text-[10px] text-blue-400 font-normal">Radius: {geofenceConfig.radiusMeters}m</span>
                </div>
                <div className="py-1 space-y-1">
                  {PRESET_LOCATIONS.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setPresetLocation(idx);
                        setIsLocationDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-2 p-2 rounded-lg text-left text-xs hover:bg-slate-700 transition-colors"
                    >
                      <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${loc.isInside ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{loc.name}</p>
                        <p className={`text-[10px] ${loc.isInside ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {loc.tag}
                        </p>
                      </div>
                    </button>
                  ))}
                  
                  <div className="pt-1 border-t border-slate-700">
                    <button
                      onClick={async () => {
                        await useRealBrowserGps();
                        setIsLocationDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-medium text-xs transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Gunakan GPS Asli Perangkat</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Device Mockup Toggle (Only in employee mode) */}
          {currentRole === 'employee' && (
            <button
              onClick={() => setIsMobileDeviceFrame(!isMobileDeviceFrame)}
              title={isMobileDeviceFrame ? 'Ganti ke Tampilan Responsif Penuh' : 'Ganti ke Mockup Smartphone'}
              className={`p-1.5 rounded-lg border transition-colors ${
                isMobileDeviceFrame
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isMobileDeviceFrame ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndonesianDate } from '../../utils/geo';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  LogOut, 
  LogIn, 
  Megaphone, 
  Calendar, 
  FileText, 
  User, 
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Camera
} from 'lucide-react';
import { HelpModal } from './HelpModal';

export const HomeDashboard: React.FC = () => {
  const {
    activeEmployee,
    geofenceConfig,
    isInsideOfficeGeofence,
    distanceToOfficeMeters,
    todayEmployeeAttendance,
    openCameraModal,
    setActiveEmployeeTab,
    announcements,
    setZoomedImage,
    addToast
  } = useApp();

  // Real-time ticking clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = formatIndonesianDate('2026-08-30'); // Or currentTime

  const isClockedIn = !!todayEmployeeAttendance?.clockInTime;
  const isClockedOut = !!todayEmployeeAttendance?.clockOutTime;

  // Active announcement
  const latestAnnouncement = announcements[0];

  return (
    <div className="space-y-5 pb-6">
      {/* ZONA 1: HEADER (INFORMASI PENGGUNA) */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Selamat datang, {activeEmployee.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            {activeEmployee.role} • {activeEmployee.department}
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-600 mt-2">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Profile Avatar Thumbnail */}
        <button
          onClick={() => setActiveEmployeeTab('profile')}
          className="relative group shrink-0 focus:outline-none"
          title="Lihat Profil"
        >
          <img
            src={activeEmployee.avatar}
            alt={activeEmployee.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/20 group-hover:ring-blue-500 shadow-sm transition-all"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
        </button>
      </div>

      {/* ZONA 2: HERO CARD (FOKUS ABSENSI) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-6 transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
        {/* Status Lokasi Geofence */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span className={`w-3 h-3 rounded-full ${isInsideOfficeGeofence ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={`absolute w-3 h-3 rounded-full animate-ping opacity-75 ${isInsideOfficeGeofence ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
            <div>
              <span className={`text-xs font-bold ${isInsideOfficeGeofence ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isInsideOfficeGeofence ? 'Anda berada di area kantor' : 'Di luar area kantor (WFH / Remote)'}
              </span>
              <p className="text-[11px] text-slate-400">
                Jarak: <strong>{distanceToOfficeMeters} meter</strong> (Radius: {geofenceConfig.radiusMeters}m)
              </p>
            </div>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
            GPS Aktif
          </span>
        </div>

        {/* Real-Time Digital Clock */}
        <div className="text-center my-3 py-2 bg-gradient-to-b from-slate-50/80 to-slate-100/40 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">
            Waktu Real-Time (WIB)
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {timeString}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Jadwal Shift: {activeEmployee.shift}
          </p>
        </div>

        {/* Status Text if already Clocked In */}
        {isClockedIn && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Sudah Clock In pukul <strong>{todayEmployeeAttendance?.clockInTime} WIB</strong>
              </span>
            </div>
            {todayEmployeeAttendance?.selfieClockIn && (
              <button
                onClick={() =>
                  setZoomedImage({
                    url: todayEmployeeAttendance.selfieClockIn,
                    title: `Selfie Clock In - ${activeEmployee.name}`,
                    meta: `Jam: ${todayEmployeeAttendance.clockInTime} | Lokasi: ${todayEmployeeAttendance.clockInLocation.address}`,
                  })
                }
                className="text-[11px] font-semibold text-emerald-700 underline hover:text-emerald-900"
              >
                Lihat Foto
              </button>
            )}
          </div>
        )}

        {isClockedOut && (
          <div className="mb-4 p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                Sudah Clock Out pukul <strong>{todayEmployeeAttendance?.clockOutTime} WIB</strong>
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border">
              Selesai Hari Ini
            </span>
          </div>
        )}

        {/* Tombol Aksi (Clock In & Clock Out) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {/* Tombol Clock In (Biru #2563EB, Full Pill Shape 24px) */}
          <button
            onClick={() => openCameraModal('clockIn')}
            disabled={isClockedIn}
            className={`w-full py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
              isClockedIn
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 hover:shadow-blue-600/35 hover:-translate-y-0.5'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{isClockedIn ? `Clock In (${todayEmployeeAttendance.clockInTime})` : 'Clock In Masuk'}</span>
          </button>

          {/* Tombol Clock Out (Merah #DC2626, Full Pill Shape 24px) */}
          <button
            onClick={() => openCameraModal('clockOut')}
            disabled={!isClockedIn || isClockedOut}
            className={`w-full py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
              !isClockedIn || isClockedOut
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/25 hover:shadow-red-600/35 hover:-translate-y-0.5'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>{isClockedOut ? `Clock Out (${todayEmployeeAttendance.clockOutTime})` : 'Clock Out Pulang'}</span>
          </button>
        </div>

        {/* Location Notice Tooltip */}
        {!isInsideOfficeGeofence && !isClockedIn && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-2 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-tight">
              Anda berada di luar area kantor. Kamera akan meminta Anda memasukkan alasan absensi (WFH/Dinas Luar).
            </p>
          </div>
        )}
      </div>

      {/* ZONA 3: QUICK MENU & INFO (GRID & LIST) */}
      
      {/* Announcement Card (Megaphone Icon) */}
      {latestAnnouncement && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/70 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-200/60 text-blue-800">
                  {latestAnnouncement.category}
                </span>
                <span className="text-[11px] text-slate-500">{latestAnnouncement.date}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
                {latestAnnouncement.title}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                {latestAnnouncement.content}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Grid (2x2 or 4x1) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Menu Akses Cepat
        </h3>
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {/* 1. Riwayat Absensi */}
          <button
            onClick={() => setActiveEmployeeTab('history')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 leading-tight">
              Riwayat
            </span>
          </button>

          {/* 2. Pengajuan Cuti */}
          <button
            onClick={() => setActiveEmployeeTab('leave')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-600 leading-tight">
              Cuti / Izin
            </span>
          </button>

          {/* 3. Profil */}
          <button
            onClick={() => setActiveEmployeeTab('profile')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-50 group-hover:bg-purple-600 text-purple-600 group-hover:text-white flex items-center justify-center transition-colors mb-2">
              <User className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-600 leading-tight">
              Profil
            </span>
          </button>

          {/* 4. Bantuan */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all text-center group"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-500 text-amber-600 group-hover:text-white flex items-center justify-center transition-colors mb-2">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 group-hover:text-amber-600 leading-tight">
              Bantuan
            </span>
          </button>
        </div>
      </div>

      {/* Ringkasan Cuti & Status Hari Ini */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
            {activeEmployee.remainingLeave}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Sisa Kuota Cuti Tahunan</h4>
            <p className="text-[11px] text-slate-400">Dari total hak cuti 12 hari/tahun</p>
          </div>
        </div>
        <button
          onClick={() => setActiveEmployeeTab('leave')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>Ajukan</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

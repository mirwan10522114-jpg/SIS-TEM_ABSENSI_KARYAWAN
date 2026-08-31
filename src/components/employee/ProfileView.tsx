import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  MapPin, 
  LogOut,
  Sparkles,
  Award,
  Layers
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    activeEmployee,
    geofenceConfig,
    employees,
    setActiveEmployeeId,
    setCurrentRole,
    addToast
  } = useApp();

  return (
    <div className="space-y-4 pb-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        <div className="relative pt-6">
          <div className="relative inline-block mx-auto mb-3">
            <img
              src={activeEmployee.avatar}
              alt={activeEmployee.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg mx-auto"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
            {activeEmployee.name}
          </h2>
          <p className="text-xs font-semibold text-blue-600 mt-0.5">
            {activeEmployee.role}
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-mono text-slate-600 mt-2">
            <span>NIP: {activeEmployee.nip}</span>
          </div>
        </div>
      </div>

      {/* Leave Quota Card */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Hak</span>
          <strong className="text-lg font-extrabold text-slate-900">12</strong>
          <span className="text-[10px] text-slate-400 block">Hari/Thn</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Terpakai</span>
          <strong className="text-lg font-extrabold text-amber-600">{activeEmployee.usedLeave}</strong>
          <span className="text-[10px] text-slate-400 block">Hari</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Sisa Kuota</span>
          <strong className="text-lg font-extrabold text-emerald-600">{activeEmployee.remainingLeave}</strong>
          <span className="text-[10px] text-slate-400 block">Hari</span>
        </div>
      </div>

      {/* Information Details List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
          Detail Informasi Karyawan
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Departemen
            </span>
            <strong className="text-slate-800">{activeEmployee.department}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Email Kantor
            </span>
            <strong className="text-slate-800 truncate max-w-[180px]">{activeEmployee.email}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              Telepon
            </span>
            <strong className="text-slate-800">{activeEmployee.phone}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Jadwal Shift
            </span>
            <strong className="text-slate-800">{activeEmployee.shift}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Tanggal Bergabung
            </span>
            <strong className="text-slate-800">{activeEmployee.joinDate}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Lokasi Kantor Penugasan
            </span>
            <strong className="text-slate-800 truncate max-w-[180px]">{geofenceConfig.officeName}</strong>
          </div>
        </div>
      </div>

      {/* Security & Verification Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Keamanan & Autentikasi Biometrik</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Akun Anda telah terintegrasi dengan deteksi Geofencing GPS Real-time dan validasi wajah biometrik anti-spoofing.
        </p>
      </div>

      {/* Switch to Web Admin Button */}
      <button
        onClick={() => setCurrentRole('admin')}
        className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
      >
        <Layers className="w-4 h-4 text-blue-600" />
        <span>Buka Web Admin Dashboard (HR / Owner)</span>
      </button>
    </div>
  );
};

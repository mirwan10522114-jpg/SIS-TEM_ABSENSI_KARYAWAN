import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  UserCheck, 
  Clock, 
  CalendarOff, 
  MapPin, 
  ZoomIn, 
  ArrowUpRight, 
  ShieldCheck, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    employees,
    attendanceRecords,
    leaveRequests,
    setZoomedImage,
    setActiveAdminTab,
  } = useApp();

  // Calculate top 4 statistic metrics
  const totalEmployees = employees.length;
  const todayRecords = attendanceRecords.filter(r => r.date === '2026-08-30');
  const hadirToday = todayRecords.filter(r => r.status === 'hadir' || r.status === 'wfh').length;
  const terlambatToday = todayRecords.filter(r => r.status === 'terlambat').length;
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending').length;

  const attendanceRate = totalEmployees > 0 ? Math.round(((hadirToday + terlambatToday) / totalEmployees) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Absensi & Kehadiran
          </h1>
          <p className="text-xs text-slate-500">
            Monitoring presensi real-time berbasis geofencing GPS dan verifikasi biometrik selfie.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Server Geofence Aktif
          </span>
        </div>
      </div>

      {/* 4 STATISTIK BERWARNA (TOP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Karyawan (Blue) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Karyawan</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{totalEmployees}</span>
              <span className="text-xs font-medium text-blue-600">Terdaftar</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Seluruh divisi aktif</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Hadir Hari Ini (Green / Success) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Hadir Hari Ini</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-emerald-600">{hadirToday}</span>
              <span className="text-xs font-medium text-emerald-600 font-mono">({attendanceRate}%)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tepat waktu & terverifikasi</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Terlambat (Red / Danger) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Terlambat</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-rose-600">{terlambatToday}</span>
              <span className="text-xs font-medium text-rose-600">Orang</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Lewat pukul 08.30 WIB</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* 4. Pengajuan Cuti Pending (Amber / Warning) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pending Cuti</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-amber-600">{pendingLeaves}</span>
              <span className="text-xs font-medium text-amber-600">Permohonan</span>
            </div>
            <button
              onClick={() => setActiveAdminTab('leaves')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 mt-1"
            >
              <span>Perlu Review</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CalendarOff className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Progress & Quick Geofence Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Tingkat Kehadiran Perusahaan Hari Ini
            </h3>
            <span className="text-xs font-bold text-blue-600 font-mono">{hadirToday + terlambatToday} / {totalEmployees} Karyawan</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(hadirToday / (totalEmployees || 1)) * 100}%` }}
              className="bg-emerald-500 transition-all"
              title="Hadir"
            />
            <div
              style={{ width: `${(terlambatToday / (totalEmployees || 1)) * 100}%` }}
              className="bg-rose-500 transition-all"
              title="Terlambat"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Hadir Tepat Waktu ({hadirToday})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>Terlambat ({terlambatToday})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-200"></span>
              <span>Belum Absen ({Math.max(0, totalEmployees - (hadirToday + terlambatToday))})</span>
            </div>
          </div>
        </div>

        {/* Geofence Quick Panel */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Status Geofence
              </span>
              <span className="text-[10px] bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded font-mono">100m Radius</span>
            </div>
            <h4 className="text-sm font-bold truncate">Menara Digital Prima</h4>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan
            </p>
          </div>

          <button
            onClick={() => setActiveAdminTab('geofence')}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>Ubah Koordinat & Radius</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TABEL AKTIVITAS ABSENSI TERBARU (BOTTOM) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Aktivitas Absensi Terbaru</h3>
            <p className="text-xs text-slate-500">Rekaman live clock in/out beserta foto selfie & geotag lokasi</p>
          </div>

          <button
            onClick={() => setActiveAdminTab('attendance')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Lihat Semua Log</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Waktu Presensi</th>
                <th className="py-3 px-4">Lokasi & Radius</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Bukti Selfie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceRecords.slice(0, 5).map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Karyawan */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={record.employeeAvatar}
                        alt={record.employeeName}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{record.employeeName}</p>
                        <p className="text-[11px] text-slate-500">{record.employeeDepartment}</p>
                      </div>
                    </div>
                  </td>

                  {/* Waktu */}
                  <td className="py-3.5 px-4 font-mono">
                    <p className="font-bold text-slate-800">In: {record.clockInTime} WIB</p>
                    {record.clockOutTime ? (
                      <p className="text-slate-500 text-[11px]">Out: {record.clockOutTime} WIB</p>
                    ) : (
                      <p className="text-amber-600 text-[11px] font-sans italic">Sedang Bekerja</p>
                    )}
                  </td>

                  {/* Lokasi */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-700 truncate font-medium">{record.clockInLocation.address}</p>
                    <p className="text-[11px] text-slate-400">
                      Jarak: <strong>{record.clockInLocation.distanceMeters}m</strong> ({record.clockInLocation.isInsideGeofence ? 'Dalam Area' : 'Luar Area'})
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        record.status === 'hadir'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : record.status === 'terlambat'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : record.status === 'wfh'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>

                  {/* Thumbnail Selfie */}
                  <td className="py-3.5 px-4">
                    {record.selfieClockIn ? (
                      <button
                        onClick={() =>
                          setZoomedImage({
                            url: record.selfieClockIn,
                            title: `Selfie Absensi - ${record.employeeName}`,
                            meta: `Tanggal: ${record.date} | Waktu: ${record.clockInTime} WIB | Lokasi: ${record.clockInLocation.address}`,
                          })
                        }
                        className="relative group w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm focus:outline-none hover:border-blue-500 transition-all"
                        title="Perbesar foto selfie"
                      >
                        <img
                          src={record.selfieClockIn}
                          alt="Selfie"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ZoomIn className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

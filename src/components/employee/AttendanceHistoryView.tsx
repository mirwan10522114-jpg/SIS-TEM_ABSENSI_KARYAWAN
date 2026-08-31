import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndonesianDate } from '../../utils/geo';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  LogIn, 
  LogOut, 
  ZoomIn, 
  Filter,
  FileText,
  ShieldCheck,
  Check,
  X,
  PieChart,
  Award,
  TrendingUp,
  Briefcase
} from 'lucide-react';

export const AttendanceHistoryView: React.FC = () => {
  const {
    activeEmployee,
    attendanceRecords,
    setActiveEmployeeTab,
    setZoomedImage
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'hadir' | 'terlambat' | 'cuti'>('all');
  const [selectedMonth, setSelectedMonth] = useState('2026-08'); // YYYY-MM

  // Filter records for active employee
  const employeeRecords = attendanceRecords.filter(r => r.employeeId === activeEmployee.id);

  // Records in selected month
  const monthlyRecords = employeeRecords.filter(r => r.date.startsWith(selectedMonth));

  // Monthly summary stats
  const countHadir = monthlyRecords.filter(r => r.status === 'hadir').length;
  const countTerlambat = monthlyRecords.filter(r => r.status === 'terlambat').length;
  const countWfh = monthlyRecords.filter(r => r.status === 'wfh').length;
  const countCuti = monthlyRecords.filter(r => r.status === 'cuti').length;
  const totalDaysRecorded = monthlyRecords.length;

  const attendancePercentage = totalDaysRecorded > 0 
    ? Math.round(((countHadir + countWfh) / Math.max(1, totalDaysRecorded)) * 100) 
    : 100;

  // Filter for display
  const filteredRecords = monthlyRecords.filter(record => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'hadir') return record.status === 'hadir' || record.status === 'wfh';
    if (activeFilter === 'terlambat') return record.status === 'terlambat';
    if (activeFilter === 'cuti') return record.status === 'cuti';
    return true;
  });

  return (
    <div className="space-y-4 pb-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveEmployeeTab('home')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Riwayat & Rekap Bulanan</h1>
            <p className="text-xs text-slate-500">Rekapitulasi kehadiran perorangan per bulan</p>
          </div>
        </div>
      </div>

      {/* MONTH SELECTOR & SUMMARY CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 rounded-2xl p-4 sm:p-5 text-white shadow-md space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider block">
              Rekapitulasi Kehadiran Saya
            </span>
            <h3 className="text-base font-extrabold text-white">
              {activeEmployee.name}
            </h3>
          </div>

          {/* Month Picker Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* 4 Summary Score Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Hadir Tepat Waktu</span>
            <span className="text-xl font-extrabold text-emerald-400">{countHadir} Hari</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Terlambat Masuk</span>
            <span className="text-xl font-extrabold text-rose-400">{countTerlambat} Hari</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">WFH / Remote</span>
            <span className="text-xl font-extrabold text-amber-400">{countWfh} Hari</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">Persentase Kehadiran</span>
            <span className="text-xl font-extrabold text-blue-400">{attendancePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Tab Filter (Semua | Hadir | Terlambat | Cuti) */}
      <div className="flex items-center p-1 bg-slate-200/80 rounded-xl gap-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua ({monthlyRecords.length})
        </button>
        <button
          onClick={() => setActiveFilter('hadir')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'hadir'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Hadir
        </button>
        <button
          onClick={() => setActiveFilter('terlambat')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'terlambat'
              ? 'bg-white text-rose-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Terlambat
        </button>
        <button
          onClick={() => setActiveFilter('cuti')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'cuti'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cuti
        </button>
      </div>

      {/* List View: Vertical history cards */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-100 text-center text-slate-400 text-xs">
            Tidak ada riwayat absensi pada bulan {selectedMonth}.
          </div>
        ) : (
          filteredRecords.map((item) => {
            const formattedDate = formatIndonesianDate(item.date);
            const isLate = item.status === 'terlambat';
            const approvalStatus = item.approvalStatus || 'approved';

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] hover:shadow-md transition-all space-y-3"
              >
                {/* Header Card: Date & Approval Badge */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{formattedDate}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {item.id}</p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        item.status === 'hadir'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'terlambat'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.status === 'wfh'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {item.status === 'hadir' ? 'Hadir Tepat Waktu' : item.status.toUpperCase()}
                    </span>

                    {/* Admin Approval Status */}
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        approvalStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : approvalStatus === 'pending_approval'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {approvalStatus === 'approved' && <Check className="w-3 h-3 text-emerald-700" />}
                      {approvalStatus === 'pending_approval' && <AlertTriangle className="w-3 h-3 text-amber-700" />}
                      {approvalStatus === 'rejected' && <X className="w-3 h-3 text-rose-700" />}
                      <span>
                        {approvalStatus === 'approved'
                          ? 'Disetujui Admin HR'
                          : approvalStatus === 'pending_approval'
                          ? 'Menunggu Approval Admin'
                          : 'Ditolak Admin HR'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Detail Clock In / Out & Selfie Thumbnail */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    {/* Clock In */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <LogIn className="w-3 h-3" />
                      </span>
                      <span className="text-slate-500">Masuk:</span>
                      <strong className="text-slate-900 font-mono">{item.clockInTime} WIB</strong>
                      {isLate && (
                        <span className="text-[10px] text-rose-600 font-semibold">(Terlambat)</span>
                      )}
                    </div>

                    {/* Clock Out */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <LogOut className="w-3 h-3" />
                      </span>
                      <span className="text-slate-500">Pulang:</span>
                      {item.clockOutTime ? (
                        <strong className="text-slate-900 font-mono">{item.clockOutTime} WIB</strong>
                      ) : (
                        <span className="text-slate-400 italic">Belum clock out</span>
                      )}
                    </div>

                    {/* Biometric Match & Location */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                      <span className="font-semibold text-blue-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Foto Selfie Terlampir</span>
                      </span>
                      <span>•</span>
                      <span className="line-clamp-1">{item.clockInLocation.address} ({item.clockInLocation.distanceMeters}m)</span>
                    </div>
                  </div>

                  {/* Selfie Photo Thumbnail (Click to zoom) */}
                  {item.selfieClockIn && (
                    <button
                      onClick={() =>
                        setZoomedImage({
                          url: item.selfieClockIn,
                          title: `Selfie Presensi - ${item.employeeName}`,
                          meta: `Tanggal: ${formattedDate} | Masuk: ${item.clockInTime} WIB | Biometrik: ${item.faceMatchConfidence || 95}% Match | GPS: ${item.clockInLocation.address}`,
                        })
                      }
                      className="relative group shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200/80 shadow-xs focus:outline-none hover:border-blue-500 transition-all cursor-pointer"
                      title="Klik untuk memperbesar foto selfie"
                    >
                      <img
                        src={item.selfieClockIn}
                        alt="Thumbnail Selfie"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Reasons Provided for Late, Early, or WFH */}
                {(item.reason || item.earlyClockOutReason || item.notes) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 space-y-1">
                    {item.reason && (
                      <p>
                        <strong className="text-amber-700">Alasan Masuk / WFH:</strong> "{item.reason}"
                      </p>
                    )}
                    {item.earlyClockOutReason && (
                      <p>
                        <strong className="text-rose-700">Alasan Pulang Cepat:</strong> "{item.earlyClockOutReason}"
                      </p>
                    )}
                    {item.notes && (
                      <p>
                        <strong className="text-slate-700">Catatan:</strong> {item.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

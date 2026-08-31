import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndonesianDate } from '../../utils/geo';
import { 
  Calendar, 
  Search, 
  Download, 
  Filter, 
  ZoomIn, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  LogIn, 
  LogOut,
  FileSpreadsheet,
  Check,
  X,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  Printer,
  FileText,
  PieChart,
  User
} from 'lucide-react';

export const AdminAttendanceView: React.FC = () => {
  const { 
    attendanceRecords, 
    employees,
    approveAttendanceRecord, 
    rejectAttendanceRecord, 
    setZoomedImage, 
    addToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'daily' | 'recap'>('daily');

  // Daily View Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Monthly Recap View States
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || 'emp-01');
  const [selectedMonth, setSelectedMonth] = useState('2026-08'); // YYYY-MM

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];

  // Daily Records Filtered
  const filteredDaily = attendanceRecords.filter(record => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.clockInLocation.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
    const matchesApproval = approvalFilter === 'ALL' || (record.approvalStatus || 'approved') === approvalFilter;
    const matchesDate = !dateFilter || record.date === dateFilter;

    return matchesSearch && matchesStatus && matchesApproval && matchesDate;
  });

  const pendingApprovalsCount = attendanceRecords.filter(r => (r.approvalStatus || 'approved') === 'pending_approval').length;

  // Monthly Records for Selected Employee & Month
  const employeeMonthlyRecords = attendanceRecords.filter(
    r => r.employeeId === selectedEmployeeId && r.date.startsWith(selectedMonth)
  );

  const countHadir = employeeMonthlyRecords.filter(r => r.status === 'hadir').length;
  const countTerlambat = employeeMonthlyRecords.filter(r => r.status === 'terlambat').length;
  const countWfh = employeeMonthlyRecords.filter(r => r.status === 'wfh').length;
  const countCuti = employeeMonthlyRecords.filter(r => r.status === 'cuti').length;
  const totalRecorded = employeeMonthlyRecords.length;

  const attendancePercentage = totalRecorded > 0 
    ? Math.round(((countHadir + countWfh) / Math.max(1, totalRecorded)) * 100)
    : 100;

  const exportDailyToCSV = () => {
    const headers = ['ID', 'Nama Karyawan', 'Departemen', 'Tanggal', 'Clock In', 'Clock Out', 'Status', 'Verifikasi Admin', 'Jarak Geofence (m)', 'Alasan'];
    const rows = filteredDaily.map(r => [
      r.id,
      `"${r.employeeName}"`,
      `"${r.employeeDepartment}"`,
      r.date,
      r.clockInTime,
      r.clockOutTime || '-',
      r.status,
      r.approvalStatus || 'approved',
      r.clockInLocation.distanceMeters,
      `"${r.reason || r.earlyClockOutReason || r.clockInLocation.address}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Absensi_${dateFilter || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Export Berhasil',
      message: `${filteredDaily.length} data presensi telah diexport ke CSV.`,
    });
  };

  const handlePrintMonthlyRecap = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Main Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Rekapitulasi & Persetujuan Absensi HR</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs">
                {pendingApprovalsCount} Menunggu Approval
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit presensi harian, verifikasi alasan terlambat/WFH, dan rekap bulanan per karyawan.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log Presensi Harian</span>
          </button>
          <button
            onClick={() => setActiveTab('recap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'recap'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Rekapitulasi Bulanan</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LOG PRESENSI HARIAN & APPROVAL */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 flex-1 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
              {/* Search */}
              <div className="sm:col-span-5 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama karyawan, departemen, atau lokasi..."
                  className="w-full text-xs bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Date Filter */}
              <div className="sm:col-span-3">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="sm:col-span-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="hadir">Hadir Tepat Waktu</option>
                  <option value="terlambat">Terlambat</option>
                  <option value="wfh">WFH / Remote</option>
                </select>
              </div>

              {/* Approval Filter */}
              <div className="sm:col-span-2">
                <select
                  value={approvalFilter}
                  onChange={(e) => setApprovalFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Approval</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            </div>

            <button
              onClick={exportDailyToCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Daily Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {filteredDaily.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Tidak ada data presensi yang sesuai dengan filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="py-3.5 px-4">Karyawan</th>
                      <th className="py-3.5 px-4">Clock In / Out</th>
                      <th className="py-3.5 px-4">Wajah & GPS</th>
                      <th className="py-3.5 px-4">Alasan Terlambat / Pulang Cepat</th>
                      <th className="py-3.5 px-4">Approval Admin</th>
                      <th className="py-3.5 px-4 text-center">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDaily.map((record) => {
                      const approvalStatus = record.approvalStatus || 'approved';
                      const isPending = approvalStatus === 'pending_approval';

                      return (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Karyawan */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={record.employeeAvatar}
                                alt={record.employeeName}
                                className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">{record.employeeName}</p>
                                <p className="text-[11px] text-slate-500">{record.employeeDepartment}</p>
                              </div>
                            </div>
                          </td>

                          {/* Clock In / Out */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                              <LogIn className="w-3.5 h-3.5 text-blue-600" />
                              <span>{record.clockInTime} WIB</span>
                            </div>
                            {record.clockOutTime ? (
                              <div className="flex items-center gap-1.5 text-red-600 font-medium text-[11px] mt-0.5">
                                <LogOut className="w-3.5 h-3.5 text-red-500" />
                                <span>{record.clockOutTime} WIB</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Belum clock out</span>
                            )}
                            <span className="text-[10px] text-slate-400 block mt-1">
                              {formatIndonesianDate(record.date)}
                            </span>
                          </td>

                          {/* Wajah & GPS */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {record.selfieClockIn && (
                                <button
                                  onClick={() =>
                                    setZoomedImage({
                                      url: record.selfieClockIn,
                                      title: `Selfie Presensi - ${record.employeeName}`,
                                      meta: `Tanggal: ${record.date} | Clock In: ${record.clockInTime} | GPS: ${record.clockInLocation.address}`,
                                    })
                                  }
                                  className="relative group w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0 cursor-pointer"
                                  title="Lihat foto selfie"
                                >
                                  <img
                                    src={record.selfieClockIn}
                                    alt="Selfie"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                </button>
                              )}
                              <div className="text-[11px]">
                                <span className="font-semibold text-blue-700 flex items-center gap-1">
                                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Foto Selfie Terlampir</span>
                                </span>
                                <span className="text-slate-500 block text-[10px] truncate max-w-[150px]">
                                  {record.clockInLocation.isInsideGeofence ? 'Di Kantor' : 'WFH'} ({record.clockInLocation.distanceMeters}m)
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Alasan */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {record.reason && (
                              <div className="text-xs">
                                <span className="font-semibold text-amber-700 block text-[10px] uppercase">Alasan Masuk / WFH:</span>
                                <p className="text-slate-700 italic bg-amber-50/80 p-2 rounded-lg border border-amber-200/60 mt-0.5">
                                  "{record.reason}"
                                </p>
                              </div>
                            )}
                            {record.earlyClockOutReason && (
                              <div className="text-xs mt-1">
                                <span className="font-semibold text-rose-700 block text-[10px] uppercase">Alasan Pulang Cepat:</span>
                                <p className="text-slate-700 italic bg-rose-50/80 p-2 rounded-lg border border-rose-200/60 mt-0.5">
                                  "{record.earlyClockOutReason}"
                                </p>
                              </div>
                            )}
                            {!record.reason && !record.earlyClockOutReason && (
                              <span className="text-slate-400 text-[11px] italic">Tepat waktu & sesuai shift</span>
                            )}
                          </td>

                          {/* Approval Status Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                approvalStatus === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : approvalStatus === 'pending_approval'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-300 animate-pulse'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {approvalStatus === 'approved' && <Check className="w-3 h-3 text-emerald-600" />}
                              {approvalStatus === 'pending_approval' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                              {approvalStatus === 'rejected' && <X className="w-3 h-3 text-rose-600" />}
                              <span>
                                {approvalStatus === 'approved'
                                  ? 'Disetujui Admin'
                                  : approvalStatus === 'pending_approval'
                                  ? 'Perlu Approval'
                                  : 'Ditolak Admin'}
                              </span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-center">
                            {isPending ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => approveAttendanceRecord(record.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                                  title="Setujui alasan absensi ini"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  onClick={() => rejectAttendanceRecord(record.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                                  title="Tolak absensi ini"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Tolak</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">
                                {approvalStatus === 'approved' ? 'Tervalidasi' : 'Ditolak'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REKAPITULASI BULANAN PER KARYAWAN */}
      {activeTab === 'recap' && (
        <div className="space-y-5">
          {/* Selector Toolbar: Karyawan & Month */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Select Employee */}
            <div className="sm:col-span-6 space-y-1">
              <label className="block text-xs font-bold text-slate-700">Pilih Karyawan:</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.nip}) • {emp.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Month */}
            <div className="sm:col-span-4 space-y-1">
              <label className="block text-xs font-bold text-slate-700">Pilih Bulan & Tahun:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Print Button */}
            <div className="sm:col-span-2 pt-5 sm:pt-0">
              <button
                onClick={handlePrintMonthlyRecap}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Cetak Rekap</span>
              </button>
            </div>
          </div>

          {/* Monthly Scorecard Banner */}
          {selectedEmployee && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-4 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-md shrink-0"
                  />
                  <div>
                    <h2 className="text-lg font-extrabold text-white">{selectedEmployee.name}</h2>
                    <p className="text-xs text-slate-400 font-mono">
                      NIP: {selectedEmployee.nip} • {selectedEmployee.role}
                    </p>
                    <p className="text-xs text-blue-400 font-medium mt-0.5">
                      Departemen: {selectedEmployee.department} • Shift: {selectedEmployee.shift}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-2xl text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Periode Laporan</span>
                  <strong className="text-sm font-extrabold text-white">{selectedMonth}</strong>
                </div>
              </div>

              {/* 4 Scorecard Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Hadir Tepat Waktu</span>
                  <span className="text-2xl font-extrabold text-emerald-400">{countHadir} Hari</span>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Terlambat Masuk</span>
                  <span className="text-2xl font-extrabold text-rose-400">{countTerlambat} Hari</span>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Presensi WFH</span>
                  <span className="text-2xl font-extrabold text-amber-400">{countWfh} Hari</span>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Tingkat Kehadiran (%)</span>
                  <span className="text-2xl font-extrabold text-blue-400">{attendancePercentage}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Individual Attendance Table for Month */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800">
                Detail Log Kehadiran Per Hari (Bulan {selectedMonth})
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Total Record: {employeeMonthlyRecords.length} Hari
              </span>
            </div>

            {employeeMonthlyRecords.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs">
                Belum ada data presensi terverifikasi untuk karyawan ini pada bulan {selectedMonth}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Clock In / Out</th>
                      <th className="py-3 px-4">Status Shift</th>
                      <th className="py-3 px-4">Approval Status</th>
                      <th className="py-3 px-4">Alasan Terlambat / Pulang Cepat</th>
                      <th className="py-3 px-4">Selfie & Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employeeMonthlyRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatIndonesianDate(rec.date)}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="text-blue-700 font-bold">{rec.clockInTime} WIB</span>
                          {rec.clockOutTime ? (
                            <span className="text-red-600 block text-[11px]">{rec.clockOutTime} WIB</span>
                          ) : (
                            <span className="text-slate-400 block text-[10px] italic">Belum clock out</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            rec.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                            rec.status === 'terlambat' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            (rec.approvalStatus || 'approved') === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {(rec.approvalStatus || 'approved') === 'approved' ? 'Disetujui Admin' : 'Pending Approval'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          {rec.reason || rec.earlyClockOutReason ? (
                            <span className="text-slate-700 italic">"{rec.reason || rec.earlyClockOutReason}"</span>
                          ) : (
                            <span className="text-slate-400 italic">Sesuai Prosedur Shift</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[11px]">
                          <span className="font-semibold text-emerald-700">{rec.faceMatchConfidence || 95}% Biometric Match</span>
                          <span className="text-slate-500 block text-[10px] truncate max-w-[140px]">{rec.clockInLocation.address}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveType } from '../../types';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Clock, 
  Send, 
  Paperclip, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  X,
  FileCheck,
  Building,
  User,
  Timer,
  Check,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LeaveRequestView: React.FC = () => {
  const {
    activeEmployee,
    leaveRequests,
    submitLeaveRequest,
    overtimeRequests,
    submitOvertimeRequest,
    setActiveEmployeeTab,
    addToast,
    setZoomedImage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'leave' | 'overtime'>('leave');

  // LEAVE FORM STATES
  const [leaveType, setLeaveType] = useState<LeaveType>('Cuti Tahunan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // OVERTIME FORM STATES
  const [overtimeDate, setOvertimeDate] = useState('2026-08-30');
  const [startTime, setStartTime] = useState('17:30');
  const [endTime, setEndTime] = useState('20:30');
  const [overtimeReason, setOvertimeReason] = useState('');

  // Filter requests for active employee
  const myLeaveRequests = leaveRequests.filter(r => r.employeeId === activeEmployee.id);
  const myOvertimeRequests = overtimeRequests.filter(r => r.employeeId === activeEmployee.id);

  // Calculate leave days
  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : Math.max(1, diffDays);
  };

  // Calculate overtime hours
  const calculateOvertimeHours = () => {
    if (!startTime || !endTime) return 1;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    if (endMinutes < startMinutes) endMinutes += 24 * 60; // Overnight overtime
    const diffHours = (endMinutes - startMinutes) / 60;
    return isNaN(diffHours) ? 1 : Math.round(diffHours * 10) / 10;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      addToast({
        type: 'info',
        title: 'Dokumen Terlampir',
        message: file.name,
      });
    }
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      addToast({
        type: 'warning',
        title: 'Form Belum Lengkap',
        message: 'Mohon isi tanggal dan alasan pengajuan cuti/izin.',
      });
      return;
    }

    const totalDays = calculateTotalDays();
    if (leaveType === 'Cuti Tahunan' && totalDays > activeEmployee.remainingLeave) {
      addToast({
        type: 'error',
        title: 'Kuota Cuti Tidak Cukup',
        message: `Sisa cuti Anda (${activeEmployee.remainingLeave} hari) tidak mencukupi untuk pengajuan ${totalDays} hari.`,
      });
      return;
    }

    submitLeaveRequest({
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      attachmentName: attachmentName || undefined,
      attachmentUrl: attachmentName ? 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80' : undefined,
    });

    // Reset
    setStartDate('');
    setEndDate('');
    setReason('');
    setAttachmentName(null);
  };

  const handleOvertimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overtimeDate || !startTime || !endTime || !overtimeReason.trim()) {
      addToast({
        type: 'warning',
        title: 'Form Belum Lengkap',
        message: 'Mohon lengkapi tanggal, jam, dan alasan lembur.',
      });
      return;
    }

    // Parse employee shift end time (e.g. "Shift Pagi (08:00 - 17:00 WIB)" -> "17:00")
    const matchEnd = activeEmployee.shift.match(/-\s*(\d{2}:\d{2})/);
    const shiftEndTimeStr = matchEnd ? matchEnd[1] : '17:00';

    // Validate that startTime is NOT during shift working hours
    if (startTime < shiftEndTimeStr) {
      addToast({
        type: 'error',
        title: 'Jam Lembur Tidak Valid',
        message: `Pengajuan jam lembur hanya berlaku setelah jam shift kerja Anda selesai (Setelah jam ${shiftEndTimeStr} WIB).`,
      });
      return;
    }

    const hours = calculateOvertimeHours();
    submitOvertimeRequest({
      date: overtimeDate,
      startTime,
      endTime,
      hours,
      reason: overtimeReason,
    });

    // Reset
    setOvertimeReason('');
  };

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
            <h1 className="text-xl font-extrabold text-slate-900">Pengajuan Cuti & Lembur</h1>
            <p className="text-xs text-slate-500">Izin tidak hadir kerja, sakit, atau jam lembur tambahan</p>
          </div>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center p-1 bg-slate-200/80 rounded-xl gap-1">
        <button
          onClick={() => setActiveTab('leave')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'leave'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Izin / Cuti Tidak Hadir</span>
        </button>

        <button
          onClick={() => setActiveTab('overtime')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'overtime'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Pengajuan Jam Lembur</span>
        </button>
      </div>

      {/* TAB 1: PERMOHONAN CUTI / IZIN SAKIT */}
      {activeTab === 'leave' && (
        <div className="space-y-4">
          {/* Card Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Form Pengajuan Izin / Cuti</span>
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                Sisa Cuti: {activeEmployee.remainingLeave} Hari
              </span>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Permohonan *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan</option>
                  <option value="Cuti Sakit">Cuti Sakit (Lampirkan Surat Dokter)</option>
                  <option value="Cuti Alasan Penting">Izin Alasan Penting (Keluarga/Menikah)</option>
                  <option value="Cuti Melahirkan">Cuti Melahirkan</option>
                  <option value="Dinas Luar">Dinas Luar Kota / Tugas Lapangan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mulai Tanggal *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sampai Tanggal *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan Keperluan *</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan alasan detail pengajuan permohonan izin/cuti ini..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Upload Document Attachment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Unggah Dokumen Lampiran (Surat Dokter/Surat Tugas - Opsional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 border-dashed cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>{attachmentName ? attachmentName : 'Pilih Berkas Dokumen (PDF/Foto)'}</span>
                    <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
                  </label>
                  {attachmentName && (
                    <button
                      type="button"
                      onClick={() => setAttachmentName(null)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Permohonan Izin ({calculateTotalDays()} Hari)</span>
              </button>
            </form>
          </div>

          {/* List Riwayat Cuti */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Riwayat Pengajuan Cuti Saya ({myLeaveRequests.length})
            </h3>
            {myLeaveRequests.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-100 text-center text-slate-400 text-xs">
                Belum ada riwayat permohonan cuti.
              </div>
            ) : (
              myLeaveRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{req.leaveType}</h4>
                      <p className="text-[10px] text-slate-500">{req.startDate} s.d. {req.endDate} ({req.totalDays} Hari)</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      req.status === 'disetujui' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      req.status === 'ditolak' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{req.reason}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PENGAJUAN JAM LEMBUR */}
      {activeTab === 'overtime' && (
        <div className="space-y-4">
          {/* Overtime Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <Timer className="w-4 h-4 text-indigo-600" />
                <span>Form Pengajuan Jam Lembur Kerja</span>
              </span>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                Estimasi: {calculateOvertimeHours()} Jam
              </span>
            </div>

            <form onSubmit={handleOvertimeSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="block text-indigo-950">Shift Kerja Anda: {activeEmployee.shift}</strong>
                  <span>Pengajuan jam lembur hanya berlaku <strong>setelah jam shift kerja Anda selesai</strong>.</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Lembur *</label>
                <input
                  type="date"
                  value={overtimeDate}
                  onChange={(e) => setOvertimeDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Mulai Lembur *</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Selesai Lembur *</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tugas / Alasan Lembur *</label>
                <textarea
                  rows={3}
                  value={overtimeReason}
                  onChange={(e) => setOvertimeReason(e.target.value)}
                  placeholder="Contoh: Deployment patch rilis fitur baru, penanganan bug kritis server, dll."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pengajuan Lembur ({calculateOvertimeHours()} Jam)</span>
              </button>
            </form>
          </div>

          {/* List Riwayat Lembur */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Riwayat Pengajuan Lembur Saya ({myOvertimeRequests.length})
            </h3>
            {myOvertimeRequests.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-100 text-center text-slate-400 text-xs">
                Belum ada pengajuan jam lembur.
              </div>
            ) : (
              myOvertimeRequests.map((ovt) => (
                <div key={ovt.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Lembur {ovt.hours} Jam</h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {ovt.date} • {ovt.startTime} - {ovt.endTime} WIB
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      ovt.status === 'disetujui' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      ovt.status === 'ditolak' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {ovt.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{ovt.reason}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Check, 
  X, 
  FileText, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Paperclip, 
  Search, 
  Filter,
  UserCheck,
  Building,
  Eye,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminLeaveApprovalView: React.FC = () => {
  const {
    leaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
    setZoomedImage,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingRequests = leaveRequests.filter(r => r.status === 'pending');
  const historyRequests = leaveRequests.filter(r => r.status !== 'pending');

  const displayedList = (activeTab === 'pending' ? pendingRequests : historyRequests).filter(req =>
    req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.employeeDepartment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = (id: string, name: string) => {
    approveLeaveRequest(id, 'Admin HR (Dewi Lestari)');
  };

  const handleConfirmReject = () => {
    if (!rejectingId) return;
    rejectLeaveRequest(rejectingId, rejectionReason, 'Admin HR (Dewi Lestari)');
    setRejectingId(null);
    setRejectionReason('');
  };

  const handleViewAttachment = (req: typeof leaveRequests[0]) => {
    if (req.attachmentName) {
      setZoomedImage({
        url: req.attachmentUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
        title: `Dokumen Lampiran - ${req.leaveType} (${req.employeeName})`,
        meta: `Berkas: ${req.attachmentName} | Diajukan Tanggal: ${req.appliedDate}`,
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Modul Persetujuan Izin & Cuti Tidak Hadir</h1>
          <p className="text-xs text-slate-500">
            Audit dan proses pengajuan izin sakit, dinas luar, serta cuti tidak hadir kerja karyawan.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Menunggu Review</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px]">
              {pendingRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Riwayat Keputusan</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px]">
              {historyRequests.length}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan nama karyawan, departemen, atau jenis izin..."
          className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {displayedList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            Tidak ada permohonan izin pada kategori ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Karyawan</th>
                  <th className="py-3.5 px-4">Jenis Permohonan & Tanggal</th>
                  <th className="py-3.5 px-4">Durasi</th>
                  <th className="py-3.5 px-4">Alasan & Dokumen Lampiran</th>
                  <th className="py-3.5 px-4">Status Review</th>
                  <th className="py-3.5 px-4 text-right">Aksi Keputusan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedList.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Karyawan */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.employeeAvatar}
                          alt={req.employeeName}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{req.employeeName}</p>
                          <p className="text-[11px] text-slate-500">{req.employeeDepartment}</p>
                        </div>
                      </div>
                    </td>

                    {/* Jenis & Tanggal */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">{req.leaveType}</p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3 text-blue-600" />
                        <span>{req.startDate} s.d. {req.endDate}</span>
                      </div>
                    </td>

                    {/* Durasi */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 font-mono">
                        {req.totalDays} Hari
                      </span>
                    </td>

                    {/* Alasan & Lampiran */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">
                        "{req.reason}"
                      </p>
                      {req.attachmentName ? (
                        <button
                          onClick={() => handleViewAttachment(req)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold mt-1.5 transition-colors border border-blue-200 cursor-pointer"
                          title="Lihat dokumen lampiran"
                        >
                          <Paperclip className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate max-w-[130px]">{req.attachmentName}</span>
                          <Eye className="w-3 h-3 ml-0.5 opacity-70" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 block mt-1 italic">Tanpa dokumen lampiran</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          req.status === 'disetujui'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'ditolak'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.reviewedBy && (
                        <p className="text-[10px] text-slate-400 mt-1">Oleh: {req.reviewedBy}</p>
                      )}
                    </td>

                    {/* Aksi (Setujui & Tolak) */}
                    <td className="py-4 px-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req.id, req.employeeName)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            title="Setujui Permohonan Izin"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => setRejectingId(req.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            title="Tolak Permohonan Izin"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal with Reason */}
      <AnimatePresence>
        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Tolak Pengajuan Izin / Cuti</h3>
                  <p className="text-xs text-slate-500">Berikan catatan alasan penolakan bagi karyawan</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Jadwal bertabrakan dengan rilis proyek penting, kuota cuti divisi sedang penuh, dll."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 cursor-pointer"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

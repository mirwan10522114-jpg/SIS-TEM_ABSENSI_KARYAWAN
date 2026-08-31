import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndonesianDate } from '../../utils/geo';
import { 
  Clock, 
  Check, 
  X, 
  Search, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  FileText,
  PieChart,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminOvertimeApprovalView: React.FC = () => {
  const { overtimeRequests, approveOvertimeRequest, rejectOvertimeRequest } = useApp();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Reject Modal State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingRequests = overtimeRequests.filter(r => r.status === 'pending');
  const historyRequests = overtimeRequests.filter(r => r.status !== 'pending');

  const displayedList = (activeTab === 'pending' ? pendingRequests : historyRequests).filter(r =>
    r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.employeeDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmReject = () => {
    if (!rejectingId) return;
    rejectOvertimeRequest(rejectingId, rejectionReason, 'Admin HR (Dewi Lestari)');
    setRejectingId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Modul Persetujuan Jam Lembur</h1>
          <p className="text-xs text-slate-500">
            Audit dan verifikasi pengajuan jam lembur karyawan serta alasan pekerjaan.
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
            <span>Menunggu Approval</span>
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

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan nama karyawan, departemen, atau alasan pekerjaan lembur..."
          className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Overtime Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {displayedList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            Tidak ada permohonan lembur pada kategori ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Karyawan</th>
                  <th className="py-3.5 px-4">Tanggal & Jam Lembur</th>
                  <th className="py-3.5 px-4">Durasi Lembur</th>
                  <th className="py-3.5 px-4">Alasan / Pekerjaan Lembur</th>
                  <th className="py-3.5 px-4">Status Review</th>
                  <th className="py-3.5 px-4 text-right">Aksi Keputusan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedList.map((ovt) => (
                  <tr key={ovt.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Karyawan */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ovt.employeeAvatar}
                          alt={ovt.employeeName}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{ovt.employeeName}</p>
                          <p className="text-[11px] text-slate-500">{ovt.employeeDepartment}</p>
                        </div>
                      </div>
                    </td>

                    {/* Tanggal & Jam */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{formatIndonesianDate(ovt.date)}</p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 font-mono">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>{ovt.startTime} - {ovt.endTime} WIB</span>
                      </div>
                    </td>

                    {/* Durasi */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60 font-mono">
                        {ovt.hours} Jam
                      </span>
                    </td>

                    {/* Alasan */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-slate-700 italic bg-slate-50 p-2 rounded-xl border border-slate-200/60 leading-relaxed">
                        "{ovt.reason}"
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          ovt.status === 'disetujui'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ovt.status === 'ditolak'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ovt.status}
                      </span>
                      {ovt.reviewedBy && (
                        <p className="text-[10px] text-slate-400 mt-1">Oleh: {ovt.reviewedBy}</p>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 text-right">
                      {ovt.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveOvertimeRequest(ovt.id, 'Admin HR (Dewi Lestari)')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            title="Setujui Lembur"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => setRejectingId(ovt.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            title="Tolak Lembur"
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

      {/* Reject Modal */}
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
                  <h3 className="font-extrabold text-slate-900 text-base">Tolak Pengajuan Jam Lembur</h3>
                  <p className="text-xs text-slate-500">Berikan alasan penolakan jam lembur</p>
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
                  placeholder="Contoh: Pekerjaan tidak masuk prioritas lembur, tidak ada Surat Perintah Lembur dari atasan."
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

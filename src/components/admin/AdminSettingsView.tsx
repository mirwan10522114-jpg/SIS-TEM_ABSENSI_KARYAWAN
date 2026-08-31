import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sliders, 
  Save, 
  RotateCcw, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Award, 
  Building, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Info,
  KeyRound,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { 
    resetMonthlyLeaveQuota, 
    addToast 
  } = useApp();

  // Settings local state
  const [monthlyLeaveAllowance, setMonthlyLeaveAllowance] = useState(1);
  const [yearlyLeaveQuota, setYearlyLeaveQuota] = useState(12);
  const [autoResetLeaveDay, setAutoResetLeaveDay] = useState(1);
  const [lateToleranceMinutes, setLateToleranceMinutes] = useState(15);
  
  // 3 Shift Times Config
  const [shiftPagiStart, setShiftPagiStart] = useState('08:00');
  const [shiftPagiEnd, setShiftPagiEnd] = useState('17:00');
  const [shiftSiangStart, setShiftSiangStart] = useState('13:00');
  const [shiftSiangEnd, setShiftSiangEnd] = useState('21:00');
  const [shiftMalamStart, setShiftMalamStart] = useState('21:00');
  const [shiftMalamEnd, setShiftMalamEnd] = useState('05:00');

  const [minFaceMatchConfidence, setMinFaceMatchConfidence] = useState(85);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Fetch settings from API
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.monthlyLeaveAllowance) setMonthlyLeaveAllowance(data.monthlyLeaveAllowance);
          if (data.yearlyLeaveQuota) setYearlyLeaveQuota(data.yearlyLeaveQuota);
          if (data.autoResetLeaveDay) setAutoResetLeaveDay(data.autoResetLeaveDay);
          if (data.lateToleranceMinutes) setLateToleranceMinutes(data.lateToleranceMinutes);
          
          if (data.shiftPagiStart) setShiftPagiStart(data.shiftPagiStart);
          if (data.shiftPagiEnd) setShiftPagiEnd(data.shiftPagiEnd);
          if (data.shiftSiangStart) setShiftSiangStart(data.shiftSiangStart);
          if (data.shiftSiangEnd) setShiftSiangEnd(data.shiftSiangEnd);
          if (data.shiftMalamStart) setShiftMalamStart(data.shiftMalamStart);
          if (data.shiftMalamEnd) setShiftMalamEnd(data.shiftMalamEnd);

          if (data.minFaceMatchConfidence) setMinFaceMatchConfidence(data.minFaceMatchConfidence);
        }
      })
      .catch(err => console.warn('Failed to load settings:', err));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyLeaveAllowance,
          yearlyLeaveQuota,
          autoResetLeaveDay,
          lateToleranceMinutes,
          shiftPagiStart,
          shiftPagiEnd,
          shiftSiangStart,
          shiftSiangEnd,
          shiftMalamStart,
          shiftMalamEnd,
          minFaceMatchConfidence,
        }),
      });

      addToast({
        type: 'success',
        title: 'Pengaturan Berhasil Disimpan',
        message: 'Seluruh konfigurasi 3 shift (Pagi/Siang/Malam) & kebijakan perusahaan telah diperbarui.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan pengaturan.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualResetLeave = async () => {
    if (window.confirm('Apakah Anda yakin ingin memproses reset kuota cuti bulanan sekarang?')) {
      setIsResetting(true);
      await resetMonthlyLeaveQuota();
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Pengaturan & Kebijakan Absensi</h1>
          <p className="text-xs text-slate-500">
            Kelola konfigurasi 3 Shift Kerja (Pagi/Siang/Malam), aturan cuti bulanan, dan jam lembur.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          {isSaving ? (
            <span>Menyimpan...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Aturan Kebijakan</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: KEBIJAKAN CUTI & RESET BULANAN */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Calendar className="w-5 h-5" />
              <h3 className="font-extrabold text-slate-900 text-sm">Kebijakan Cuti & Reset Bulanan</h3>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              Auto Reset Tanggal 1
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jatah Cuti Bulanan (+Hari per Bulan)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={monthlyLeaveAllowance}
                onChange={(e) => setMonthlyLeaveAllowance(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Setiap tanggal 1 bulan baru, setiap karyawan aktif menerima +{monthlyLeaveAllowance} hari cuti.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Total Jatah Cuti Tahunan (Maksimal)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={yearlyLeaveQuota}
                onChange={(e) => setYearlyLeaveQuota(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tanggal Auto-Reset Cuti Bulanan
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-bold text-slate-800">Tanggal 1 Setiap Bulan Baru</span>
              </div>
            </div>

            {/* Trigger Reset Manual Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleManualResetLeave}
                disabled={isResetting}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isResetting ? (
                  <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                )}
                <span>Jalankan Reset Kuota Cuti Bulanan Sekarang</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: PENGATURAN JAM 3 SHIFT KERJA PERUSAHAAN */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-indigo-600">
              <Clock className="w-5 h-5" />
              <h3 className="font-extrabold text-slate-900 text-sm">Aturan Jam Kerja 3 Shift</h3>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              Pagi • Siang • Malam
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Toleransi Terlambat */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Toleransi Keterlambatan Masuk (Menit)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={lateToleranceMinutes}
                  onChange={(e) => setLateToleranceMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-600 shrink-0">Menit</span>
              </div>
            </div>

            {/* Shift 1: Pagi */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-900 text-xs">
                <Sun className="w-4 h-4 text-amber-600" />
                <span>1. Shift Pagi</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Jam Masuk</span>
                  <input
                    type="time"
                    value={shiftPagiStart}
                    onChange={(e) => setShiftPagiStart(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-amber-300 font-mono font-bold text-xs text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Jam Selesai</span>
                  <input
                    type="time"
                    value={shiftPagiEnd}
                    onChange={(e) => setShiftPagiEnd(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-amber-300 font-mono font-bold text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Shift 2: Siang */}
            <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2">
              <div className="flex items-center gap-1.5 font-extrabold text-orange-900 text-xs">
                <Sunset className="w-4 h-4 text-orange-600" />
                <span>2. Shift Siang</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Jam Masuk</span>
                  <input
                    type="time"
                    value={shiftSiangStart}
                    onChange={(e) => setShiftSiangStart(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-orange-300 font-mono font-bold text-xs text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Jam Selesai</span>
                  <input
                    type="time"
                    value={shiftSiangEnd}
                    onChange={(e) => setShiftSiangEnd(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-orange-300 font-mono font-bold text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Shift 3: Malam */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
              <div className="flex items-center gap-1.5 font-extrabold text-indigo-900 text-xs">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>3. Shift Malam</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Jam Masuk</span>
                  <input
                    type="time"
                    value={shiftMalamStart}
                    onChange={(e) => setShiftMalamStart(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-indigo-300 font-mono font-bold text-xs text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-600 block mb-0.5">Jam Selesai</span>
                  <input
                    type="time"
                    value={shiftMalamEnd}
                    onChange={(e) => setShiftMalamEnd(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-indigo-300 font-mono font-bold text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-blue-700">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Aturan Jam Lembur Kerja</span>
              </span>
              <p className="text-[11px] text-blue-800/90 leading-relaxed">
                Pengajuan jam lembur karyawan hanya dapat diproses dan dikirim jika jam mulai lembur diisi <strong>setelah jam shift selesai</strong>.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

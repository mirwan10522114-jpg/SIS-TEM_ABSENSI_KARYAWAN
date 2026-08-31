import React from 'react';
import { X, HelpCircle, Shield, MapPin, Camera, Phone, Mail, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Pusat Bantuan Absensi</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-slate-600 dark:text-slate-300">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Ketentuan Geofencing
              </h4>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Absensi diakui sebagai <strong className="text-emerald-600 dark:text-emerald-400">Hadir</strong> jika Anda berada di dalam radius kantor (default 100m). Jika Anda sedang WFH atau Dinas Luar, Anda wajib mengisi formulir alasan saat verifikasi kamera.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                Verifikasi Foto Selfie
              </h4>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Sistem mengharuskan foto wajah langsung dari kamera depan perangkat. Pastikan pencahayaan cukup dan wajah terlihat jelas tanpa masker.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Jadwal & Batas Keterlambatan
              </h4>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Jam kerja reguler: <strong>08:00 - 17:00 WIB</strong>. Clock in di atas pukul <strong>08:30 WIB</strong> akan otomatis tercatat sebagai <em>Terlambat</em>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <h5 className="font-semibold text-slate-800 dark:text-slate-200">Kontak Tim HR & IT Support</h5>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>+62 21-555-8900 (Ext. 402)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>hr.support@perusahaan.co.id</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              Mengerti & Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

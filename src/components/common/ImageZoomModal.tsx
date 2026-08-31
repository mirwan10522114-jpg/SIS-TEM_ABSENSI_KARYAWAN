import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, MapPin, Calendar, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ImageZoomModal: React.FC = () => {
  const { zoomedImage, setZoomedImage } = useApp();

  if (!zoomedImage) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-sm">{zoomedImage.title || 'Bukti Foto Selfie Absensi'}</h3>
            </div>
            <button
              onClick={() => setZoomedImage(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Photo Display */}
          <div className="relative bg-slate-950 flex items-center justify-center p-4 max-h-[60vh] overflow-hidden">
            <img
              src={zoomedImage.url}
              alt="Bukti Selfie"
              referrerPolicy="no-referrer"
              className="max-h-[50vh] w-auto max-w-full rounded-xl object-contain shadow-md border border-slate-800/80"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-slate-200 px-3 py-2 rounded-lg text-xs flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Terverifikasi AI & GPS
              </span>
              <span className="text-slate-400 font-mono text-[11px]">GEOTAG: ACTIVE</span>
            </div>
          </div>

          {/* Metadata details */}
          {zoomedImage.meta && (
            <div className="p-4 bg-slate-900 text-xs text-slate-300 border-t border-slate-800 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{zoomedImage.meta}</span>
            </div>
          )}

          {/* Footer Action */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setZoomedImage(null)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              Tutup Preview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

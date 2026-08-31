import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Camera, 
  X, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  FlipHorizontal,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { SAMPLE_SELFIES } from '../../mockData';

export const CameraModal: React.FC = () => {
  const {
    isCameraModalOpen,
    cameraMode,
    closeCameraModal,
    activeEmployee,
    geofenceConfig,
    currentCoords,
    isInsideOfficeGeofence,
    distanceToOfficeMeters,
    todayEmployeeAttendance,
    clockIn,
    clockOut,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [selectedPresetSelfie, setSelectedPresetSelfie] = useState<string>(activeEmployee.avatar || SAMPLE_SELFIES[0]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Reason inputs
  const [reasonInput, setReasonInput] = useState('');
  const [earlyReasonInput, setEarlyReasonInput] = useState('');
  const [showReasonTooltip, setShowReasonTooltip] = useState(false);

  // Process States
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [captureStatusText, setCaptureStatusText] = useState('Mendapatkan Lokasi...');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successTimestamp, setSuccessTimestamp] = useState('');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

  // Shift & Time Analysis
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Shift parsing e.g. "08:00 - 17:00 WIB"
  const shiftTimes = activeEmployee.shift.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
  const shiftStartHour = shiftTimes ? parseInt(shiftTimes[1], 10) : 8;
  const shiftStartMinute = shiftTimes ? parseInt(shiftTimes[2], 10) : 0;
  const shiftEndHour = shiftTimes ? parseInt(shiftTimes[3], 10) : 17;
  const shiftEndMinute = shiftTimes ? parseInt(shiftTimes[4], 10) : 0;

  const isLateClockIn = cameraMode === 'clockIn' && (currentHour > shiftStartHour || (currentHour === shiftStartHour && currentMinute > shiftStartMinute + 15));
  const isEarlyClockOut = cameraMode === 'clockOut' && (currentHour < shiftEndHour || (currentHour === shiftEndHour && currentMinute < shiftEndMinute));

  // Initialize webcam
  useEffect(() => {
    if (!isCameraModalOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsCameraActive(false);
      setIsSuccess(false);
      setIsCapturing(false);
      setReasonInput('');
      setEarlyReasonInput('');
      setShowReasonTooltip(false);
      setCapturedPhotoUrl(null);
      return;
    }

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      setCameraError(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 720 },
            height: { ideal: 960 },
          },
          audio: false,
        });

        activeStream = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err: any) {
        console.warn('Webcam fallback active:', err);
        setCameraError('Kamera tidak diizinkan / berjalan di lingkungan simulasi.');
        setIsCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraModalOpen, facingMode]);

  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleCapture = async () => {
    // Validation 1: Require reason if outside geofence
    if (!isInsideOfficeGeofence && !reasonInput.trim()) {
      setShowReasonTooltip(true);
      setTimeout(() => setShowReasonTooltip(false), 4000);
      return;
    }

    // Validation 2: Require reason if Late Clock In
    if (isLateClockIn && !reasonInput.trim()) {
      setShowReasonTooltip(true);
      setTimeout(() => setShowReasonTooltip(false), 4000);
      return;
    }

    // Validation 3: Require reason if Early Clock Out
    if (isEarlyClockOut && !earlyReasonInput.trim()) {
      setShowReasonTooltip(true);
      setTimeout(() => setShowReasonTooltip(false), 4000);
      return;
    }

    setIsCapturing(true);
    setUploadProgress(30);
    setCaptureStatusText('Mengunci Koordinat GPS & Mengambil Foto...');

    let photoData = selectedPresetSelfie;

    // Capture real frame from webcam video element
    if (isCameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, canvas.height - 50, canvas.width - 20, 40);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#ffffff';
        const dateNow = new Date().toLocaleString('id-ID');
        ctx.fillText(`${activeEmployee.name} • ${dateNow} • GPS: ${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}`, 20, canvas.height - 25);

        photoData = canvas.toDataURL('image/jpeg', 0.85);
      }
    }

    setCapturedPhotoUrl(photoData);

    setTimeout(() => {
      setUploadProgress(70);
      setCaptureStatusText('Mengunggah Foto Selfie Keperluan Audit Admin...');
    }, 500);

    setTimeout(async () => {
      setUploadProgress(100);
      setCaptureStatusText('Menyimpan Data Presensi...');

      const nowStr = new Date().toTimeString().split(' ')[0];
      setSuccessTimestamp(nowStr);

      if (cameraMode === 'clockIn') {
        await clockIn(photoData, reasonInput);
      } else {
        await clockOut(photoData, earlyReasonInput);
      }

      setIsCapturing(false);
      setIsSuccess(true);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#2563EB', '#16A34A', '#F59E0B'],
        });
      } catch (e) {
        // ignore
      }

      setTimeout(() => {
        if (isCameraModalOpen) {
          closeCameraModal();
        }
      }, 3500);
    }, 1200);
  };

  if (!isCameraModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md font-sans">
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full max-w-md h-full sm:h-[92vh] sm:max-h-[840px] bg-slate-950 sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-slate-800">
        
        {/* TOP OVERLAY: Deteksi Lokasi */}
        <div className="relative z-20 p-4 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white bg-blue-600/90 px-2.5 py-1 rounded-lg">
                {cameraMode === 'clockIn' ? 'Selfie Clock In' : 'Selfie Clock Out'}
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {activeEmployee.name.split(' ')[0]}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isCameraActive && (
                <button
                  onClick={toggleFacingMode}
                  className="p-2 rounded-full bg-slate-850/80 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  title="Balik Kamera"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeCameraModal}
                className="p-2 rounded-full bg-slate-850/80 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="Batalkan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Location Verification Status Pill */}
          <div className={`p-2.5 rounded-xl backdrop-blur-md border text-xs flex items-center justify-between ${
            isInsideOfficeGeofence
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/80 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isInsideOfficeGeofence ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
              <div className="truncate">
                <p className="font-bold truncate">
                  {isInsideOfficeGeofence
                    ? `Lokasi Terverifikasi (Radius ${geofenceConfig.radiusMeters}m)`
                    : 'Di Luar Radius Kantor (WFH / Remote)'}
                </p>
                <p className="text-[11px] opacity-80 truncate">
                  Jarak: <strong>{distanceToOfficeMeters}m</strong> • Shift: {activeEmployee.shift}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 shrink-0">
              {isInsideOfficeGeofence ? 'Kantor' : 'WFH'}
            </span>
          </div>
        </div>

        {/* MIDDLE: Camera Viewfinder */}
        <div className="relative flex-1 bg-slate-900 overflow-hidden flex items-center justify-center">
          {/* Live Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />

          {/* Fallback Viewfinder if video stream is inactive */}
          {!isCameraActive && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-center">
              <div className="relative mb-3">
                <img
                  src={selectedPresetSelfie}
                  alt="Selfie Preview"
                  className="w-44 h-44 rounded-full object-cover border-4 border-blue-500/60 shadow-2xl"
                />
                <div className="absolute bottom-1 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-1">
                Pengambilan Foto Selfie
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mb-3">
                Foto selfie akan disimpan sebagai bukti presensi dan diperiksa oleh Admin HR.
              </p>
            </div>
          )}

          {/* Oval Face Guide Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-68 border-2 border-dashed border-white/50 rounded-[100px] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] flex items-center justify-center">
              <span className="text-[11px] font-semibold text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                Posisikan Wajah Di Sini
              </span>
            </div>
          </div>

          {/* Live Progress Bar during capture */}
          {isCapturing && (
            <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center mb-4 text-blue-400 animate-spin">
                <RefreshCw className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold mb-1">{captureStatusText}</h3>
              <p className="text-xs text-slate-400 mb-4">Sistem sedang menyimpan bukti foto & posisi GPS...</p>
              <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM OVERLAY: Reason Fields & Shutter Button */}
        <div className="relative z-20 p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent space-y-3">
          
          {/* Reason Input Field for WFH or Late Clock In */}
          {(cameraMode === 'clockIn' && (!isInsideOfficeGeofence || isLateClockIn)) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isLateClockIn ? 'Alasan Keterlambatan Masuk (Wajib)' : 'Alasan WFH / Di Luar Area (Wajib)'}
                  </span>
                </label>
                <span className="text-[10px] text-amber-400 font-semibold">Perlu Approval Admin</span>
              </div>
              <input
                type="text"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder={isLateClockIn ? 'Contoh: Macet jalan utama / antrean MRT' : 'Contoh: WFH jadwal sprint remote / dinas luar'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/50 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
          )}

          {/* Reason Input Field for Early Clock Out */}
          {cameraMode === 'clockOut' && isEarlyClockOut && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Alasan Pulang Lebih Cepat (Wajib)</span>
                </label>
                <span className="text-[10px] text-rose-400 font-semibold">Perlu Approval Admin</span>
              </div>
              <input
                type="text"
                value={earlyReasonInput}
                onChange={(e) => setEarlyReasonInput(e.target.value)}
                placeholder="Contoh: Orang tua sakit keras / keperluan keluarga mendadak"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-rose-500/50 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
              />
            </div>
          )}

          {/* Tooltip Error if missing required reasons */}
          {showReasonTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-700 text-rose-200 text-xs text-center font-medium"
            >
              Mohon isi alasan terlebih dahulu sebelum mengambil foto presensi.
            </motion.div>
          )}

          {/* Shutter Button Action */}
          <div className="flex items-center justify-center gap-6 pt-1">
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className={`relative group w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center p-1.5 transition-transform active:scale-95 cursor-pointer ${
                (!isInsideOfficeGeofence && !reasonInput.trim()) || (isLateClockIn && !reasonInput.trim()) || (isEarlyClockOut && !earlyReasonInput.trim())
                  ? 'ring-4 ring-amber-500/40 bg-amber-600/30'
                  : 'ring-4 ring-blue-500/40 bg-blue-600/30'
              }`}
            >
              <div className={`w-full h-full rounded-full flex items-center justify-center transition-colors shadow-lg ${
                (!isInsideOfficeGeofence && !reasonInput.trim()) || (isLateClockIn && !reasonInput.trim()) || (isEarlyClockOut && !earlyReasonInput.trim())
                  ? 'bg-amber-500 text-white hover:bg-amber-400'
                  : 'bg-white text-slate-900 group-hover:bg-slate-100'
              }`}>
                <Camera className="w-6 h-6 text-slate-900" />
              </div>
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            Ambil foto selfie untuk bukti presensi ke Admin HR
          </p>
        </div>

        {/* SUCCESS BOTTOM SHEET POP-UP */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 z-40 bg-slate-900 border-t border-emerald-600/50 p-6 rounded-t-3xl text-white shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-extrabold text-emerald-300">
                Absensi Berhasil Tersimpan!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Foto selfie telah tersimpan dan siap diperiksa oleh Admin HR.
              </p>

              <div className="my-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-around text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Waktu</span>
                  <strong className="text-sm font-mono text-white">{successTimestamp} WIB</strong>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Verifikasi Foto</span>
                  <strong className="text-xs text-emerald-400 font-semibold">Tersimpan</strong>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Status Approval</span>
                  <strong className={`text-xs font-semibold ${
                    isLateClockIn || isEarlyClockOut || !isInsideOfficeGeofence
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {isLateClockIn || isEarlyClockOut || !isInsideOfficeGeofence
                      ? 'Menunggu Admin'
                      : 'Terverifikasi'}
                  </strong>
                </div>
              </div>

              <button
                onClick={closeCameraModal}
                className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-colors shadow-lg cursor-pointer"
              >
                Selesai (Tutup)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Lock
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await login(identifier, pin);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Header Branding */}
        <div className="p-6 sm:p-8 text-center border-b border-slate-800/80 bg-slate-900/40">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sistem Absensi Karyawan</h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Portal Masuk Karyawan & Admin</span>
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-2xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Gagal Masuk</p>
              <p className="text-red-200/90 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* UNIFIED LOGIN FORM */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Step 1: Input NIP / Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              NIP / Email Karyawan / Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <UserCheck className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan NIP atau Email"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Step 2: Input 6-Digit PIN */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              PIN Keamanan (6 Digit)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                required
                maxLength={10}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan 6 digit PIN"
                className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl text-sm font-mono tracking-wider text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Masuk Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} Sistem Absensi Karyawan • Secure Portal
        </div>
      </div>
    </div>
  );
};

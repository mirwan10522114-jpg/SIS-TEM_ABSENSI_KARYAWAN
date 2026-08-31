import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  X,
  Edit2,
  Filter,
  KeyRound,
  ShieldCheck,
  RotateCcw,
  Sun,
  Sunset,
  Moon,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminEmployeesView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, resetMonthlyLeaveQuota, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State for Add/Edit
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('123456');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering & IT');
  
  // Shift Controls (Pagi | Siang | Malam | Custom)
  const [shiftPreset, setShiftPreset] = useState<string>('pagi');
  const [customStart, setCustomStart] = useState('08:30');
  const [customEnd, setCustomEnd] = useState('17:30');

  const [remainingLeave, setRemainingLeave] = useState(12);
  const [usedLeave, setUsedLeave] = useState(0);
  const [status, setStatus] = useState<'active' | 'on_leave' | 'inactive'>('active');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');

  const departments = ['ALL', ...Array.from(new Set(employees.map(e => e.department)))];

  const getShiftString = () => {
    if (shiftPreset === 'pagi') return 'Shift Pagi (08:00 - 17:00 WIB)';
    if (shiftPreset === 'siang') return 'Shift Siang (13:00 - 21:00 WIB)';
    if (shiftPreset === 'malam') return 'Shift Malam (21:00 - 05:00 WIB)';
    return `Custom Shift (${customStart} - ${customEnd} WIB)`;
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleOpenAddModal = () => {
    setName('');
    setNip(`EMP-2024-00${employees.length + 1}`);
    setEmail('');
    setPin('123456');
    setPhone('');
    setRole('');
    setDepartment('Engineering & IT');
    setShiftPreset('pagi');
    setCustomStart('08:30');
    setCustomEnd('17:30');
    setRemainingLeave(12);
    setUsedLeave(0);
    setStatus('active');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setNip(emp.nip);
    setEmail(emp.email);
    setPin(emp.pin || '123456');
    setPhone(emp.phone);
    setRole(emp.role);
    setDepartment(emp.department);
    
    // Parse shift string
    if (emp.shift.includes('Pagi')) setShiftPreset('pagi');
    else if (emp.shift.includes('Siang')) setShiftPreset('siang');
    else if (emp.shift.includes('Malam')) setShiftPreset('malam');
    else {
      setShiftPreset('custom');
      const match = emp.shift.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      if (match) {
        setCustomStart(match[1]);
        setCustomEnd(match[2]);
      }
    }

    setRemainingLeave(emp.remainingLeave);
    setUsedLeave(emp.usedLeave);
    setStatus(emp.status);
    setAvatar(emp.avatar);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nip || !email) {
      addToast({
        type: 'warning',
        title: 'Mohon Lengkapi Data',
        message: 'Nama, NIP, dan Email wajib diisi.',
      });
      return;
    }

    addEmployee({
      name,
      nip,
      email,
      pin,
      phone: phone || '+62 812-0000-0000',
      role: role || 'Staff Karyawan',
      department,
      shift: getShiftString(),
      avatar,
      joinDate: '30 Agustus 2026',
      remainingLeave,
      usedLeave,
      status,
    });

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    await updateEmployee({
      ...editingEmployee,
      name,
      nip,
      email,
      pin,
      phone,
      role,
      department,
      shift: getShiftString(),
      remainingLeave,
      usedLeave,
      status,
      avatar,
    });

    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Data Master & Edit Karyawan</h1>
          <p className="text-xs text-slate-500">
            Kelola detail NIP, PIN 6-digit, shift kerja (Pagi/Siang/Malam/Custom), dan sisa kuota cuti.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => resetMonthlyLeaveQuota()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs transition-all cursor-pointer"
            title="Reset jatah cuti bulanan setiap tanggal 1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>Reset Cuti Tgl 1</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Karyawan Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 flex items-center gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari karyawan berdasarkan nama, NIP, PIN, atau jabatan..."
            className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {departments.map((dept, i) => (
              <option key={i} value={dept}>
                {dept === 'ALL' ? 'Semua Departemen' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{emp.name}</h3>
                    <p className="text-xs text-blue-600 font-medium">{emp.role}</p>
                    <span className="inline-block text-[10px] font-mono text-slate-400 mt-0.5">
                      {emp.nip}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEditModal(emp)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Edit Data Karyawan"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Detailed Fields */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.department}</span>
                  </div>
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-slate-500" />
                    <span>PIN: {emp.pin || '123456'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{emp.shift}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{emp.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Sisa Cuti: <strong className="text-blue-600 font-mono">{emp.remainingLeave} Hari</strong>
              </span>
              <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                emp.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {emp.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Employee Modal */}
      <AnimatePresence>
        {(isAddModalOpen || editingEmployee) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-blue-600">
                  {editingEmployee ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingEmployee ? `Edit Data Karyawan (${editingEmployee.name})` : 'Tambah Karyawan Baru'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingEmployee(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingEmployee ? handleEditSubmit : handleAddSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rian Hidayat, S.T."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIP (Nomor Induk) *</label>
                    <input
                      type="text"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      placeholder="EMP-2024-006"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">PIN 6-Digit Login *</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jabatan / Role *</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Mobile Developer"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Departemen *</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Engineering & IT">Engineering & IT</option>
                      <option value="Product Management">Product Management</option>
                      <option value="Product & Design">Product & Design</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance & Accounting">Finance & Accounting</option>
                      <option value="Marketing & Sales">Marketing & Sales</option>
                    </select>
                  </div>
                </div>

                {/* SHIFT SELECTION: Preset Pagi/Siang/Malam or Custom Time */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-700">Pengaturan Jadwal Shift Kerja *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setShiftPreset('pagi')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        shiftPreset === 'pagi'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/40'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Shift Pagi</span>
                      <span className="text-[9px] font-normal text-slate-500">08:00 - 17:00</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShiftPreset('siang')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        shiftPreset === 'siang'
                          ? 'bg-orange-50 border-orange-400 text-orange-900 ring-2 ring-orange-400/40'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Sunset className="w-4 h-4 text-orange-500" />
                      <span>Shift Siang</span>
                      <span className="text-[9px] font-normal text-slate-500">13:00 - 21:00</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShiftPreset('malam')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        shiftPreset === 'malam'
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-2 ring-indigo-400/40'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span>Shift Malam</span>
                      <span className="text-[9px] font-normal text-slate-500">21:00 - 05:00</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShiftPreset('custom')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        shiftPreset === 'custom'
                          ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/40'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <span>Custom Shift</span>
                      <span className="text-[9px] font-normal text-slate-500">Manual Time</span>
                    </button>
                  </div>

                  {/* Custom Time Inputs */}
                  {shiftPreset === 'custom' && (
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Jam Masuk (Shift)</label>
                        <input
                          type="time"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Jam Keluar (Shift)</label>
                        <input
                          type="time"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Perusahaan *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama.karyawan@perusahaan.co.id"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Telepon</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812-3456-7890"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingEmployee(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 cursor-pointer"
                  >
                    {editingEmployee ? 'Simpan Perubahan' : 'Simpan Karyawan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

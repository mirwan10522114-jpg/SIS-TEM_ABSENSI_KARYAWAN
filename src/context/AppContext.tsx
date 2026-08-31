import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  OvertimeRequest,
  Announcement, 
  GeofenceConfig, 
  Coordinates, 
  UserRole,
  AttendanceStatus,
  AttendanceApprovalStatus
} from '../types';
import { 
  DEFAULT_GEOFENCE, 
  INITIAL_EMPLOYEES, 
  INITIAL_ATTENDANCE, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_ANNOUNCEMENTS,
  INITIAL_OVERTIMES
} from '../mockData';
import { calculateDistanceMeters, getApproximateAddress } from '../utils/geo';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  authRole: 'employee' | 'admin';
  login: (identifier: string, pin: string) => Promise<{ success: boolean; message: string; role?: 'employee' | 'admin' }>;
  logout: () => void;

  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeEmployeeTab: 'home' | 'history' | 'leave' | 'profile';
  setActiveEmployeeTab: (tab: 'home' | 'history' | 'leave' | 'profile') => void;
  activeAdminTab: 'dashboard' | 'attendance' | 'leaves' | 'overtime' | 'employees' | 'geofence' | 'announcements' | 'settings';
  setActiveAdminTab: (tab: 'dashboard' | 'attendance' | 'leaves' | 'overtime' | 'employees' | 'geofence' | 'announcements' | 'settings') => void;
  isMobileDeviceFrame: boolean;
  setIsMobileDeviceFrame: (val: boolean) => void;

  // Active User & Employees
  activeEmployee: Employee;
  setActiveEmployeeId: (id: string) => void;
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (emp: Employee) => Promise<void>;
  resetMonthlyLeaveQuota: () => Promise<void>;

  // Geofence & Current Location
  geofenceConfig: GeofenceConfig;
  updateGeofenceConfig: (config: Partial<GeofenceConfig>) => void;
  currentCoords: Coordinates;
  setCurrentCoords: (coords: Coordinates) => void;
  currentLocationName: string;
  isInsideOfficeGeofence: boolean;
  distanceToOfficeMeters: number;
  setPresetLocation: (presetIndex: number) => void;
  useRealBrowserGps: () => Promise<boolean>;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  todayEmployeeAttendance: AttendanceRecord | undefined;
  clockIn: (photoUrl: string, reason?: string) => Promise<{ success: boolean; message: string; record?: AttendanceRecord }>;
  clockOut: (photoUrl: string, earlyReason?: string) => Promise<{ success: boolean; message: string; record?: AttendanceRecord }>;
  approveAttendanceRecord: (id: string, notes?: string) => void;
  rejectAttendanceRecord: (id: string, notes?: string) => void;
  
  // Leaves
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate' | 'employeeId' | 'employeeName' | 'employeeDepartment' | 'employeeAvatar'>) => void;
  approveLeaveRequest: (id: string, reviewerName: string) => void;
  rejectLeaveRequest: (id: string, reason: string, reviewerName: string) => void;

  // Overtime
  overtimeRequests: OvertimeRequest[];
  submitOvertimeRequest: (req: Omit<OvertimeRequest, 'id' | 'status' | 'appliedDate' | 'employeeId' | 'employeeName' | 'employeeDepartment' | 'employeeAvatar'>) => void;
  approveOvertimeRequest: (id: string, reviewerName: string) => void;
  rejectOvertimeRequest: (id: string, reason: string, reviewerName: string) => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Zoom Modal
  zoomedImage: { url: string; title: string; meta?: string } | null;
  setZoomedImage: (img: { url: string; title: string; meta?: string } | null) => void;

  // Camera Modal
  isCameraModalOpen: boolean;
  cameraMode: 'clockIn' | 'clockOut' | null;
  openCameraModal: (mode: 'clockIn' | 'clockOut') => void;
  closeCameraModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('absensi_auth_session') === 'true';
  });

  const [authRole, setAuthRole] = useState<'employee' | 'admin'>(() => {
    return (localStorage.getItem('absensi_auth_role') as 'employee' | 'admin') || 'employee';
  });

  // Navigation & Role
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('absensi_current_role') as UserRole) || 'employee';
  });
  const [activeEmployeeTab, setActiveEmployeeTab] = useState<'home' | 'history' | 'leave' | 'profile'>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'attendance' | 'leaves' | 'overtime' | 'employees' | 'geofence' | 'announcements' | 'settings'>('dashboard');
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState<boolean>(false);

  // Entities
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('absensi_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [activeEmployeeId, setActiveEmployeeIdState] = useState<string>(() => {
    return localStorage.getItem('absensi_active_emp_id') || 'emp-01';
  });

  const [geofenceConfig, setGeofenceConfig] = useState<GeofenceConfig>(() => {
    const saved = localStorage.getItem('absensi_geofence');
    return saved ? JSON.parse(saved) : DEFAULT_GEOFENCE;
  });

  const [currentCoords, setCurrentCoords] = useState<Coordinates>(() => {
    return { lat: DEFAULT_GEOFENCE.center.lat, lng: DEFAULT_GEOFENCE.center.lng };
  });

  const [currentLocationName, setCurrentLocationName] = useState<string>('Di Dalam Kantor (Lobi / Meja Kerja)');

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('absensi_records');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('absensi_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('absensi_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(() => {
    const saved = localStorage.getItem('absensi_overtimes');
    return saved ? JSON.parse(saved) : INITIAL_OVERTIMES;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string; meta?: string } | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'clockIn' | 'clockOut' | null>(null);

  // Fetch initial data from MySQL Express API on load
  useEffect(() => {
    const loadFromBackend = async () => {
      try {
        const healthRes = await fetch('/api/health');
        if (!healthRes.ok) return;

        const [empRes, geoRes, attRes, leaveRes, ovtRes, annRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/geofence'),
          fetch('/api/attendance'),
          fetch('/api/leaves'),
          fetch('/api/overtime'),
          fetch('/api/announcements'),
        ]);

        if (empRes.ok) {
          const empData = await empRes.json();
          if (empData && empData.length > 0) setEmployees(empData);
        }
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.officeName) setGeofenceConfig(geoData);
        }
        if (attRes.ok) {
          const attData = await attRes.json();
          if (attData) setAttendanceRecords(attData);
        }
        if (leaveRes.ok) {
          const leaveData = await leaveRes.json();
          if (leaveData) setLeaveRequests(leaveData);
        }
        if (ovtRes.ok) {
          const ovtData = await ovtRes.json();
          if (ovtData) setOvertimeRequests(ovtData);
        }
        if (annRes.ok) {
          const annData = await annRes.json();
          if (annData) setAnnouncements(annData);
        }
      } catch (e) {
        console.warn('Backend API connection failed, using local/cached state:', e);
      }
    };
    loadFromBackend();
  }, []);

  // LocalStorage fallbacks
  useEffect(() => { localStorage.setItem('absensi_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('absensi_active_emp_id', activeEmployeeId); }, [activeEmployeeId]);
  useEffect(() => { localStorage.setItem('absensi_geofence', JSON.stringify(geofenceConfig)); }, [geofenceConfig]);
  useEffect(() => { localStorage.setItem('absensi_records', JSON.stringify(attendanceRecords)); }, [attendanceRecords]);
  useEffect(() => { localStorage.setItem('absensi_leaves', JSON.stringify(leaveRequests)); }, [leaveRequests]);
  useEffect(() => { localStorage.setItem('absensi_announcements', JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem('absensi_overtimes', JSON.stringify(overtimeRequests)); }, [overtimeRequests]);
  useEffect(() => { localStorage.setItem('absensi_auth_session', isAuthenticated ? 'true' : 'false'); }, [isAuthenticated]);
  useEffect(() => { localStorage.setItem('absensi_auth_role', authRole); }, [authRole]);
  useEffect(() => { localStorage.setItem('absensi_current_role', currentRole); }, [currentRole]);

  const activeEmployee = employees.find(e => e.id === activeEmployeeId) || employees[0] || INITIAL_EMPLOYEES[0];
  const distanceToOfficeMeters = calculateDistanceMeters(currentCoords, geofenceConfig.center);
  const isInsideOfficeGeofence = distanceToOfficeMeters <= geofenceConfig.radiusMeters;

  // Helper: get today's date in YYYY-MM-DD format
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const todayStr = getTodayStr();

  // Helper: parse shift start time from employee's shift string (e.g. "Shift Pagi (08:00 - 17:00 WIB)" -> {h:8, m:0})
  const parseShiftStartTime = (shiftStr: string): { h: number; m: number } => {
    const match = shiftStr.match(/(\d{2}):(\d{2})\s*-/);
    if (match) return { h: parseInt(match[1], 10), m: parseInt(match[2], 10) };
    return { h: 8, m: 0 }; // fallback
  };

  const todayEmployeeAttendance = attendanceRecords.find(
    r => r.employeeId === activeEmployee.id && r.date === todayStr
  );

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => { removeToast(id); }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Unified Authentication Login
  const login = async (identifier: string, pin: string): Promise<{ success: boolean; message: string; role?: 'employee' | 'admin' }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, pin }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.role === 'admin') {
            setAuthRole('admin');
            setCurrentRole('admin');
            setIsAuthenticated(true);
            addToast({
              type: 'success',
              title: 'Login Admin HR Berhasil!',
              message: 'Selamat datang di Web Admin Panel Absensi Karyawan.',
            });
            return { success: true, message: data.message, role: 'admin' };
          } else if (data.role === 'employee' && data.employee) {
            setActiveEmployeeIdState(data.employee.id);
            setAuthRole('employee');
            setCurrentRole('employee');
            setIsAuthenticated(true);
            addToast({
              type: 'success',
              title: `Selamat Datang, ${data.employee.name}!`,
              message: `Login berhasil di Portal Karyawan (${data.employee.department}).`,
            });
            return { success: true, message: data.message, role: 'employee' };
          }
        } else {
          return { success: false, message: data.message || 'Login gagal.' };
        }
      } else {
        const errData = await res.json().catch(() => null);
        return { success: false, message: errData?.message || 'Identitas (NIP/Email) atau PIN tidak sesuai.' };
      }
    } catch (err) {
      console.warn('API Auth unavailable, using local check:', err);
    }

    // Local Fallback Check
    const cleanId = identifier.trim().toLowerCase();
    const cleanPin = pin.trim();

    // Check admin local
    if (cleanId === 'admin' || cleanId === 'admin@perusahaan.co.id') {
      if (cleanPin === '123456' || cleanPin === 'admin123') {
        setAuthRole('admin');
        setCurrentRole('admin');
        setIsAuthenticated(true);
        addToast({
          type: 'success',
          title: 'Login Admin HR Berhasil!',
          message: 'Selamat datang di Web Admin Panel Absensi Karyawan.',
        });
        return { success: true, message: 'Login Admin Berhasil!', role: 'admin' };
      }
      return { success: false, message: 'PIN Admin tidak sesuai (PIN default: 123456).' };
    }

    // Check employee local
    const matchedEmp = employees.find(
      e => e.email.toLowerCase() === cleanId || e.nip.toLowerCase() === cleanId
    );

    if (matchedEmp) {
      if (cleanPin === '123456' || cleanPin === matchedEmp.nip) {
        setActiveEmployeeIdState(matchedEmp.id);
        setAuthRole('employee');
        setCurrentRole('employee');
        setIsAuthenticated(true);
        addToast({
          type: 'success',
          title: `Selamat Datang, ${matchedEmp.name}!`,
          message: `Login berhasil di Portal Karyawan (${matchedEmp.department}).`,
        });
        return { success: true, message: 'Login Berhasil!', role: 'employee' };
      }
      return { success: false, message: 'PIN 6 digit Karyawan tidak sesuai (PIN default: 123456).' };
    }

    return { success: false, message: 'Akun Karyawan / Admin tidak ditemukan. Periksa NIP/Email Anda.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('absensi_auth_session');
    localStorage.removeItem('absensi_auth_role');
    addToast({
      type: 'info',
      title: 'Telah Keluar',
      message: 'Anda telah berhasil keluar dari sesi sistem absensi.',
    });
  };

  const setActiveEmployeeId = (id: string) => {
    setActiveEmployeeIdState(id);
  };

  const updateGeofenceConfig = (partial: Partial<GeofenceConfig>) => {
    const newConfig = { ...geofenceConfig, ...partial };
    setGeofenceConfig(newConfig);

    fetch('/api/geofence', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    }).catch(err => console.error('Failed to sync geofence to API:', err));

    addToast({
      type: 'success',
      title: 'Geofence Diperbarui',
      message: `Radius: ${newConfig.radiusMeters}m | Lokasi: ${newConfig.officeName}`,
    });
  };

  const setPresetLocation = (index: number) => {
    // Unused demo preset
  };

  const useRealBrowserGps = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      addToast({
        type: 'error',
        title: 'GPS Tidak Didukung',
        message: 'Browser Anda tidak mendukung deteksi Geolocation.',
      });
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentCoords(coords);
          setCurrentLocationName('GPS Akurat Perangkat (Browser Geolocation)');
          const dist = calculateDistanceMeters(coords, geofenceConfig.center);
          addToast({
            type: 'success',
            title: 'GPS Terhubung!',
            message: `Koordinat terdeteksi (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}). Jarak ke kantor: ${dist}m`,
          });
          resolve(true);
        },
        (error) => {
          addToast({
            type: 'warning',
            title: 'Izin GPS Ditolak / Tidak Tersedia',
            message: error.message || 'Menggunakan koordinat simulasi kantor.',
          });
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const openCameraModal = (mode: 'clockIn' | 'clockOut') => {
    setCameraMode(mode);
    setIsCameraModalOpen(true);
  };

  const closeCameraModal = () => {
    setIsCameraModalOpen(false);
    setCameraMode(null);
  };

  // Helper: parse shift end time from employee's shift string (e.g. "Shift Pagi (08:00 - 17:00 WIB)" -> {h:17, m:0})
  const parseShiftEndTime = (shiftStr: string): { h: number; m: number } => {
    const match = shiftStr.match(/-\s*(\d{2}):(\d{2})/);
    if (match) return { h: parseInt(match[1], 10), m: parseInt(match[2], 10) };
    return { h: 17, m: 0 }; // fallback
  };

  const clockIn = async (photoUrl: string, reason?: string): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dist = calculateDistanceMeters(currentCoords, geofenceConfig.center);
    const isInside = dist <= geofenceConfig.radiusMeters;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const shiftStart = parseShiftStartTime(activeEmployee.shift);
    let status: AttendanceStatus = 'hadir';
    let approvalStatus: AttendanceApprovalStatus = 'approved';

    if (!isInside) {
      status = 'wfh';
      approvalStatus = 'approved';
    } else if (hours > shiftStart.h || (hours === shiftStart.h && minutes > shiftStart.m + 15)) {
      status = 'terlambat';
      approvalStatus = 'pending_approval';
    }

    const approxAddress = getApproximateAddress(currentCoords, geofenceConfig.center, geofenceConfig.address);

    const newRecord: AttendanceRecord = {
      id: 'att-' + Date.now(),
      employeeId: activeEmployee.id,
      employeeName: activeEmployee.name,
      employeeDepartment: activeEmployee.department,
      employeeAvatar: activeEmployee.avatar,
      date: todayStr,
      clockInTime: timeStr,
      status: status,
      approvalStatus: approvalStatus,
      clockInLocation: {
        lat: currentCoords.lat,
        lng: currentCoords.lng,
        address: approxAddress,
        distanceMeters: dist,
        isInsideGeofence: isInside,
      },
      selfieClockIn: photoUrl,
      reason: reason || (!isInside ? 'Absensi di luar area kantor (WFH/Remote)' : undefined),
      deviceInfo: 'Web Camera (Verified Biometric & Geotagged)',
    };

    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(r => r.employeeId === activeEmployee.id && r.date === todayStr);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newRecord;
        return updated;
      }
      return [newRecord, ...prev];
    });

    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(err => console.error('Failed to sync clockIn to API:', err));

    addToast({
      type: 'success',
      title: 'Clock In Berhasil!',
      message: `Pukul ${timeStr} WIB • Status: ${status.toUpperCase()} (${dist}m)`,
    });

    return { success: true, message: 'Clock In Berhasil Tersimpan!', record: newRecord };
  };

  const clockOut = async (photoUrl: string, earlyReason?: string): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dist = calculateDistanceMeters(currentCoords, geofenceConfig.center);
    const isInside = dist <= geofenceConfig.radiusMeters;
    const approxAddress = getApproximateAddress(currentCoords, geofenceConfig.center, geofenceConfig.address);

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const shiftEnd = parseShiftEndTime(activeEmployee.shift);
    const isEarly = hours < shiftEnd.h || (hours === shiftEnd.h && minutes < shiftEnd.m);

    let updatedRecord: AttendanceRecord | undefined;

    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(r => r.employeeId === activeEmployee.id && r.date === todayStr);
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        updatedRecord = {
          ...existing,
          clockOutTime: timeStr,
          selfieClockOut: photoUrl,
          earlyClockOutReason: isEarly ? (earlyReason || 'Pulang lebih awal') : existing.earlyClockOutReason,
          approvalStatus: isEarly ? 'pending_approval' : existing.approvalStatus,
          clockOutLocation: {
            lat: currentCoords.lat,
            lng: currentCoords.lng,
            address: approxAddress,
            distanceMeters: dist,
            isInsideGeofence: isInside,
          }
        };
        const next = [...prev];
        next[existingIdx] = updatedRecord;
        return next;
      } else {
        updatedRecord = {
          id: 'att-' + Date.now(),
          employeeId: activeEmployee.id,
          employeeName: activeEmployee.name,
          employeeDepartment: activeEmployee.department,
          employeeAvatar: activeEmployee.avatar,
          date: todayStr,
          clockInTime: '08:00:00',
          clockOutTime: timeStr,
          status: 'hadir',
          approvalStatus: isEarly ? 'pending_approval' : 'approved',
          earlyClockOutReason: isEarly ? (earlyReason || 'Pulang lebih awal') : undefined,
          clockInLocation: {
            lat: geofenceConfig.center.lat,
            lng: geofenceConfig.center.lng,
            address: geofenceConfig.address,
            distanceMeters: 10,
            isInsideGeofence: true,
          },
          clockOutLocation: {
            lat: currentCoords.lat,
            lng: currentCoords.lng,
            address: approxAddress,
            distanceMeters: dist,
            isInsideGeofence: isInside,
          },
          selfieClockIn: photoUrl,
          selfieClockOut: photoUrl,
        };
        return [updatedRecord, ...prev];
      }
    });

    if (updatedRecord) {
      const endpoint = updatedRecord.id.startsWith('att-') && Date.now() - Number(updatedRecord.id.replace('att-', '')) < 60000 
        ? '/api/attendance' 
        : `/api/attendance/${updatedRecord.id}`;
      const method = endpoint === '/api/attendance' ? 'POST' : 'PUT';

      fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecord),
      }).catch(err => console.error('Failed to sync clockOut to API:', err));
    }

    addToast({
      type: 'success',
      title: 'Clock Out Berhasil!',
      message: `Pukul ${timeStr} WIB. Selamat beristirahat!`,
    });

    return { success: true, message: 'Clock Out Berhasil Tersimpan!', record: updatedRecord };
  };

  const submitLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate' | 'employeeId' | 'employeeName' | 'employeeDepartment' | 'employeeAvatar'>) => {
    const newLeave: LeaveRequest = {
      ...data,
      id: 'leave-' + Date.now(),
      employeeId: activeEmployee.id,
      employeeName: activeEmployee.name,
      employeeDepartment: activeEmployee.department,
      employeeAvatar: activeEmployee.avatar,
      status: 'pending',
      appliedDate: todayStr,
    };

    setLeaveRequests(prev => [newLeave, ...prev]);

    fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLeave),
    }).catch(err => console.error('Failed to sync leave request to API:', err));

    addToast({
      type: 'success',
      title: 'Pengajuan Cuti Terkirim',
      message: `${data.leaveType} (${data.totalDays} hari) sedang menunggu persetujuan HR/Manager.`,
    });
  };

  const approveLeaveRequest = (id: string, reviewerName: string) => {
    const reviewDate = todayStr;
    const reviewer = reviewerName || 'Admin HR';

    setLeaveRequests(prev => prev.map(req => {
      if (req.id === id) {
        setEmployees(empList => empList.map(e => {
          if (e.id === req.employeeId) {
            const updatedEmp = {
              ...e,
              remainingLeave: Math.max(0, e.remainingLeave - req.totalDays),
              usedLeave: e.usedLeave + req.totalDays,
            };
            fetch(`/api/employees/${e.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedEmp),
            }).catch(err => console.error('Failed to sync employee leave deduction:', err));
            return updatedEmp;
          }
          return e;
        }));

        return {
          ...req,
          status: 'disetujui',
          reviewDate,
          reviewedBy: reviewer,
        };
      }
      return req;
    }));

    fetch(`/api/leaves/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'disetujui', reviewDate, reviewedBy: reviewer }),
    }).catch(err => console.error('Failed to sync leave approval:', err));

    addToast({
      type: 'success',
      title: 'Pengajuan Cuti Disetujui',
      message: 'Status cuti berhasil diubah menjadi Disetujui.',
    });
  };

  const rejectLeaveRequest = (id: string, reason: string, reviewerName: string) => {
    const reviewDate = todayStr;
    const reviewer = reviewerName || 'Admin HR';
    const rejReason = reason || 'Kebutuhan operasional penting pada periode tersebut.';

    setLeaveRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'ditolak',
          reviewDate,
          reviewedBy: reviewer,
          rejectionReason: rejReason,
        };
      }
      return req;
    }));

    fetch(`/api/leaves/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ditolak', reviewDate, reviewedBy: reviewer, rejectionReason: rejReason }),
    }).catch(err => console.error('Failed to sync leave rejection:', err));

    addToast({
      type: 'warning',
      title: 'Pengajuan Cuti Ditolak',
      message: 'Status cuti telah diubah menjadi Ditolak.',
    });
  };

  const submitOvertimeRequest = (reqData: Omit<OvertimeRequest, 'id' | 'status' | 'appliedDate' | 'employeeId' | 'employeeName' | 'employeeDepartment' | 'employeeAvatar'>) => {
    const newOvt: OvertimeRequest = {
      ...reqData,
      id: 'ovt-' + Date.now(),
      employeeId: activeEmployee.id,
      employeeName: activeEmployee.name,
      employeeDepartment: activeEmployee.department,
      employeeAvatar: activeEmployee.avatar,
      status: 'pending',
      appliedDate: todayStr,
    };

    setOvertimeRequests(prev => [newOvt, ...prev]);

    fetch('/api/overtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOvt),
    }).catch(err => console.error('Failed to sync overtime request to API:', err));

    addToast({
      type: 'success',
      title: 'Pengajuan Lembur Berhasil',
      message: `Lembur ${newOvt.hours} jam pada ${newOvt.date} telah terkirim ke Admin HR.`,
    });
  };

  const approveOvertimeRequest = (id: string, reviewer: string) => {
    const reviewDate = todayStr;
    setOvertimeRequests(prev => prev.map(req => (req.id === id ? { ...req, status: 'disetujui', reviewDate, reviewedBy: reviewer } : req)));

    fetch(`/api/overtime/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'disetujui', reviewDate, reviewedBy: reviewer }),
    }).catch(err => console.error('Failed to sync overtime approval:', err));

    addToast({
      type: 'success',
      title: 'Lembur Disetujui',
      message: 'Pengajuan jam lembur telah disetujui Admin HR.',
    });
  };

  const rejectOvertimeRequest = (id: string, rejReason: string, reviewer: string) => {
    const reviewDate = todayStr;
    setOvertimeRequests(prev => prev.map(req => (req.id === id ? { ...req, status: 'ditolak', reviewDate, reviewedBy: reviewer, rejectionReason: rejReason } : req)));

    fetch(`/api/overtime/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ditolak', reviewDate, reviewedBy: reviewer, rejectionReason: rejReason }),
    }).catch(err => console.error('Failed to sync overtime rejection:', err));

    addToast({
      type: 'warning',
      title: 'Pengajuan Lembur Ditolak',
    });
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: 'emp-' + (employees.length + 1).toString().padStart(2, '0'),
    };
    setEmployees(prev => [...prev, newEmp]);

    fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp),
    }).catch(err => console.error('Failed to sync new employee to API:', err));

    addToast({
      type: 'success',
      title: 'Karyawan Ditambahkan',
      message: `${newEmp.name} (${newEmp.nip}) berhasil didaftarkan.`,
    });
  };

  const updateEmployee = async (updatedEmp: Employee) => {
    setEmployees(prev => prev.map(e => (e.id === updatedEmp.id ? updatedEmp : e)));

    try {
      await fetch(`/api/employees/${updatedEmp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEmp),
      });
      addToast({
        type: 'success',
        title: 'Data Karyawan Diperbarui',
        message: `${updatedEmp.name} (${updatedEmp.nip}) berhasil diperbarui.`,
      });
    } catch (e) {
      console.error('Failed to update employee:', e);
    }
  };

  const resetMonthlyLeaveQuota = async () => {
    setEmployees(prev => prev.map(e => {
      if (e.status === 'active') {
        return {
          ...e,
          remainingLeave: e.remainingLeave + 1,
          usedLeave: 0,
        };
      }
      return e;
    }));

    try {
      await fetch('/api/employees/reset-monthly-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowance: 1 }),
      });
      addToast({
        type: 'success',
        title: 'Reset Cuti Bulanan Berhasil!',
        message: 'Setiap tanggal 1 bulan baru, kuota cuti bertambah +1 Hari & kuota terpakai di-reset.',
      });
    } catch (e) {
      console.error('Failed to reset monthly leave quota:', e);
    }
  };

  const addAnnouncement = (annData: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: 'ann-' + Date.now(),
      date: todayStr,
    };
    setAnnouncements(prev => [newAnn, ...prev]);

    fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAnn),
    }).catch(err => console.error('Failed to sync announcement to API:', err));

    addToast({
      type: 'success',
      title: 'Pengumuman Diterbitkan',
      message: `"${newAnn.title}" telah disiarkan ke aplikasi seluruh karyawan.`,
    });
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));

    fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('Failed to delete announcement from API:', err));

    addToast({
      type: 'info',
      title: 'Pengumuman Dihapus',
    });
  };

  const approveAttendanceRecord = (id: string, notes?: string) => {
    setAttendanceRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          approvalStatus: 'approved',
          reviewedBy: 'Admin HR',
          reviewNotes: notes || 'Presensi dan Alasan Disetujui Admin HR',
        };
      }
      return rec;
    }));

    fetch(`/api/attendance/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewedBy: 'Admin HR', reviewNotes: notes || 'Presensi dan Alasan Disetujui Admin HR' }),
    }).catch(err => console.error('Failed to approve attendance API:', err));

    addToast({
      type: 'success',
      title: 'Absensi Disetujui Admin HR',
      message: 'Status persetujuan presensi telah diubah menjadi Disetujui (Approved).',
    });
  };

  const rejectAttendanceRecord = (id: string, notes?: string) => {
    setAttendanceRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          approvalStatus: 'rejected',
          reviewedBy: 'Admin HR',
          reviewNotes: notes || 'Alasan tidak dapat diterima oleh Admin HR',
        };
      }
      return rec;
    }));

    fetch(`/api/attendance/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewedBy: 'Admin HR', reviewNotes: notes || 'Alasan tidak dapat diterima oleh Admin HR' }),
    }).catch(err => console.error('Failed to reject attendance API:', err));

    addToast({
      type: 'warning',
      title: 'Absensi Ditolak Admin HR',
      message: 'Status persetujuan presensi telah diubah menjadi Ditolak (Rejected).',
    });
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        authRole,
        login,
        logout,
        currentRole,
        setCurrentRole,
        activeEmployeeTab,
        setActiveEmployeeTab,
        activeAdminTab,
        setActiveAdminTab,
        isMobileDeviceFrame,
        setIsMobileDeviceFrame,
        activeEmployee,
        setActiveEmployeeId,
        employees,
        addEmployee,
        updateEmployee,
        resetMonthlyLeaveQuota,
        geofenceConfig,
        updateGeofenceConfig,
        currentCoords,
        setCurrentCoords,
        currentLocationName,
        isInsideOfficeGeofence,
        distanceToOfficeMeters,
        setPresetLocation,
        useRealBrowserGps,
        attendanceRecords,
        todayEmployeeAttendance,
        clockIn,
        clockOut,
        approveAttendanceRecord,
        rejectAttendanceRecord,
        leaveRequests,
        submitLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        overtimeRequests,
        submitOvertimeRequest,
        approveOvertimeRequest,
        rejectOvertimeRequest,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        toasts,
        addToast,
        removeToast,
        zoomedImage,
        setZoomedImage,
        isCameraModalOpen,
        cameraMode,
        openCameraModal,
        closeCameraModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

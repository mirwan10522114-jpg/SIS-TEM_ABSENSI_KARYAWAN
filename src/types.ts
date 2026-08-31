export type UserRole = 'employee' | 'admin';

export type AttendanceStatus = 'hadir' | 'terlambat' | 'wfh' | 'dinas_luar' | 'cuti' | 'alpha';

export type AttendanceApprovalStatus = 'approved' | 'pending_approval' | 'rejected';

export type LeaveType = 
  | 'Cuti Tahunan'
  | 'Cuti Sakit'
  | 'Cuti Melahirkan'
  | 'Cuti Alasan Penting'
  | 'Izin Khusus';

export type LeaveStatus = 'pending' | 'disetujui' | 'ditolak';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeofenceConfig {
  officeName: string;
  address: string;
  center: Coordinates;
  radiusMeters: number; // e.g. 50, 100, 200
  strictMode: boolean; // if true, require reason for out-of-radius
}

export interface Employee {
  id: string;
  nip: string;
  name: string;
  email: string;
  pin?: string;
  phone: string;
  role: string;
  department: string;
  avatar: string;
  shift: string; // e.g. "08:00 - 17:00 WIB"
  joinDate: string;
  remainingLeave: number;
  usedLeave: number;
  status: 'active' | 'on_leave' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  employeeAvatar: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // e.g. "07:58:24"
  clockOutTime?: string; // e.g. "17:02:10"
  status: AttendanceStatus;
  approvalStatus?: AttendanceApprovalStatus;
  clockInLocation: {
    lat: number;
    lng: number;
    address: string;
    distanceMeters: number;
    isInsideGeofence: boolean;
  };
  clockOutLocation?: {
    lat: number;
    lng: number;
    address: string;
    distanceMeters: number;
    isInsideGeofence: boolean;
  };
  selfieClockIn: string; // Image URL or base64
  selfieClockOut?: string;
  reason?: string; // If clock in outside geofence (WFH / Dinas Luar) or late reason
  earlyClockOutReason?: string; // If clock out before shift end
  faceMatchConfidence?: number; // e.g. 95% similarity
  notes?: string;
  deviceInfo?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  employeeAvatar: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Penting' | 'Acara' | 'Info HR' | 'Kebijakan';
  isImportant?: boolean;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  employeeAvatar: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
  status: 'pending' | 'disetujui' | 'ditolak';
  appliedDate: string;
  reviewDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

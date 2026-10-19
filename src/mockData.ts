import { Employee, AttendanceRecord, LeaveRequest, OvertimeRequest, Announcement, GeofenceConfig } from './types';

// Default Office: Menara Digital Prima, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan
export const DEFAULT_GEOFENCE: GeofenceConfig = {
  officeName: 'Kantor Pusat - Menara Digital Prima',
  address: 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan 12190',
  center: {
    lat: -6.22415,
    lng: 106.80985,
  },
  radiusMeters: 100, // 100 meters
  strictMode: true,
};

// Preset locations for testing geofence
export const PRESET_LOCATIONS = [
  {
    name: 'Di Dalam Kantor (Lobi / Meja Kerja)',
    lat: -6.22418,
    lng: 106.80982,
    tag: 'Di Dalam Radius (25m)',
    isInside: true,
  },
  {
    name: 'Parkiran / Kafe Depan Kantor',
    lat: -6.22460,
    lng: 106.81020,
    tag: 'Batas Radius (65m)',
    isInside: true,
  },
  {
    name: 'Rumah Karyawan (Tebet - WFH)',
    lat: -6.23840,
    lng: 106.85210,
    tag: 'Di Luar Area (4.8 km)',
    isInside: false,
  },
  {
    name: 'Klien Meeting (Kuningan - Dinas Luar)',
    lat: -6.22980,
    lng: 106.82750,
    tag: 'Di Luar Area (2.1 km)',
    isInside: false,
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    nip: 'EMP-2024-001',
    name: 'Budi Pratama, S.Kom.',
    email: 'budi.pratama@perusahaan.co.id',
    phone: '+62 812-3456-7890',
    role: 'Senior Frontend Engineer',
    department: 'Engineering & IT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    shift: '08:00 - 17:00 WIB',
    joinDate: '15 Januari 2022',
    remainingLeave: 10,
    usedLeave: 2,
    status: 'active',
  },
  {
    id: 'emp-02',
    nip: 'EMP-2024-002',
    name: 'Siti Rahmawati, S.E.',
    email: 'siti.rahmawati@perusahaan.co.id',
    phone: '+62 813-9876-5432',
    role: 'Product Operations Lead',
    department: 'Product Management',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    shift: '08:30 - 17:30 WIB',
    joinDate: '10 Mei 2021',
    remainingLeave: 12,
    usedLeave: 0,
    status: 'active',
  },
  {
    id: 'emp-03',
    nip: 'EMP-2024-003',
    name: 'Dimas Wicaksono',
    email: 'dimas.w@perusahaan.co.id',
    phone: '+62 817-2345-6789',
    role: 'UI/UX Designer',
    department: 'Product & Design',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    shift: '09:00 - 18:00 WIB',
    joinDate: '1 Maret 2023',
    remainingLeave: 8,
    usedLeave: 4,
    status: 'active',
  },
  {
    id: 'emp-04',
    nip: 'EMP-2024-004',
    name: 'Anisa Kusuma Putri',
    email: 'anisa.kusuma@perusahaan.co.id',
    phone: '+62 819-8765-4321',
    role: 'HR Specialist & Talent',
    department: 'Human Resources',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    shift: '08:00 - 17:00 WIB',
    joinDate: '1 Februari 2020',
    remainingLeave: 6,
    usedLeave: 6,
    status: 'active',
  },
  {
    id: 'emp-05',
    nip: 'EMP-2024-005',
    name: 'Reza Fahlevi',
    email: 'reza.fahlevi@perusahaan.co.id',
    phone: '+62 856-1122-3344',
    role: 'Backend Architect',
    department: 'Engineering & IT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    shift: '08:00 - 17:00 WIB',
    joinDate: '10 Juli 2022',
    remainingLeave: 11,
    usedLeave: 1,
    status: 'active',
  }
];

// Sample selfie images
export const SAMPLE_SELFIES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    title: 'Town Hall Meeting Q3 2026',
    content: 'Town Hall Meeting Q3 — Jumat, 4 September 2026 pukul 14.00 WIB di Auditorium Lt. 5 & Zoom Meeting.',
    date: '2026-08-28',
    category: 'Penting',
    isImportant: true,
  },
  {
    id: 'ann-02',
    title: 'Pembaruan Kebijakan Jam Kerja & Absensi',
    content: 'Seluruh karyawan wajib melakukan Clock In maksimal pukul 08.30 WIB. Absensi di luar geofence wajib menyertakan foto dan keterangan tugas/WFH.',
    date: '2026-08-20',
    category: 'Kebijakan',
  }
];

export const INITIAL_OVERTIMES: OvertimeRequest[] = [];

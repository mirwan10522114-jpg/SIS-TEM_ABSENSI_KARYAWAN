-- Database creation script for Sistem Absensi Karyawan
CREATE DATABASE IF NOT EXISTS `sistem_absensi_karyawan` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sistem_absensi_karyawan`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Table: employees
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` VARCHAR(50) PRIMARY KEY,
  `nip` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `pin` VARCHAR(10) NOT NULL DEFAULT '123456',
  `password` VARCHAR(255) NOT NULL DEFAULT '123456',
  `phone` VARCHAR(30),
  `role` VARCHAR(100) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `avatar` TEXT,
  `shift` VARCHAR(100) DEFAULT 'Shift Pagi (08:00 - 17:00 WIB)',
  `join_date` VARCHAR(50),
  `remaining_leave` INT DEFAULT 12,
  `used_leave` INT DEFAULT 0,
  `status` ENUM('active', 'on_leave', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed employees (Default 6-digit PIN for all employees: 123456)
INSERT INTO `employees` (`id`, `nip`, `name`, `email`, `pin`, `password`, `phone`, `role`, `department`, `avatar`, `shift`, `join_date`, `remaining_leave`, `used_leave`, `status`) VALUES
('emp-01', 'EMP-2024-001', 'Budi Pratama, S.Kom.', 'budi.pratama@perusahaan.co.id', '123456', '123456', '+62 812-3456-7890', 'Senior Frontend Engineer', 'Engineering & IT', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'Shift Pagi (08:00 - 17:00 WIB)', '15 Januari 2022', 10, 2, 'active'),
('emp-02', 'EMP-2024-002', 'Siti Rahmawati, S.E.', 'siti.rahmawati@perusahaan.co.id', '123456', '123456', '+62 813-9876-5432', 'Product Operations Lead', 'Product Management', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', 'Shift Siang (13:00 - 21:00 WIB)', '10 Mei 2021', 12, 0, 'active'),
('emp-03', 'EMP-2024-003', 'Dimas Wicaksono', 'dimas.w@perusahaan.co.id', '123456', '123456', '+62 817-2345-6789', 'UI/UX Designer', 'Product & Design', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'Shift Malam (21:00 - 05:00 WIB)', '1 Maret 2023', 8, 4, 'active'),
('emp-04', 'EMP-2024-004', 'Anisa Kusuma Putri', 'anisa.kusuma@perusahaan.co.id', '123456', '123456', '+62 819-8765-4321', 'HR Specialist & Talent', 'Human Resources', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'Shift Pagi (08:00 - 17:00 WIB)', '1 Februari 2020', 6, 6, 'active'),
('emp-05', 'EMP-2024-005', 'Reza Fahlevi', 'reza.fahlevi@perusahaan.co.id', '123456', '123456', '+62 856-1122-3344', 'Backend Architect', 'Engineering & IT', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'Shift Pagi (08:00 - 17:00 WIB)', '10 Juli 2022', 11, 1, 'active');

-- 2. Table: admins
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `pin` VARCHAR(10) NOT NULL DEFAULT '123456',
  `password` VARCHAR(255) NOT NULL DEFAULT 'admin123',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `admins` (`username`, `email`, `name`, `pin`, `password`) VALUES
('admin', 'admin@perusahaan.co.id', 'Administrator HR System', '123456', 'admin123');

-- 3. Table: geofence_config
DROP TABLE IF EXISTS `geofence_config`;
CREATE TABLE `geofence_config` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `office_name` VARCHAR(150) NOT NULL,
  `address` TEXT NOT NULL,
  `lat` DECIMAL(10, 8) NOT NULL,
  `lng` DECIMAL(11, 8) NOT NULL,
  `radius_meters` INT NOT NULL DEFAULT 100,
  `strict_mode` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `geofence_config` (`id`, `office_name`, `address`, `lat`, `lng`, `radius_meters`, `strict_mode`) VALUES
(1, 'Kantor Pusat - Menara Digital Prima', 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan 12190', -6.22415000, 106.80985000, 100, 1);

-- 4. Table: company_settings (Rule & 3 Shifts Config)
DROP TABLE IF EXISTS `company_settings`;
CREATE TABLE `company_settings` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `monthly_leave_allowance` INT DEFAULT 1,
  `yearly_leave_quota` INT DEFAULT 12,
  `auto_reset_leave_day` INT DEFAULT 1,
  `late_tolerance_minutes` INT DEFAULT 15,
  `shift_pagi_start` VARCHAR(10) DEFAULT '08:00',
  `shift_pagi_end` VARCHAR(10) DEFAULT '17:00',
  `shift_siang_start` VARCHAR(10) DEFAULT '13:00',
  `shift_siang_end` VARCHAR(10) DEFAULT '21:00',
  `shift_malam_start` VARCHAR(10) DEFAULT '21:00',
  `shift_malam_end` VARCHAR(10) DEFAULT '05:00',
  `min_face_match_confidence` INT DEFAULT 85,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `company_settings` (`id`, `monthly_leave_allowance`, `yearly_leave_quota`, `auto_reset_leave_day`, `late_tolerance_minutes`, `shift_pagi_start`, `shift_pagi_end`, `shift_siang_start`, `shift_siang_end`, `shift_malam_start`, `shift_malam_end`, `min_face_match_confidence`) VALUES
(1, 1, 12, 1, 15, '08:00', '17:00', '13:00', '21:00', '21:00', '05:00', 85);

-- 5. Table: attendance_records
DROP TABLE IF EXISTS `attendance_records`;
CREATE TABLE `attendance_records` (
  `id` VARCHAR(50) PRIMARY KEY,
  `employee_id` VARCHAR(50) NOT NULL,
  `employee_name` VARCHAR(100),
  `employee_department` VARCHAR(100),
  `employee_avatar` TEXT,
  `date` VARCHAR(10) NOT NULL,
  `clock_in_time` VARCHAR(15) NOT NULL,
  `clock_out_time` VARCHAR(15),
  `status` ENUM('hadir', 'terlambat', 'wfh', 'dinas_luar', 'cuti', 'alpha') NOT NULL DEFAULT 'hadir',
  `approval_status` ENUM('approved', 'pending_approval', 'rejected') NOT NULL DEFAULT 'approved',
  `clock_in_lat` DECIMAL(10, 8),
  `clock_in_lng` DECIMAL(11, 8),
  `clock_in_address` TEXT,
  `clock_in_distance_meters` INT,
  `clock_in_is_inside` TINYINT(1),
  `clock_out_lat` DECIMAL(10, 8),
  `clock_out_lng` DECIMAL(11, 8),
  `clock_out_address` TEXT,
  `clock_out_distance_meters` INT,
  `clock_out_is_inside` TINYINT(1),
  `selfie_clock_in` LONGTEXT,
  `selfie_clock_out` LONGTEXT,
  `reason` TEXT,
  `early_clock_out_reason` TEXT,
  `face_match_confidence` INT DEFAULT 95,
  `notes` TEXT,
  `device_info` VARCHAR(150),
  `reviewed_by` VARCHAR(100),
  `review_notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Table: leave_requests
DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests` (
  `id` VARCHAR(50) PRIMARY KEY,
  `employee_id` VARCHAR(50) NOT NULL,
  `employee_name` VARCHAR(100),
  `employee_department` VARCHAR(100),
  `employee_avatar` TEXT,
  `leave_type` VARCHAR(50) NOT NULL,
  `start_date` VARCHAR(10) NOT NULL,
  `end_date` VARCHAR(10) NOT NULL,
  `total_days` INT NOT NULL,
  `reason` TEXT NOT NULL,
  `attachment_name` VARCHAR(255),
  `attachment_url` TEXT,
  `status` ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
  `applied_date` VARCHAR(10) NOT NULL,
  `review_date` VARCHAR(10),
  `reviewed_by` VARCHAR(100),
  `rejection_reason` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Table: overtime_requests
DROP TABLE IF EXISTS `overtime_requests`;
CREATE TABLE `overtime_requests` (
  `id` VARCHAR(50) PRIMARY KEY,
  `employee_id` VARCHAR(50) NOT NULL,
  `employee_name` VARCHAR(100),
  `employee_department` VARCHAR(100),
  `employee_avatar` TEXT,
  `date` VARCHAR(10) NOT NULL,
  `start_time` VARCHAR(10) NOT NULL,
  `end_time` VARCHAR(10) NOT NULL,
  `hours` DECIMAL(4,2) NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
  `applied_date` VARCHAR(10) NOT NULL,
  `review_date` VARCHAR(10),
  `reviewed_by` VARCHAR(100),
  `rejection_reason` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Table: announcements
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `date` VARCHAR(10) NOT NULL,
  `category` ENUM('Penting', 'Acara', 'Info HR', 'Kebijakan') DEFAULT 'Penting',
  `is_important` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `announcements` (`id`, `title`, `content`, `date`, `category`, `is_important`) VALUES
('ann-01', 'Town Hall Meeting Q3 2026', 'Town Hall Meeting Q3 — Jumat, 4 September 2026 pukul 14.00 WIB di Auditorium Lt. 5 & Zoom Meeting.', '2026-08-28', 'Penting', 1),
('ann-02', 'Pembaruan Kebijakan Jam Kerja & Absensi', 'Seluruh karyawan wajib melakukan Clock In sesuai shift (Pagi/Siang/Malam). Pengajuan jam lembur hanya berlaku setelah jam shift kerja selesai.', '2026-08-20', 'Kebijakan', 0);

SET FOREIGN_KEY_CHECKS = 1;

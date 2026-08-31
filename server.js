import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database Connection Pool
const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'sistem_absensi_karyawan';
const dbPort = Number(process.env.DB_PORT) || 3306;

const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// --- AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, pin } = req.body;
    if (!identifier || !pin) {
      return res.status(400).json({ success: false, message: 'Identitas (NIP/Email) dan PIN 6 digit wajib diisi!' });
    }

    const cleanId = identifier.trim();
    const cleanPin = pin.trim();

    // 1. Check if login matches Admin credentials
    const [adminRows] = await pool.query(
      'SELECT * FROM admins WHERE (username = ? OR email = ?) LIMIT 1',
      [cleanId, cleanId]
    );

    if (adminRows.length > 0) {
      const admin = adminRows[0];
      if (admin.pin === cleanPin || admin.password === cleanPin) {
        return res.json({
          success: true,
          message: 'Login Admin HR Berhasil!',
          role: 'admin',
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role: 'Admin HR',
          },
        });
      } else {
        return res.status(401).json({ success: false, message: 'PIN Admin tidak sesuai.' });
      }
    }

    // 2. Check if login matches Employee credentials
    const [empRows] = await pool.query(
      'SELECT * FROM employees WHERE (email = ? OR nip = ?) LIMIT 1',
      [cleanId, cleanId]
    );

    if (empRows.length > 0) {
      const emp = empRows[0];
      if (emp.pin === cleanPin || emp.password === cleanPin) {
        const employeeData = {
          id: emp.id,
          nip: emp.nip,
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          role: emp.role,
          department: emp.department,
          avatar: emp.avatar,
          shift: emp.shift,
          joinDate: emp.join_date,
          remainingLeave: Number(emp.remaining_leave),
          usedLeave: Number(emp.used_leave),
          status: emp.status,
        };

        return res.json({
          success: true,
          message: `Selamat datang, ${emp.name}!`,
          role: 'employee',
          employee: employeeData,
        });
      } else {
        return res.status(401).json({ success: false, message: 'PIN 6 digit Karyawan tidak sesuai.' });
      }
    }

    return res.status(401).json({ success: false, message: 'Akun Karyawan / Admin tidak ditemukan. Periksa NIP / Email Anda.' });
  } catch (error) {
    console.error('Error in login API:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- GEOFENCE ---
app.get('/api/geofence', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM geofence_config WHERE id = 1 LIMIT 1');
    if (rows.length === 0) {
      return res.json({
        officeName: 'Kantor Pusat - Menara Digital Prima',
        address: 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan 12190',
        center: { lat: -6.22415, lng: 106.80985 },
        radiusMeters: 100,
        strictMode: true,
      });
    }
    const r = rows[0];
    res.json({
      officeName: r.office_name,
      address: r.address,
      center: { lat: Number(r.lat), lng: Number(r.lng) },
      radiusMeters: Number(r.radius_meters),
      strictMode: Boolean(r.strict_mode),
    });
  } catch (error) {
    console.error('Error fetching geofence:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/geofence', async (req, res) => {
  try {
    const { officeName, address, center, lat, lng, radiusMeters, strictMode } = req.body;
    const finalLat = center?.lat ?? lat ?? -6.22415;
    const finalLng = center?.lng ?? lng ?? 106.80985;
    await pool.query(
      `UPDATE geofence_config SET office_name=?, address=?, lat=?, lng=?, radius_meters=?, strict_mode=? WHERE id=1`,
      [officeName, address, finalLat, finalLng, radiusMeters, strictMode ? 1 : 0]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating geofence:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- EMPLOYEES ---
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees ORDER BY created_at ASC');
    const employees = rows.map(r => ({
      id: r.id,
      nip: r.nip,
      name: r.name,
      email: r.email,
      phone: r.phone,
      role: r.role,
      department: r.department,
      avatar: r.avatar,
      shift: r.shift,
      joinDate: r.join_date,
      remainingLeave: Number(r.remaining_leave),
      usedLeave: Number(r.used_leave),
      status: r.status,
    }));
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const emp = req.body;
    await pool.query(
      `INSERT INTO employees (id, nip, name, email, phone, role, department, avatar, shift, join_date, remaining_leave, used_leave, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [emp.id, emp.nip, emp.name, emp.email, emp.phone, emp.role, emp.department, emp.avatar, emp.shift, emp.joinDate, emp.remainingLeave, emp.usedLeave, emp.status]
    );
    res.json({ success: true, employee: emp });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const emp = req.body;
    await pool.query(
      `UPDATE employees SET nip=?, name=?, email=?, pin=?, phone=?, role=?, department=?, avatar=?, shift=?, remaining_leave=?, used_leave=?, status=? WHERE id=?`,
      [emp.nip || emp.id, emp.name, emp.email, emp.pin || '123456', emp.phone, emp.role, emp.department, emp.avatar, emp.shift, emp.remainingLeave, emp.usedLeave, emp.status, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees/reset-monthly-leave', async (req, res) => {
  try {
    const { allowance } = req.body;
    const addAllowance = allowance ? Number(allowance) : 1;
    await pool.query(
      `UPDATE employees SET remaining_leave = remaining_leave + ?, used_leave = 0 WHERE status = 'active'`,
      [addAllowance]
    );
    res.json({ success: true, message: `Kuota cuti bulanan berhasil di-reset (+${addAllowance} Hari)` });
  } catch (error) {
    console.error('Error resetting monthly leave:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- COMPANY SETTINGS ---
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM company_settings WHERE id = 1 LIMIT 1');
    if (rows.length === 0) {
      return res.json({
        monthlyLeaveAllowance: 1,
        yearlyLeaveQuota: 12,
        autoResetLeaveDay: 1,
        lateToleranceMinutes: 15,
        shiftPagiStart: '08:00',
        shiftPagiEnd: '17:00',
        shiftSiangStart: '13:00',
        shiftSiangEnd: '21:00',
        shiftMalamStart: '21:00',
        shiftMalamEnd: '05:00',
        minFaceMatchConfidence: 85,
      });
    }
    const s = rows[0];
    res.json({
      monthlyLeaveAllowance: Number(s.monthly_leave_allowance),
      yearlyLeaveQuota: Number(s.yearly_leave_quota),
      autoResetLeaveDay: Number(s.auto_reset_leave_day),
      lateToleranceMinutes: Number(s.late_tolerance_minutes),
      shiftPagiStart: s.shift_pagi_start || '08:00',
      shiftPagiEnd: s.shift_pagi_end || '17:00',
      shiftSiangStart: s.shift_siang_start || '13:00',
      shiftSiangEnd: s.shift_siang_end || '21:00',
      shiftMalamStart: s.shift_malam_start || '21:00',
      shiftMalamEnd: s.shift_malam_end || '05:00',
      minFaceMatchConfidence: Number(s.min_face_match_confidence),
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { 
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
      minFaceMatchConfidence 
    } = req.body;

    await pool.query(
      `UPDATE company_settings SET monthly_leave_allowance=?, yearly_leave_quota=?, auto_reset_leave_day=?, late_tolerance_minutes=?, shift_pagi_start=?, shift_pagi_end=?, shift_siang_start=?, shift_siang_end=?, shift_malam_start=?, shift_malam_end=?, min_face_match_confidence=? WHERE id=1`,
      [
        monthlyLeaveAllowance, 
        yearlyLeaveQuota, 
        autoResetLeaveDay, 
        lateToleranceMinutes, 
        shiftPagiStart || '08:00',
        shiftPagiEnd || '17:00',
        shiftSiangStart || '13:00',
        shiftSiangEnd || '21:00',
        shiftMalamStart || '21:00',
        shiftMalamEnd || '05:00',
        minFaceMatchConfidence
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- ATTENDANCE RECORDS ---
app.get('/api/attendance', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attendance_records ORDER BY date DESC, clock_in_time DESC');
    const records = rows.map(r => {
      const rec = {
        id: r.id,
        employeeId: r.employee_id,
        employeeName: r.employee_name,
        employeeDepartment: r.employee_department,
        employeeAvatar: r.employee_avatar,
        date: r.date,
        clockInTime: r.clock_in_time,
        clockOutTime: r.clock_out_time || undefined,
        status: r.status,
        approvalStatus: r.approval_status || 'approved',
        clockInLocation: {
          lat: Number(r.clock_in_lat),
          lng: Number(r.clock_in_lng),
          address: r.clock_in_address || '',
          distanceMeters: Number(r.clock_in_distance_meters || 0),
          isInsideGeofence: Boolean(r.clock_in_is_inside),
        },
        selfieClockIn: r.selfie_clock_in,
        selfieClockOut: r.selfie_clock_out || undefined,
        reason: r.reason || undefined,
        earlyClockOutReason: r.early_clock_out_reason || undefined,
        faceMatchConfidence: r.face_match_confidence ? Number(r.face_match_confidence) : 95,
        notes: r.notes || undefined,
        deviceInfo: r.device_info || undefined,
        reviewedBy: r.reviewed_by || undefined,
        reviewNotes: r.review_notes || undefined,
      };

      if (r.clock_out_lat !== null && r.clock_out_lat !== undefined) {
        rec.clockOutLocation = {
          lat: Number(r.clock_out_lat),
          lng: Number(r.clock_out_lng),
          address: r.clock_out_address || '',
          distanceMeters: Number(r.clock_out_distance_meters || 0),
          isInsideGeofence: Boolean(r.clock_out_is_inside),
        };
      }
      return rec;
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const rec = req.body;
    await pool.query(
      `INSERT INTO attendance_records 
       (id, employee_id, employee_name, employee_department, employee_avatar, date, clock_in_time, status, approval_status, clock_in_lat, clock_in_lng, clock_in_address, clock_in_distance_meters, clock_in_is_inside, selfie_clock_in, reason, early_clock_out_reason, face_match_confidence, notes, device_info)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rec.id,
        rec.employeeId,
        rec.employeeName,
        rec.employeeDepartment,
        rec.employeeAvatar,
        rec.date,
        rec.clockInTime,
        rec.status,
        rec.approvalStatus || 'approved',
        rec.clockInLocation.lat,
        rec.clockInLocation.lng,
        rec.clockInLocation.address,
        rec.clockInLocation.distanceMeters,
        rec.clockInLocation.isInsideGeofence ? 1 : 0,
        rec.selfieClockIn,
        rec.reason || null,
        rec.earlyClockOutReason || null,
        rec.faceMatchConfidence || 95,
        rec.notes || null,
        rec.deviceInfo || null,
      ]
    );
    res.json({ success: true, record: rec });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rec = req.body;
    await pool.query(
      `UPDATE attendance_records SET 
       clock_out_time = ?, 
       approval_status = ?,
       clock_out_lat = ?, 
       clock_out_lng = ?, 
       clock_out_address = ?, 
       clock_out_distance_meters = ?, 
       clock_out_is_inside = ?, 
       selfie_clock_out = ?,
       early_clock_out_reason = ?
       WHERE id = ?`,
      [
        rec.clockOutTime,
        rec.approvalStatus || 'approved',
        rec.clockOutLocation.lat,
        rec.clockOutLocation.lng,
        rec.clockOutLocation.address,
        rec.clockOutLocation.distanceMeters,
        rec.clockOutLocation.isInsideGeofence ? 1 : 0,
        rec.selfieClockOut,
        rec.earlyClockOutReason || null,
        id,
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/attendance/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewedBy, reviewNotes } = req.body;
    await pool.query(
      `UPDATE attendance_records SET approval_status='approved', reviewed_by=?, review_notes=? WHERE id=?`,
      [reviewedBy || 'Admin HR', reviewNotes || 'Presensi dan Alasan Disetujui Admin HR', id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error approving attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/attendance/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewedBy, reviewNotes } = req.body;
    await pool.query(
      `UPDATE attendance_records SET approval_status='rejected', reviewed_by=?, review_notes=? WHERE id=?`,
      [reviewedBy || 'Admin HR', reviewNotes || 'Alasan tidak dapat diterima oleh Admin HR', id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error rejecting attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- LEAVE REQUESTS ---
app.get('/api/leaves', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM leave_requests ORDER BY applied_date DESC');
    const leaves = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeDepartment: r.employee_department,
      employeeAvatar: r.employee_avatar,
      leaveType: r.leave_type,
      startDate: r.start_date,
      endDate: r.end_date,
      totalDays: Number(r.total_days),
      reason: r.reason,
      attachmentName: r.attachment_name || undefined,
      attachmentUrl: r.attachment_url || undefined,
      status: r.status,
      appliedDate: r.applied_date,
      reviewDate: r.review_date || undefined,
      reviewedBy: r.reviewed_by || undefined,
      rejectionReason: r.rejection_reason || undefined,
    }));
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leaves', async (req, res) => {
  try {
    const l = req.body;
    await pool.query(
      `INSERT INTO leave_requests
       (id, employee_id, employee_name, employee_department, employee_avatar, leave_type, start_date, end_date, total_days, reason, attachment_name, attachment_url, status, applied_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        l.id,
        l.employeeId,
        l.employeeName,
        l.employeeDepartment,
        l.employeeAvatar,
        l.leaveType,
        l.startDate,
        l.endDate,
        l.totalDays,
        l.reason,
        l.attachmentName || null,
        l.attachmentUrl || null,
        l.status,
        l.appliedDate,
      ]
    );
    res.json({ success: true, leave: l });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leaves/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewDate, reviewedBy, rejectionReason } = req.body;
    await pool.query(
      `UPDATE leave_requests SET status=?, review_date=?, reviewed_by=?, rejection_reason=? WHERE id=?`,
      [status, reviewDate, reviewedBy, rejectionReason || null, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- OVERTIME REQUESTS ---
app.get('/api/overtime', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM overtime_requests ORDER BY date DESC, created_at DESC');
    const overtimes = rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeDepartment: r.employee_department,
      employeeAvatar: r.employee_avatar,
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time,
      hours: Number(r.hours),
      reason: r.reason,
      status: r.status,
      appliedDate: r.applied_date,
      reviewDate: r.review_date || undefined,
      reviewedBy: r.reviewed_by || undefined,
      rejectionReason: r.rejection_reason || undefined,
    }));
    res.json(overtimes);
  } catch (error) {
    console.error('Error fetching overtime requests:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/overtime', async (req, res) => {
  try {
    const ovt = req.body;
    await pool.query(
      `INSERT INTO overtime_requests (id, employee_id, employee_name, employee_department, employee_avatar, date, start_time, end_time, hours, reason, status, applied_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ovt.id,
        ovt.employeeId,
        ovt.employeeName,
        ovt.employeeDepartment,
        ovt.employeeAvatar,
        ovt.date,
        ovt.startTime,
        ovt.endTime,
        ovt.hours,
        ovt.reason,
        ovt.status || 'pending',
        ovt.appliedDate,
      ]
    );
    res.json({ success: true, overtime: ovt });
  } catch (error) {
    console.error('Error creating overtime request:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/overtime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewDate, reviewedBy, rejectionReason } = req.body;
    await pool.query(
      `UPDATE overtime_requests SET status=?, review_date=?, reviewed_by=?, rejection_reason=? WHERE id=?`,
      [status, reviewDate, reviewedBy, rejectionReason || null, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating overtime request:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- ANNOUNCEMENTS ---
app.get('/api/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY date DESC');
    const anns = rows.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      date: r.date,
      category: r.category,
      isImportant: Boolean(r.is_important),
    }));
    res.json(anns);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const ann = req.body;
    await pool.query(
      `INSERT INTO announcements (id, title, content, date, category, is_important) VALUES (?, ?, ?, ?, ?, ?)`,
      [ann.id, ann.title, ann.content, ann.date, ann.category, ann.isImportant ? 1 : 0]
    );
    res.json({ success: true, announcement: ann });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Express server connected to MySQL database '${dbName}' on port ${PORT}`);
});

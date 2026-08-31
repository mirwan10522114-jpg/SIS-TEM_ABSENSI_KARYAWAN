# 🔄 Alur Bisnis — Sistem Absensi Karyawan

**Versi Dokumen:** 1.0  
**Tanggal:** 31 Agustus 2026

---

## 1. Alur Login (Autentikasi)

```mermaid
flowchart TD
    A["🔐 Halaman Login"] --> B["Input NIP/Email + PIN 6 digit"]
    B --> C{"Cek di Database"}
    C -->|"Cocok Admin"| D["✅ Redirect → Panel Admin HR"]
    C -->|"Cocok Karyawan"| E["✅ Redirect → Portal Karyawan"]
    C -->|"Tidak Cocok"| F["❌ Tampilkan Error Message"]
    F --> A
    D --> G["Session tersimpan di localStorage"]
    E --> G
```

**Detail Alur:**
1. Pengguna membuka aplikasi → Halaman Login ditampilkan.
2. Pengguna memasukkan **NIP/Email** dan **PIN 6 digit**.
3. Sistem cek ke tabel `admins` terlebih dahulu:
   - Jika cocok → login sebagai **Admin HR**.
4. Jika bukan admin, cek ke tabel `employees`:
   - Jika cocok → login sebagai **Karyawan** (set `activeEmployeeId`).
5. Jika tidak ditemukan di kedua tabel → tampilkan pesan error.
6. Session disimpan di `localStorage` → persist saat refresh halaman.

---

## 2. Alur Clock In (Absen Masuk)

```mermaid
flowchart TD
    A["🏠 Dashboard Karyawan"] --> B["Klik Tombol Clock In"]
    B --> C["📸 Modal Kamera Terbuka"]
    C --> D["Karyawan Ambil Selfie Wajah"]
    D --> E{"📍 Cek Lokasi GPS"}
    E -->|"Di Dalam Radius"| F{"⏰ Cek Jam Shift"}
    E -->|"Di Luar Radius"| G["Status: WFH"]
    F -->|"Tepat Waktu"| H["Status: HADIR ✅"]
    F -->|"Melewati Toleransi"| I["Status: TERLAMBAT ⏰"]
    G --> J["Wajib Input Alasan WFH"]
    I --> K["Wajib Input Alasan Terlambat"]
    H --> L["💾 Simpan ke Database"]
    J --> L
    K --> L
    L --> M["Toast: Clock In Berhasil!"]
    M --> N["Dashboard Update: Sudah Clock In"]
```

**Detail Alur:**
1. Karyawan membuka Dashboard → Tekan tombol **Clock In**.
2. Modal kamera terbuka → Karyawan mengambil **selfie wajah**.
3. Sistem otomatis membaca **koordinat GPS perangkat**.
4. **Hitung jarak** ke koordinat kantor (rumus Haversine).
5. **Tentukan status:**

| Kondisi | Status | Approval |
|---|---|---|
| Di dalam radius + tepat waktu | `hadir` | `approved` otomatis |
| Di dalam radius + lewat toleransi | `terlambat` | `pending_approval` → perlu approval Admin |
| Di luar radius kantor | `wfh` | `approved` (alasan wajib diisi) |

6. Data disimpan ke tabel `attendance_records` di MySQL.
7. Dashboard karyawan menampilkan status absensi hari ini.

---

## 3. Alur Clock Out (Absen Pulang)

```mermaid
flowchart TD
    A["Dashboard: Sudah Clock In"] --> B["Klik Tombol Clock Out"]
    B --> C["📸 Modal Kamera Terbuka"]
    C --> D["Karyawan Ambil Selfie Wajah"]
    D --> E{"⏰ Cek Jam Clock Out"}
    E -->|"Setelah Jam Shift Selesai"| F["Clock Out Normal ✅"]
    E -->|"Sebelum Jam Shift Selesai"| G["Wajib Input Alasan Pulang Cepat"]
    G --> H["Status: pending_approval"]
    F --> I["💾 Update Record di Database"]
    H --> I
    I --> J["Toast: Clock Out Berhasil!"]
    J --> K["Dashboard: Absensi Hari Ini Selesai"]
```

**Detail Alur:**
1. Karyawan yang sudah Clock In → Tekan tombol **Clock Out**.
2. Modal kamera terbuka → Ambil selfie wajah.
3. **Cek jam Clock Out** terhadap jam shift selesai karyawan:
   - Jika **setelah jam shift selesai** → Clock Out normal, `approved`.
   - Jika **sebelum jam shift selesai** → Wajib input alasan + status `pending_approval`.
4. Record `attendance_records` di-update dengan `clock_out_time`, lokasi, dan selfie.

---

## 4. Alur Pengajuan Cuti / Izin

```mermaid
flowchart TD
    A["Portal Karyawan"] --> B["Menu: Pengajuan Cuti & Lembur"]
    B --> C["Tab: Pengajuan Cuti/Izin"]
    C --> D["Isi Form Pengajuan"]
    D --> E["Pilih Jenis Cuti"]
    E --> F["Input Tanggal Mulai & Selesai"]
    F --> G["Input Alasan"]
    G --> H{"Jenis = Cuti Sakit?"}
    H -->|"Ya"| I["Lampirkan Surat Dokter"]
    H -->|"Tidak"| J["Langsung Kirim"]
    I --> J
    J --> K["💾 Simpan ke Database<br>Status: PENDING"]
    K --> L["Notifikasi ke Admin HR"]
    L --> M{"Admin Review"}
    M -->|"Setujui"| N["Status: DISETUJUI ✅<br>Kuota Cuti Berkurang"]
    M -->|"Tolak"| O["Status: DITOLAK ❌<br>+ Alasan Penolakan"]
```

**Jenis Cuti yang Tersedia:**

| Jenis Cuti | Lampiran Wajib? |
|---|---|
| Cuti Tahunan | Tidak |
| Cuti Sakit | Ya (Surat Keterangan Dokter) |
| Cuti Melahirkan | Ya |
| Cuti Alasan Penting | Tidak |
| Izin Khusus | Tidak |

**Dampak Approval Cuti:**
- Saat Admin menyetujui → `remaining_leave` karyawan **otomatis berkurang** sesuai jumlah hari.
- Saat Admin menolak → kuota cuti **tidak berubah**.

---

## 5. Alur Pengajuan Jam Lembur

```mermaid
flowchart TD
    A["Portal Karyawan"] --> B["Menu: Pengajuan Cuti & Lembur"]
    B --> C["Tab: Pengajuan Jam Lembur"]
    C --> D["Isi Form Lembur"]
    D --> E["Input Tanggal Lembur"]
    E --> F["Input Jam Mulai & Jam Selesai"]
    F --> G{"Jam Mulai ≥ Jam Shift Selesai?"}
    G -->|"Ya (Valid)"| H["Input Alasan/Tugas Pekerjaan"]
    G -->|"Tidak (Invalid)"| I["❌ Error: Lembur hanya berlaku<br>setelah jam shift kerja selesai"]
    I --> F
    H --> J["Kalkulasi Otomatis Total Jam"]
    J --> K["💾 Simpan ke Database<br>Status: PENDING"]
    K --> L["Notifikasi ke Admin HR"]
    L --> M{"Admin Review"}
    M -->|"Setujui"| N["Status: DISETUJUI ✅"]
    M -->|"Tolak"| O["Status: DITOLAK ❌<br>+ Alasan Penolakan"]
```

**Aturan Validasi Lembur:**

| Shift Karyawan | Jam Selesai Shift | Lembur Valid Mulai |
|---|---|---|
| Shift Pagi (08:00 - 17:00) | 17:00 | ≥ 17:00 |
| Shift Siang (13:00 - 21:00) | 21:00 | ≥ 21:00 |
| Shift Malam (21:00 - 05:00) | 05:00 | ≥ 05:00 |

---

## 6. Alur Approval Admin HR

```mermaid
flowchart TD
    A["Panel Admin HR"] --> B{"Jenis Approval"}
    B -->|"Absensi"| C["Menu: Riwayat Absensi"]
    B -->|"Cuti"| D["Menu: Approval Cuti"]
    B -->|"Lembur"| E["Menu: Approval Lembur"]
    
    C --> C1["Lihat Record pending_approval"]
    C1 --> C2["Review: Selfie + Lokasi + Alasan"]
    C2 --> C3{"Keputusan"}
    C3 -->|"Approve"| C4["✅ Status → approved"]
    C3 -->|"Reject"| C5["❌ Status → rejected + Catatan"]
    
    D --> D1["Lihat Pengajuan Pending"]
    D1 --> D2["Review: Jenis + Tanggal + Alasan + Lampiran"]
    D2 --> D3{"Keputusan"}
    D3 -->|"Setujui"| D4["✅ Status → disetujui<br>Kuota Cuti Karyawan Berkurang"]
    D3 -->|"Tolak"| D5["❌ Status → ditolak<br>+ Alasan Penolakan"]
    
    E --> E1["Lihat Pengajuan Pending"]
    E1 --> E2["Review: Tanggal + Jam + Total Jam + Alasan"]
    E2 --> E3{"Keputusan"}
    E3 -->|"Setujui"| E4["✅ Status → disetujui"]
    E3 -->|"Tolak"| E5["❌ Status → ditolak<br>+ Alasan Penolakan"]
```

---

## 7. Alur Manajemen Karyawan (Admin)

```mermaid
flowchart TD
    A["Panel Admin HR"] --> B["Menu: Data Karyawan"]
    B --> C{"Aksi"}
    C -->|"Tambah"| D["Form Tambah Karyawan Baru"]
    C -->|"Edit"| E["Form Edit Data Karyawan"]
    C -->|"Lihat"| F["Detail Karyawan"]
    
    D --> D1["Input: NIP, Nama, Email, PIN,<br>Telepon, Jabatan, Departemen"]
    D1 --> D2["Pilih Shift: Pagi / Siang / Malam / Custom"]
    D2 --> D3["Set Kuota Cuti & Status"]
    D3 --> D4["💾 Simpan ke Database"]
    
    E --> E1["Edit Field yang Diinginkan"]
    E1 --> E2["Bisa Ubah: Shift, PIN, Status,<br>Kuota Cuti, Departemen, dll"]
    E2 --> E3["💾 Update di Database"]
```

---

## 8. Alur Pengaturan Shift & Kebijakan

```mermaid
flowchart TD
    A["Panel Admin HR"] --> B["Menu: Aturan & Kebijakan"]
    B --> C["Pengaturan Kebijakan Cuti"]
    B --> D["Pengaturan Jam 3 Shift Kerja"]
    
    C --> C1["Set: Jatah Cuti Bulanan"]
    C1 --> C2["Set: Total Jatah Cuti Tahunan"]
    C2 --> C3["Auto-Reset: Tanggal 1 Setiap Bulan"]
    C3 --> C4["Tombol: Manual Reset Kuota Cuti"]
    
    D --> D1["Shift Pagi: Set Jam Masuk & Jam Selesai"]
    D1 --> D2["Shift Siang: Set Jam Masuk & Jam Selesai"]
    D2 --> D3["Shift Malam: Set Jam Masuk & Jam Selesai"]
    D3 --> D4["Set Toleransi Keterlambatan (Menit)"]
    
    C4 --> E["💾 Simpan ke Database"]
    D4 --> E
```

**Dampak Pengaturan Shift:**
- Jam shift yang diubah di sini **otomatis berlaku** untuk penugasan karyawan baru.
- Karyawan yang sudah dipasangkan shift → shift string di record-nya tetap menggunakan jam yang tertulis di field `shift`.
- Toleransi keterlambatan diterapkan saat kalkulasi status Clock In.

---

## 9. Alur Pengaturan Geofence

```mermaid
flowchart TD
    A["Panel Admin HR"] --> B["Menu: Pengaturan Geofence"]
    B --> C["Peta Interaktif Leaflet"]
    C --> D{"Cara Set Lokasi"}
    D -->|"Klik Peta"| E["Koordinat Otomatis dari Klik"]
    D -->|"Input Manual"| F["Ketik Latitude & Longitude"]
    D -->|"Preset Kota"| G["Pilih Kota Besar Indonesia"]
    E --> H["Set Radius Geofence (50m - 500m)"]
    F --> H
    G --> H
    H --> I["Set Nama Kantor & Alamat"]
    I --> J["💾 Simpan ke Database"]
    J --> K["Radius Baru Berlaku untuk<br>Semua Clock In/Out Selanjutnya"]
```

---

## 10. Alur Reset Kuota Cuti Bulanan

```mermaid
flowchart TD
    A{"Trigger Reset"} -->|"Otomatis"| B["Tanggal 1 Setiap Bulan Baru"]
    A -->|"Manual"| C["Admin Klik Tombol Reset"]
    B --> D["Untuk Setiap Karyawan Aktif"]
    C --> D
    D --> E["remaining_leave += monthly_leave_allowance"]
    E --> F["used_leave = 0 (Reset)"]
    F --> G["💾 Update Semua Karyawan di Database"]
    G --> H["Toast: Reset Cuti Berhasil!"]
```

---

## 11. Ringkasan Status & Transisi

### Status Kehadiran (Attendance)

| Status | Kode | Deskripsi | Butuh Approval? |
|---|---|---|---|
| ✅ Hadir | `hadir` | Clock In tepat waktu + di dalam radius | Tidak |
| ⏰ Terlambat | `terlambat` | Clock In melewati toleransi | Ya |
| 🏠 WFH | `wfh` | Clock In di luar radius geofence | Tidak (alasan wajib) |
| 🚗 Dinas Luar | `dinas_luar` | Tugas di luar kantor | Ya |
| 🏖️ Cuti | `cuti` | Izin tidak masuk kerja | Via pengajuan cuti |
| ❌ Alpha | `alpha` | Tidak absen tanpa keterangan | - |

### Status Pengajuan (Cuti & Lembur)

| Status | Kode | Transisi |
|---|---|---|
| ⏳ Pending | `pending` | → Disetujui / Ditolak oleh Admin |
| ✅ Disetujui | `disetujui` | Final (tidak bisa diubah) |
| ❌ Ditolak | `ditolak` | Final + alasan penolakan wajib |

### Status Approval Kehadiran

| Status | Kode | Transisi |
|---|---|---|
| ✅ Approved | `approved` | Absensi valid |
| ⏳ Pending | `pending_approval` | → Approved / Rejected oleh Admin |
| ❌ Rejected | `rejected` | Absensi tidak valid + catatan Admin |

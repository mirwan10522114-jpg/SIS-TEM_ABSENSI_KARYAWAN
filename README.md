# Sistem Absensi Karyawan

Aplikasi absensi karyawan dengan portal karyawan dan admin. Frontend menggunakan React, TypeScript, dan Vite; backend menggunakan Express dan MySQL.

## Fitur

- Login admin dan karyawan menggunakan username, email, atau NIP serta PIN.
- Absensi masuk dan pulang dengan foto, lokasi, dan geofence.
- Riwayat absensi, pengajuan cuti, dan pengajuan lembur.
- Portal admin untuk memantau absensi, mengelola karyawan, menyetujui pengajuan, mengatur geofence, dan membuat pengumuman.

## Persyaratan

- Node.js dan npm
- MySQL (misalnya melalui Laragon)

## Menjalankan secara lokal

1. Instal dependensi:

   ```bash
   npm ci
   ```

2. Buat database baru dengan mengimpor [`database.sql`](database.sql) melalui phpMyAdmin atau klien MySQL. **Impor ini hanya untuk database baru:** skrip menggunakan `DROP TABLE` dan akan menghapus data yang sudah ada pada tabel aplikasi. Skrip membuat 1 akun admin, 5 akun karyawan, pengaturan awal, dan pengumuman. Riwayat absensi, cuti, serta lembur dimulai kosong.

3. Salin [`.env.example`](.env.example) menjadi `.env`, lalu sesuaikan koneksi MySQL jika diperlukan:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=sistem_absensi_karyawan
   DB_PORT=3306
   PORT=5000
   ```

4. Jalankan backend dan frontend:

   ```bash
   npm run dev:all
   ```

5. Buka **http://localhost:3000/**. Jika port 3000 sedang dipakai, jalankan `npm run server` dan `npm run dev -- --port 3001` di dua terminal, lalu buka **http://127.0.0.1:3001/**.

Untuk memeriksa koneksi database, buka `http://localhost:5000/api/health`. Respons yang berhasil adalah `{"status":"ok","database":"connected"}`.

## Akun awal

| Peran | Username / NIP | PIN |
| --- | --- | --- |
| Admin | `admin` | `123456` |
| Karyawan: Budi Pratama | `EMP-2024-001` | `123456` |
| Karyawan: Siti Rahmawati | `EMP-2024-002` | `123456` |
| Karyawan: Dimas Wicaksono | `EMP-2024-003` | `123456` |
| Karyawan: Anisa Kusuma Putri | `EMP-2024-004` | `123456` |
| Karyawan: Reza Fahlevi | `EMP-2024-005` | `123456` |

Akun dan PIN di atas adalah data awal untuk pengembangan. Ganti kredensial bawaan sebelum aplikasi digunakan dengan data sebenarnya.

## Perintah lain

| Perintah | Kegunaan |
| --- | --- |
| `npm run server` | Menjalankan backend di port dari `.env` (default 5000). |
| `npm run dev` | Menjalankan frontend Vite di port 3000. |
| `npm run build` | Membuat build frontend. |
| `npm run lint` | Memeriksa tipe TypeScript. |

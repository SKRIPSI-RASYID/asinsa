# Milestone Perencanaan MVP: Sistem Penentuan Kelayakan Penghapusan Aset (Fuzzy Mamdani)

Sistem ini dirancang untuk membantu Dinas Komunikasi, Informasi, dan Persandian Aceh dalam menentukan apakah suatu aset (seperti perangkat IT, furnitur, dll) sudah layak untuk dihapus berdasarkan logika Fuzzy Mamdani.

## Teknologi Utama
- **Framework**: Next.js (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: React Hooks / TanStack Query (jika diperlukan)

---

## Milestone 1: Arsitektur & Autentikasi (Web Foundation) - Minggu 1
- [ ] **Setup Proyek & Landing Page**
  - Setup Next.js 14+ dengan Shadcn/UI dan Tailwind.
  - Implementasi Landing Page yang modern dan informatif (Hero section, Fitur Utama, Flow Sistem).
- [ ] **Autentikasi & User Management**
  - Desain & Implementasi halaman Login dan Register.
  - Inisialisasi Supabase project dan integrasi client.
  - Konfigurasi Supabase Auth & Middleware (Proteksi Rute Dashboard).
  - Setup tabel `profiles` untuk metadata user.
- [ ] **Layout Dashboard**
  - Desain Layout Dashboard yang modern, sidebar responsif, dan navbar.

## Milestone 2: Sistem Inventaris Aset (Core Web System) - Minggu 2
- [ ] **Dashboard Utama**
  - Ringkasan statistik aset (Total, Kondisi, Nilai) dalam bentuk kartu info.
- [ ] **Modul CRUD Aset**
  - Form input aset dengan validasi (Nama, Kode, Tahun, Harga, Kondisi).
  - Daftar aset dengan fitur pencarian, filter kategori, dan pagination.
- [ ] **Manajemen Referensi**
  - Interface untuk manajemen Kategori dan Lokasi aset.

## Milestone 3: Intelligent Analysis Module (Fuzzy Integration) - Minggu 3
- [ ] **Konfigurasi Parameter Fuzzy**
  - Interface untuk mengatur variabel (Kondisi, Umur, Biaya) dan basis aturan IF-THEN.
- [ ] **Engine Fuzzy Mamdani**
  - Implementasi logika Fuzzifikasi, Inferensi (MIN-MAX), dan Defuzzifikasi (Centroid).
- [ ] **Analisis Kelayakan**
  - Tombol "Proses Analisis" pada detail aset.
  - Panel hasil analisis yang menampilkan skor kelayakan dan status (Layak/Tidak Layak Hapus).

## Milestone 4: Reporting & Visualization (Final System) - Minggu 4
- [ ] **Visualisasi Data**
  - Grafik fungsi keanggotaan menggunakan `recharts` untuk transparansi logika.
- [ ] **Sistem Pelaporan**
  - Fitur Export PDF untuk surat rekomendasi penghapusan aset.
- [ ] **Finishing & Polish**
  - Optimasi UI/UX (Loading states, Toast notifications, Dark mode).
  - Final testing alur kerja sistem secara menyeluruh.

---

## Variabel Fuzzy (Rencana Awal)
1. **Kondisi Aset**: Baik, Rusak Ringan, Rusak Berat.
2. **Umur Ekonomis**: Baru, Sedang, Lama.
3. **Biaya Pemeliharaan**: Rendah, Sedang, Tinggi.
4. **Output (Kelayakan)**: Tidak Layak Hapus, Dipertimbangkan, Layak Hapus.

---

## Catatan Penting untuk Pengembangan
- **Akurasi Aturan**: Konsultasi dengan pihak Dinas Aceh untuk memvalidasi basis aturan (IF Kondisi Baik AND Umur Baru THEN ...).
- **Mobile Friendly**: Interface harus responsif agar bisa digunakan untuk pengecekan aset di lapangan.

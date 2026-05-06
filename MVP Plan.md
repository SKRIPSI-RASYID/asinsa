# Milestone Perencanaan MVP: Sistem Penentuan Kelayakan Penghapusan Aset (Fuzzy Mamdani)

Sistem ini dirancang untuk membantu Dinas Komunikasi, Informasi, dan Persandian Aceh dalam menentukan apakah suatu aset (seperti perangkat IT, furnitur, dll) sudah layak untuk dihapus berdasarkan logika Fuzzy Mamdani.

## Teknologi Utama
- **Framework**: Next.js (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: React Hooks / TanStack Query (jika diperlukan)

---

## Milestone 1: Fondasi & Database (Minggu 1)
- [ ] **Setup Proyek & Supabase**
  - Inisialisasi Supabase project.
  - Konfigurasi environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  - Integrasi `@supabase/supabase-js`.
- [ ] **Perancangan Skema Database**
  - Tabel `assets`: Nama aset, kode barang, tahun perolehan, harga, kategori.
  - Tabel `fuzzy_variables`: Definisi himpunan fuzzy (misal: Kondisi, Umur Ekonomis, Biaya Perawatan).
  - Tabel `fuzzy_rules`: Penyimpanan basis aturan IF-THEN.
  - Tabel `disposal_analysis`: Hasil perhitungan fuzzy dan status kelayakan.
- [ ] **Autentikasi**
  - Login Admin (Staff Aset) menggunakan Supabase Auth.

## Milestone 2: Modul Manajemen Aset (Minggu 2)
- [ ] **CRUD Aset**
  - Form input data aset baru.
  - Dashboard daftar aset dengan filter kondisi.
- [ ] **Data Master Kriteria**
  - Interface untuk mengatur parameter fuzzy (semesta pembicaraan dan titik domain kurva).

## Milestone 3: Engine Fuzzy Mamdani (Minggu 2-3)
- [ ] **Implementasi Logika Fuzzifikasi**
  - Fungsi untuk menghitung derajat keanggotaan (Linear Naik/Turun, Segitiga, Trapesium).
- [ ] **Mesin Inferensi**
  - Implementasi fungsi implikasi (MIN).
  - Mekanisme komposisi aturan (MAX).
- [ ] **Defuzzifikasi (Metode Centroid)**
  - Perhitungan titik pusat untuk menghasilkan nilai krisp kelayakan.
- [ ] **Integrasi Perhitungan**
  - Tombol "Hitung Kelayakan" pada detail aset yang memicu engine fuzzy.

## Milestone 4: Antarmuka Hasil & Visualisasi (Minggu 4)
- [ ] **Visualisasi Kurva Fuzzy**
  - Menampilkan grafik fungsi keanggotaan menggunakan `recharts`.
- [ ] **Dashboard Analisis**
  - Menampilkan daftar aset yang direkomendasikan untuk dihapus.
  - Detail perhitungan (bagaimana angka kelayakan didapat).
- [ ] **Laporan (Export)**
  - Fitur cetak surat rekomendasi penghapusan aset (PDF).

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

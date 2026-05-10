import csv
import os
from supabase import create_client, Client

# Konfigurasi Supabase
# Pastikan Anda mengganti dengan URL dan Key dari project Supabase Anda
# atau gunakan environment variables
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ajmxlafqcozcmsuvnxud.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbXhsYWZxY296Y21zdXZueHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzIzMDMsImV4cCI6MjA5MzY0ODMwM30.mErB7SXc-cWvjkUUxni82F6bRye7QfSMxpzOO7VT4Rg")

# Inisialisasi client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_val(val):
    if val is None or val.strip() == "" or val.upper() == "NULL":
        return None
    return val

def clean_date(val):
    if val is None or val.strip() == "" or val == "0000-00-00":
        return None
    return val

def clean_num(val):
    if val is None or val.strip() == "":
        return 0
    return float(val.replace(",", ""))

def process_csv_and_insert(filepath):
    batch_size = 100
    current_batch = []
    total_inserted = 0

    print(f"Membaca file {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            lokasi_id = row['lokasi']
            # Logika default lokasi yang sama dengan generate_batches
            if not lokasi_id or lokasi_id.strip() == "":
                if row['status_pgn'] == 'DISKOMINSA':
                    lokasi_id = '23.01.01.01'
            if not lokasi_id or lokasi_id.strip() == "":
                lokasi_id = None
            
            # Map ke column Supabase
            record = {
                "kode_barang": clean_val(row['kodebarang']),
                "nama_barang": clean_val(row['namabarang']),
                "register": clean_val(row['register']),
                "spek_nabar": clean_val(row['spek_nabar']),
                "merek": clean_val(row['merek']),
                "lokasi_id": clean_val(lokasi_id),
                "satuan": clean_val(row['satuan']),
                "harga": clean_num(row['harga']),
                "cara_perolehan": clean_val(row['cara_pero']),
                "tgl_perolehan": clean_date(row['tgl_pero']),
                "status_pgn": clean_val(row['status_pgn']),
                "in_ex": clean_val(row['in_ex']),
                "keterangan": clean_val(row['ket']),
                "kelompok": clean_num(row['kelompok']),
                "kondisi": clean_val(row['Kondisi']),
                "tanggal_kondisi": clean_date(row['tanggal_kon']),
                "pemakai": clean_val(row['pemakai']),
                "foto_url": clean_val(row['foto'])
            }
            
            current_batch.append(record)
            
            # Insert per batch untuk menghindari limit payload
            if len(current_batch) >= batch_size:
                try:
                    # Menggunakan upsert agar tidak duplicate jika dijalankan ulang
                    response = supabase.table('master_barang').upsert(current_batch).execute()
                    total_inserted += len(current_batch)
                    print(f"Berhasil memproses {total_inserted} baris...")
                except Exception as e:
                    print(f"Error pada batch ini: {e}")
                
                current_batch = []
                
        # Insert sisa data
        if current_batch:
            try:
                response = supabase.table('master_barang').upsert(current_batch).execute()
                total_inserted += len(current_batch)
                print(f"Berhasil memproses sisa data, total: {total_inserted} baris.")
            except Exception as e:
                print(f"Error pada batch terakhir: {e}")

if __name__ == "__main__":
    file_path = 'd:/SKRIPSI/asinsa/referensi/masterbarang.csv'
    process_csv_and_insert(file_path)
    print("Selesai!")

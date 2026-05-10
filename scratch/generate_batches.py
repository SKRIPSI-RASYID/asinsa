
import csv
import json

# This script will generate batches of SQL INSERT statements
# and I will execute them using the execute_sql tool.

def clean_val(val):
    if val is None or val.strip() == "" or val.upper() == "NULL":
        return "NULL"
    # Escape single quotes
    return "'" + val.replace("'", "''") + "'"

def clean_date(val):
    if val is None or val.strip() == "" or val == "0000-00-00":
        return "NULL"
    return "'" + val + "'"

def clean_num(val):
    if val is None or val.strip() == "":
        return "0"
    return val.replace(",", "")

def process_csv(filepath):
    batches = []
    current_batch = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Map CSV to Table columns
            # "kodebarang","namabarang","register","spek_nabar","merek","lokasi","satuan","harga","cara_pero","tgl_pero","status_pgn","in_ex","ket","kelompok","Kondisi","tanggal_kon","pemakai","foto"
            
            # Use '23.01.01.01' for DISKOMINSA if lokasi is empty
            lokasi_id = row['lokasi']
            if not lokasi_id or lokasi_id.strip() == "":
                if row['status_pgn'] == 'DISKOMINSA':
                    lokasi_id = '23.01.01.01'
            
            # If still empty, check if it's '23' or something
            if not lokasi_id or lokasi_id.strip() == "":
                # Default to null or a known code? 
                # Let's keep it null if we don't know.
                pass

            cols = [
                clean_val(row['kodebarang']),
                clean_val(row['namabarang']),
                clean_val(row['register']),
                clean_val(row['spek_nabar']),
                clean_val(row['merek']),
                clean_val(lokasi_id),
                clean_val(row['satuan']),
                clean_num(row['harga']),
                clean_val(row['cara_pero']),
                clean_date(row['tgl_pero']),
                clean_val(row['status_pgn']),
                clean_val(row['in_ex']),
                clean_val(row['ket']),
                clean_num(row['kelompok']),
                clean_val(row['Kondisi']),
                clean_date(row['tanggal_kon']),
                clean_val(row['pemakai']),
                clean_val(row['foto'])
            ]
            
            current_batch.append("(" + ", ".join(cols) + ")")
            
            if len(current_batch) >= 100:
                batches.append(current_batch)
                current_batch = []
        
        if current_batch:
            batches.append(current_batch)
            
    return batches

filepath = 'd:/SKRIPSI/asinsa/referensi/masterbarang.csv'
batches = process_csv(filepath)

sql_template = "INSERT INTO public.master_barang (kode_barang, nama_barang, register, spek_nabar, merek, lokasi_id, satuan, harga, cara_perolehan, tgl_perolehan, status_pgn, in_ex, keterangan, kelompok, kondisi, tanggal_kondisi, pemakai, foto_url) VALUES\n"

for i, batch in enumerate(batches):
    with open(f'd:/SKRIPSI/asinsa/scratch/master_barang_batch_{i}.sql', 'w', encoding='utf-8') as f:
        f.write(sql_template + ",\n".join(batch) + ";")

print(f"Generated {len(batches)} batches.")

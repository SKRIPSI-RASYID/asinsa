
import re

def parse_sql_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract tb_lokasi data
    lokasi_matches = re.findall(r"INSERT INTO `tb_lokasi` VALUES \((.*?)\);", content)
    lokasi_sql = "INSERT INTO public.lokasi (kode_lokasi, nama_dinas, jumlah_pegawai, jumlah_eselon) VALUES\n"
    lokasi_values = [f"({m})" for m in lokasi_matches]
    lokasi_sql += ",\n".join(lokasi_values).replace("NULL", "null") + ";"

    # Extract tb_barang data
    barang_matches = re.findall(r"INSERT INTO `tb_barang` VALUES \((.*?)\);", content)
    barang_sql = "INSERT INTO public.kategori_barang (kode_kategori, nama_kategori, jumlah_barang, kelompok) VALUES\n"
    barang_values = [f"({m})" for m in barang_matches]
    barang_sql += ",\n".join(barang_values).replace("NULL", "null") + ";"

    return lokasi_sql, barang_sql

lokasi_sql, barang_sql = parse_sql_file('d:/SKRIPSI/asinsa/referensi/aset_inv (1).sql')

with open('d:/SKRIPSI/asinsa/scratch/data_import.sql', 'w', encoding='utf-8') as f:
    f.write(lokasi_sql + "\n\n" + barang_sql)

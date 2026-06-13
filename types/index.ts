export interface Profile {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
}

export interface Category {
  kode_kategori: string;
  nama_kategori: string;
  jumlah_barang?: number;
  created_at?: string;
  // Legacy support
  id?: string;
  name?: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  created_at: string;
}

export interface Asset {
  // Supabase Table: aset
  id_aset?: number;
  kode_aset?: string;
  kode_kategori?: string;
  harga?: number;
  tgl_pero?: string;
  register?: string;
  spek_nabar?: string | null;
  merek?: string | null;
  satuan?: string | null;
  cara_pero?: string | null;
  status_pgn?: string;
  in_ex?: string;
  ket?: string;
  kondisi?: string | null;
  total_perbaikan?: number;
  jumlah_pengeluaran_perbaikan?: number;
  
  // Legacy / UI support
  category_id?: string;
  location_id?: string;
  
  // Relations
  kategori_barang?: Category | null;
  
  // Analysis results
  fuzzy_score?: number;
  fuzzy_status?: 'Layak Hapus' | 'Dilelang' | 'Diperbaiki' | 'Tidak Memerlukan Tindakan';
  last_analyzed_at?: string;

  // UI / Legacy Compatibility
  id: string; // Mapping from id_aset
  name: string; // Mapping from kategori_barang.nama_kategori or merek
  code: string; // Mapping from kode_aset
  purchase_year: number; // Extracted from tgl_pero
  purchase_price: number; // Mapping from harga
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat'; // Mapped from kondisi (B, RR, RB)
  maintenance_cost: number; // Mapping from jumlah_pengeluaran_perbaikan
  biaya_perbaikan?: number; // Alias for UI
  expected_life: number; // Hardcoded or calculated
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  created_at: string;
}

export interface Asset {
  id: string;
  name: string;
  code: string;
  category_id: string;
  location_id: string;
  purchase_year: number;
  purchase_price: number;
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  maintenance_cost: number;
  expected_life: number;
  created_at: string;

  // Analysis results
  fuzzy_score?: number;
  fuzzy_status?: 'Layak Hapus' | 'Dipertimbangkan' | 'Tidak Layak Hapus';
  last_analyzed_at?: string;
}

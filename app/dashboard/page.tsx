"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SectionCards } from "@/components/section-cards"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { PlusIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAssets() {
      const { data, error } = await supabase
        .from('aset')
        .select('*, kategori_barang(nama_kategori)')
        .order('id_aset', { ascending: false })
        .limit(10)

      if (!error && data) {
        const formattedAssets = data.map((item: any) => ({
          id: item.id_aset,
          kode_barang: item.kode_aset,
          register: item.register,
          name: item.kategori_barang?.nama_kategori || "Aset",
          category: item.kategori_barang?.nama_kategori || "Peralatan & Mesin",
          location: "-", // lokasi_id tidak ada di tabel aset, mungkin perlu join jika ada tabel relasi
          purchase_year: item.tgl_pero ? new Date(item.tgl_pero).getFullYear() : null,
          purchase_price: item.harga,
          condition: item.kondisi === 'RR' ? 'Rusak Ringan' : (item.kondisi === 'RB' ? 'Rusak Berat' : 'Baik'),
          total_perbaikan: item.total_perbaikan,
          biaya_perbaikan: item.jumlah_pengeluaran_perbaikan,
        }))
        setAssets(formattedAssets)
      } else {
        setAssets([])
      }
      setLoading(false)
    }

    fetchAssets()
  }, [supabase])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Ringkasan statistik dan daftar aset terbaru.
          </p>
        </div>
        <Link href="/dashboard/assets/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Tambah Aset
          </Button>
        </Link>
      </div>

      <SectionCards />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Aset Terbaru</CardTitle>
          <CardDescription>
            Menampilkan semua aset yang terdaftar dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <DataTable data={assets} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

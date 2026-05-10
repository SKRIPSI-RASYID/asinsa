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
        .from('master_barang')
        .select('*')
        .order('id', { ascending: false }) // Aset terbaru yang dimasukkan
        .limit(10) // Tampilkan 10 aset terbaru di dashboard

      if (!error && data) {
        // Map data master_barang ke format yang diharapkan DataTable
        const formattedAssets = data.map((item: any) => ({
          id: item.id,
          kode_barang: item.kode_barang,
          register: item.register,
          name: item.nama_barang,
          category: "Peralatan & Mesin",
          location: item.lokasi_id,
          purchase_year: item.tgl_perolehan ? new Date(item.tgl_perolehan).getFullYear() : null,
          purchase_price: item.harga,
          condition: item.kondisi === 'RR' ? 'Rusak Ringan' : (item.kondisi === 'RB' ? 'Rusak Berat' : 'Baik'),
          fuzzy_score: null,
          fuzzy_status: "Belum Dianalisis",
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

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
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setAssets(data)
      } else {
        // Fallback mock if error
        setAssets([
          {
            id: "1",
            name: "MacBook Pro 14\" (Mock)",
            code: "AST-2023-001",
            category: "Perangkat IT",
            location: "Ruang IT",
            purchase_year: 2023,
            purchase_price: 35000000,
            condition: "Baik",
            fuzzy_score: 0.15,
            fuzzy_status: "Tidak Layak Hapus",
          }
        ])
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

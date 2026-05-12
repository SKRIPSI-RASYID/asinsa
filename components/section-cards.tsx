"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, Loader2, PackageIcon, MapPinIcon, ListIcon, WrenchIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function SectionCards() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLocations: 0,
    totalCategories: 0,
    totalRepairCost: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch Total Assets
        const { count: assetCount } = await supabase
          .from('aset')
          .select('*', { count: 'exact', head: true })

        // Fetch Total Locations
        const { count: locationCount } = await supabase
          .from('lokasi')
          .select('*', { count: 'exact', head: true })

        // Fetch Total Categories
        const { count: categoryCount } = await supabase
          .from('kategori_barang')
          .select('*', { count: 'exact', head: true })

        // Fetch Total Repair Cost (Sum)
        const { data: repairData } = await supabase
          .from('aset')
          .select('jumlah_pengeluaran_perbaikan')
        
        const totalRepair = repairData?.reduce((acc, curr) => acc + (curr.jumlah_pengeluaran_perbaikan || 0), 0) || 0

        setStats({
          totalAssets: assetCount || 0,
          totalLocations: locationCount || 0,
          totalCategories: categoryCount || 0,
          totalRepairCost: totalRepair,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Total Aset */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Total Aset</CardDescription>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalAssets.toLocaleString("id-ID")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Aset terdaftar di sistem
          </div>
        </CardFooter>
      </Card>

      {/* Total Lokasi */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Total Lokasi</CardDescription>
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalLocations.toLocaleString("id-ID")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Lokasi penempatan aset
          </div>
        </CardFooter>
      </Card>

      {/* Total Kategori */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Total Kategori</CardDescription>
            <ListIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalCategories.toLocaleString("id-ID")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Kategori pengelompokan
          </div>
        </CardFooter>
      </Card>

      {/* Total Biaya Perbaikan */}
      <Card className="@container/card border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Biaya Perbaikan</CardDescription>
            <WrenchIcon className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">
            Rp {stats.totalRepairCost.toLocaleString("id-ID")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-primary">
            Total pemeliharaan aset
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}


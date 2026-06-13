"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  CheckCircle2Icon, 
  AlertTriangleIcon, 
  XCircleIcon, 
  Wrench,
  Loader2,
  CalendarIcon,
  SearchIcon,
  BarChart3Icon,
  PackageIcon
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

export default function BatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const batchId = params.id as string
  
  const [batch, setBatch] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // Fetch batch info
      const { data: batchData, error: batchError } = await supabase
        .from('batch_evaluasi')
        .select('*')
        .eq('id', batchId)
        .single()
      
      if (batchData) {
        setBatch(batchData)
      }

      // Fetch history items
      const { data: itemsData, error: itemsError } = await supabase
        .from('history_evaluasi')
        .select(`
          *,
          aset (
            kode_aset,
            register,
            kategori_barang (nama_kategori)
          )
        `)
        .eq('id_batch', batchId)
      
      if (itemsData) {
        setItems(itemsData)
      }
      
      setLoading(false)
    }

    if (batchId) {
      fetchData()
    }
  }, [batchId])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Exclude "Tidak Memerlukan Tindakan" completely from the list
      if (item.fuzzy_status === "Tidak Memerlukan Tindakan") {
        return false
      }

      const assetName = item.aset?.kategori_barang?.nama_kategori || ""
      const kode = item.aset?.kode_aset || ""
      const reg = item.aset?.register || ""
      
      return assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
             reg.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [items, searchQuery])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat detail batch...</p>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Batch tidak ditemukan</h2>
        <Button variant="link" onClick={() => router.back()}>Kembali</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detail Batch Analisis</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5" />
            {new Date(batch.created_at).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short"
            })}
            <span className="text-muted-foreground/30 mx-1">|</span>
            ID: {batch.id.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Aset</CardDescription>
            <CardTitle className="text-2xl">{batch.total_aset}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '100%' }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600">Layak Hapus</CardDescription>
            <CardTitle className="text-2xl text-green-700">{batch.status_layak_hapus}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${batch.total_aset > 0 ? (batch.status_layak_hapus/batch.total_aset)*100 : 0}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-600">Dilelang</CardDescription>
            <CardTitle className="text-2xl text-yellow-700">{batch.status_dilelang}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500" style={{ width: `${batch.total_aset > 0 ? (batch.status_dilelang/batch.total_aset)*100 : 0}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600">Diperbaiki</CardDescription>
            <CardTitle className="text-2xl text-blue-700">{batch.status_diperbaiki}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${batch.total_aset > 0 ? (batch.status_diperbaiki/batch.total_aset)*100 : 0}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Daftar Hasil Analisis</CardTitle>
              <CardDescription>Hasil evaluasi untuk {items.length} aset dalam batch ini.</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari aset..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Nama Aset</TableHead>
                <TableHead>Parameter Evaluasi</TableHead>
                <TableHead className="text-right">Skor Fuzzy</TableHead>
                <TableHead className="pr-6">Kesimpulan Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Tidak ada data yang cocok.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md">
                          <PackageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{item.aset?.kategori_barang?.nama_kategori || "Aset"}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {item.aset?.kode_aset} | Reg: {item.aset?.register}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div className="flex gap-4">
                          <span className="w-20 text-muted-foreground">Kondisi:</span>
                          <span className="font-medium">{item.kondisi_aset}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="w-20 text-muted-foreground">Umur:</span>
                          <span className="font-medium">{item.umur_aset} Tahun</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="w-20 text-muted-foreground">Perbaikan:</span>
                          <span className="font-medium">{item.total_perbaikan}x Kejadian</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-base pr-10">
                      {item.fuzzy_score.toFixed(2)}
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center gap-2">
                        {item.fuzzy_status === "Layak Hapus" ? (
                          <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                        ) : item.fuzzy_status === "Dilelang" ? (
                          <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
                        ) : item.fuzzy_status === "Diperbaiki" ? (
                          <Wrench className="h-4 w-4 text-blue-500" />
                        ) : (
                          <CheckCircle2Icon className="h-4 w-4 text-teal-500" />
                        )}
                        <Badge 
                          variant={
                            item.fuzzy_status === "Layak Hapus" ? "default" : 
                            item.fuzzy_status === "Dilelang" ? "secondary" : "outline"
                          }
                          className={
                            item.fuzzy_status === "Layak Hapus" ? "bg-green-600 hover:bg-green-700 text-white" : 
                            item.fuzzy_status === "Diperbaiki" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" : 
                            item.fuzzy_status === "Tidak Memerlukan Tindakan" ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800" : ""
                          }
                        >
                          {item.fuzzy_status}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

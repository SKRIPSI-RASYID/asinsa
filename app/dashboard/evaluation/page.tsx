"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ZapIcon, 
  CheckCircle2Icon, 
  AlertTriangleIcon, 
  XCircleIcon, 
  Loader2, 
  PlayIcon,
  RefreshCcwIcon,
  SearchIcon,
  FilterIcon,
  FileTextIcon
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { calculateAssetEligibility } from "@/lib/fuzzy-engine"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import Link from "next/link"

export default function EvaluationPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  const supabase = createClient()

  const fetchAssets = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('aset')
      .select('*, kategori_barang(nama_kategori)')
      .order('id_aset', { ascending: false })

    if (!error && data) {
      const formattedAssets = data.map((item: any) => ({
        ...item,
        id: item.id_aset,
        name: item.kategori_barang?.nama_kategori || "Aset",
        condition: item.kondisi === 'RR' ? 'Rusak Ringan' : (item.kondisi === 'RB' ? 'Rusak Berat' : 'Baik'),
        purchase_year: item.tgl_pero ? new Date(item.tgl_pero).getFullYear() : 0,
        purchase_price: Number(item.harga) || 0,
        maintenance_cost: Number(item.jumlah_pengeluaran_perbaikan) || 0,
        total_repairs: Number(item.total_perbaikan) || 0,
      }))
      setAssets(formattedAssets)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const stats = useMemo(() => {
    const total = assets.length
    const evaluated = assets.filter(a => a.fuzzy_status).length
    const layak = assets.filter(a => a.fuzzy_status === 'Layak Hapus').length
    const dipertimbangkan = assets.filter(a => a.fuzzy_status === 'Dipertimbangkan').length
    const tidakLayak = assets.filter(a => a.fuzzy_status === 'Tidak Layak Hapus').length
    
    return { total, evaluated, layak, dipertimbangkan, tidakLayak, pending: total - evaluated }
  }, [assets])

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        asset.kode_aset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.register.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "pending" && !asset.fuzzy_status) ||
        (asset.fuzzy_status === statusFilter)

      return matchesSearch && matchesStatus
    })
  }, [assets, searchQuery, statusFilter])

  const handleBulkAnalyze = async () => {
    if (assets.length === 0) return
    
    setIsAnalyzing(true)
    setProgress(0)
    
    // Create batch entry first
    const { data: batchData, error: batchError } = await supabase
      .from('batch_evaluasi')
      .insert({ total_aset: assets.length })
      .select()
      .single()

    if (batchError) {
      console.error("Batch creation error:", batchError)
      toast.error("Gagal membuat batch evaluasi")
      setIsAnalyzing(false)
      return
    }

    const batchId = batchData.id
    let completed = 0
    let countLayak = 0
    let countDipertimbangkan = 0
    let countTidakLayak = 0

    const total = assets.length
    const updatedAssets = [...assets]

    // Process in chunks to avoid blocking and update UI
    const chunkSize = 20
    for (let i = 0; i < total; i += chunkSize) {
      const chunk = updatedAssets.slice(i, i + chunkSize)
      
      const results = await Promise.all(chunk.map(async (asset) => {
        // Map scores
        const kondisiScore = asset.condition === "Baik" ? 10 : asset.condition === "Rusak Ringan" ? 50 : 90
        const age = new Date().getFullYear() - asset.purchase_year
        const costPercent = asset.purchase_price > 0 ? (asset.maintenance_cost / asset.purchase_price) * 100 : 0
        const totalRepairs = asset.total_repairs || 0
        
        const result = calculateAssetEligibility(kondisiScore, age, costPercent, totalRepairs)
        
        const { error } = await supabase
          .from('aset')
          .update({
            fuzzy_score: result.score,
            fuzzy_status: result.status,
            last_analyzed_at: new Date().toISOString()
          })
          .eq('id_aset', asset.id_aset)

        if (result.status === "Layak Hapus") countLayak++
        else if (result.status === "Tidak Layak Hapus") countTidakLayak++
        else countDipertimbangkan++

        return { 
          id_aset: asset.id_aset, 
          error,
          update: {
            fuzzy_score: result.score,
            fuzzy_status: result.status,
            last_analyzed_at: new Date().toISOString()
          },
          history: {
            id_aset: asset.id_aset,
            id_batch: batchId,
            fuzzy_score: result.score,
            fuzzy_status: result.status,
            kondisi_aset: asset.condition,
            umur_aset: age,
            biaya_perbaikan: asset.maintenance_cost,
            total_perbaikan: totalRepairs
          }
        }
      }))

      const firstError = results.find(r => r.error)?.error
      if (firstError) {
        console.error("Batch update error:", firstError)
        toast.error(`Gagal menyimpan data: ${firstError.message}`)
        setIsAnalyzing(false)
        return
      }

      // Save to history table
      const historyRecords = results.map(r => r.history)
      const { error: historyError } = await supabase
        .from('history_evaluasi')
        .insert(historyRecords)
      
      if (historyError) {
        console.error("History saving error:", historyError)
      }

      // Update local state for immediate feedback
      results.forEach(r => {
        const index = updatedAssets.findIndex(a => a.id_aset === r.id_aset)
        if (index !== -1) {
          updatedAssets[index] = { ...updatedAssets[index], ...r.update }
        }
      })

      completed += chunk.length
      setProgress(Math.round((completed / total) * 100))
      setAssets([...updatedAssets])
    }

    // Final batch update with counts
    await supabase
      .from('batch_evaluasi')
      .update({
        status_layak: countLayak,
        status_dipertimbangkan: countDipertimbangkan,
        status_tidak_layak: countTidakLayak
      })
      .eq('id', batchId)

    setIsAnalyzing(false)
    toast.success("Analisis masal selesai")
    fetchAssets()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Evaluasi Kelayakan</h2>
          <p className="text-muted-foreground">
            Analisis kelayakan penghapusan aset menggunakan logika Fuzzy Mamdani.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/evaluation/history">
            <Button variant="outline">
              <FileTextIcon className="mr-2 h-4 w-4" /> Riwayat
            </Button>
          </Link>
          <Button variant="outline" onClick={fetchAssets} disabled={loading || isAnalyzing}>
            <RefreshCcwIcon className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={handleBulkAnalyze} disabled={loading || isAnalyzing || assets.length === 0}>
            {isAnalyzing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
            ) : (
              <><ZapIcon className="mr-2 h-4 w-4" /> Jalankan Evaluasi Masal</>
            )}
          </Button>
        </div>
      </div>

      {isAnalyzing && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Progress Evaluasi</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground animate-pulse">
                Sedang menghitung skor fuzzy untuk {assets.length} aset...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-background to-muted/50">
          <CardHeader className="pb-2">
            <CardDescription>Total Aset</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.evaluated} Telah dievaluasi
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-background to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">Layak Hapus</CardDescription>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">{stats.layak}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(stats.layak / stats.total) * 100} className="h-1 bg-green-100 dark:bg-green-900/20" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-yellow-500/5 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-600 dark:text-yellow-400">Dipertimbangkan</CardDescription>
            <CardTitle className="text-2xl text-yellow-600 dark:text-yellow-400">{stats.dipertimbangkan}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(stats.dipertimbangkan / stats.total) * 100} className="h-1 bg-yellow-100 dark:bg-yellow-900/20" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-red-500/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-600 dark:text-red-400">Tidak Layak</CardDescription>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">{stats.tidakLayak}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(stats.tidakLayak / stats.total) * 100} className="h-1 bg-red-100 dark:bg-red-900/20" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Hasil Analisis</CardTitle>
              <CardDescription>Daftar aset beserta hasil perhitungan logika fuzzy.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full md:w-64">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari aset..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border">
                <Button 
                  variant={statusFilter === "all" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setStatusFilter("all")}
                  className="h-8 text-xs"
                >
                  Semua
                </Button>
                <Button 
                  variant={statusFilter === "pending" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setStatusFilter("pending")}
                  className="h-8 text-xs"
                >
                  Belum
                </Button>
                <Button 
                  variant={statusFilter === "Layak Hapus" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setStatusFilter("Layak Hapus")}
                  className="h-8 text-xs"
                >
                  Layak
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Memuat data aset...</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[100px]">Kode</TableHead>
                    <TableHead>Nama Aset</TableHead>
                    <TableHead>Kondisi</TableHead>
                    <TableHead className="text-right">Skor Fuzzy</TableHead>
                    <TableHead>Status Kelayakan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        Tidak ada aset yang ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => (
                      <TableRow key={asset.id_aset}>
                        <TableCell className="font-mono text-xs">{asset.kode_aset}</TableCell>
                        <TableCell>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-xs text-muted-foreground">Reg: {asset.register}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={asset.condition === "Baik" ? "outline" : "destructive"} className="font-normal">
                            {asset.condition}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {asset.fuzzy_score ? asset.fuzzy_score.toFixed(2) : "-"}
                        </TableCell>
                        <TableCell>
                          {asset.fuzzy_status ? (
                            <div className="flex items-center gap-1.5">
                              {asset.fuzzy_status === "Layak Hapus" ? (
                                <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                              ) : asset.fuzzy_status === "Dipertimbangkan" ? (
                                <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`text-xs font-semibold ${
                                asset.fuzzy_status === "Layak Hapus" ? "text-green-600" : 
                                asset.fuzzy_status === "Dipertimbangkan" ? "text-yellow-600" : "text-red-600"
                              }`}>
                                {asset.fuzzy_status}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="font-normal opacity-50 italic">Belum Dianalisis</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/assets/${asset.id_aset}`}>
                            <Button variant="ghost" size="sm">Detail</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {!loading && filteredAssets.length > 0 && (
          <CardFooter className="border-t bg-muted/20 px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Menampilkan {filteredAssets.length} dari {assets.length} aset
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

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
  Wrench,
  Loader2, 
  PlayIcon,
  RefreshCcwIcon,
  SearchIcon,
  FilterIcon,
  FileTextIcon,
  FileDownIcon
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { generateSuratDinas } from "@/lib/pdf-export"

export default function EvaluationPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(0)
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set())
  const PAGE_SIZE = 25
  
  const supabase = createClient()

  const fetchAssets = async () => {
    setLoading(true)
    const BATCH_SIZE = 1000
    let allAssets: any[] = []
    let from = 0
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from('aset')
        .select('*, kategori_barang(nama_kategori)')
        .order('id_aset', { ascending: false })
        .range(from, from + BATCH_SIZE - 1)

      if (error) {
        console.error("Fetch assets error:", error)
        break
      }

      if (data && data.length > 0) {
        const formatted = data.map((item: any) => ({
          ...item,
          id: item.id_aset,
          name: item.kategori_barang?.nama_kategori || "Aset",
          condition: item.kondisi === 'RR' ? 'Rusak Ringan' : (item.kondisi === 'RB' ? 'Rusak Berat' : 'Baik'),
          purchase_year: item.tgl_pero ? new Date(item.tgl_pero).getFullYear() : 0,
          purchase_price: Number(item.harga) || 0,
          maintenance_cost: Number(item.jumlah_pengeluaran_perbaikan) || 0,
          total_repairs: Number(item.total_perbaikan) || 0,
        }))
        allAssets = [...allAssets, ...formatted]
        from += BATCH_SIZE
        hasMore = data.length === BATCH_SIZE
      } else {
        hasMore = false
      }
    }
    
    setAssets(allAssets)
    setLoading(false)
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const stats = useMemo(() => {
    const total = assets.length
    const evaluated = assets.filter(a => a.fuzzy_status).length
    const layak = assets.filter(a => a.fuzzy_status === 'Layak Hapus').length
    const dilelang = assets.filter(a => a.fuzzy_status === 'Dilelang').length
    const diperbaiki = assets.filter(a => a.fuzzy_status === 'Diperbaiki').length
    const tidakAdaTindakan = assets.filter(a => a.fuzzy_status === 'Tidak Memerlukan Tindakan').length
    
    return { total, evaluated, layak, dilelang, diperbaiki, tidakAdaTindakan, pending: total - evaluated }
  }, [assets])

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Exclude "Tidak Memerlukan Tindakan" completely from the list
      if (asset.fuzzy_status === "Tidak Memerlukan Tindakan") {
        return false
      }

      const nameStr = asset.name || ""
      const codeStr = asset.kode_aset || ""
      const regStr = asset.register || ""

      const matchesSearch = 
        nameStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
        codeStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        regStr.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "pending" && !asset.fuzzy_status) ||
        (asset.fuzzy_status === statusFilter)

      return matchesSearch && matchesStatus
    })
  }, [assets, searchQuery, statusFilter])

  const paginatedAssets = useMemo(() => {
    return filteredAssets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  }, [filteredAssets, page])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAssets.length / PAGE_SIZE)
  }, [filteredAssets])

  const toggleSelectAll = () => {
    if (selectedAssetIds.size === paginatedAssets.length) {
      setSelectedAssetIds(new Set())
    } else {
      setSelectedAssetIds(new Set(paginatedAssets.map(a => a.id_aset)))
    }
  }

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedAssetIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedAssetIds(newSelected)
  }

  const handleDownloadBulkPdf = (type: 'Service' | 'Barang' | 'Penghapusan') => {
    const selectedAssets = assets.filter(a => selectedAssetIds.has(a.id_aset))
    if (selectedAssets.length === 0) return
    generateSuratDinas(selectedAssets, type)
    toast.success(`Dokumen PDF ${type} berhasil dibuat`)
  }

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
    let countDilelang = 0
    let countDiperbaiki = 0
    let countTidakAdaTindakan = 0

    const total = assets.length
    const updatedAssets = [...assets]

    // Process in chunks to balance performance and request overhead
    const chunkSize = 50
    for (let i = 0; i < total; i += chunkSize) {
      const chunk = updatedAssets.slice(i, i + chunkSize)
      
      const chunkResults = chunk
        .map(asset => {
          // Map scores
          const kondisiScore = asset.condition === "Baik" ? 10 : asset.condition === "Rusak Ringan" ? 50 : 90
          const age = new Date().getFullYear() - asset.purchase_year
          const costPercent = asset.purchase_price > 0 ? (asset.maintenance_cost / asset.purchase_price) * 100 : 0
          const totalRepairs = asset.total_repairs || 0
          
          const result = calculateAssetEligibility(kondisiScore, age, costPercent, totalRepairs)
          
          // Skip assets that do not fall into any fuzzy output category (out of bounds)
          if (result.status === null || result.score === null) {
            return null
          }
          
          if (result.status === "Layak Hapus") countLayak++
          else if (result.status === "Diperbaiki") countDiperbaiki++
          else if (result.status === "Tidak Memerlukan Tindakan") countTidakAdaTindakan++
          else countDilelang++

          const timestamp = new Date().toISOString()
          
          return {
            id_aset: asset.id_aset,
            update: {
              id_aset: asset.id_aset,
              kode_aset: asset.kode_aset, // Added to satisfy NOT NULL constraint
              fuzzy_score: result.score,
              fuzzy_status: result.status,
              last_analyzed_at: timestamp
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
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)

      // 1. Concurrent Update Assets within Chunk
      const updatePromises = chunkResults.map(async (r) => {
        const { error } = await supabase
          .from('aset')
          .update({
            fuzzy_score: r.update.fuzzy_score,
            fuzzy_status: r.update.fuzzy_status,
            last_analyzed_at: r.update.last_analyzed_at
          })
          .eq('id_aset', r.id_aset)
        return { id_aset: r.id_aset, error }
      })

      const updateResults = await Promise.all(updatePromises)
      const firstError = updateResults.find(r => r.error)?.error
      
      if (firstError) {
        console.error("Asset update error:", firstError)
        toast.error(`Gagal update aset: ${firstError.message}`)
        setIsAnalyzing(false)
        return
      }

      // 2. Bulk Insert History
      const historyRecords = chunkResults.map(r => r.history)
      const { error: historyError } = await supabase
        .from('history_evaluasi')
        .insert(historyRecords)
      
      if (historyError) {
        console.error("Bulk history error:", historyError)
      }

      // 3. Update local state
      chunkResults.forEach(r => {
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
        status_layak_hapus: countLayak,
        status_dilelang: countDilelang,
        status_diperbaiki: countDiperbaiki,
        status_tidak_memerlukan_tindakan: countTidakAdaTindakan
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Progress value={stats.total > 0 ? (stats.layak / stats.total) * 100 : 0} className="h-1 bg-green-100 dark:bg-green-900/20" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-yellow-500/5 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-600 dark:text-yellow-400">Dilelang</CardDescription>
            <CardTitle className="text-2xl text-yellow-600 dark:text-yellow-400">{stats.dilelang}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.total > 0 ? (stats.dilelang / stats.total) * 100 : 0} className="h-1 bg-yellow-100 dark:bg-yellow-900/20" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 dark:text-blue-400">Diperbaiki</CardDescription>
            <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">{stats.diperbaiki}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.total > 0 ? (stats.diperbaiki / stats.total) * 100 : 0} className="h-1 bg-blue-100 dark:bg-blue-900/20" />
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(0)
                  }}
                />
              </div>
              {selectedAssetIds.size > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm" className="h-8">
                      <FileDownIcon className="mr-2 h-4 w-4" /> Cetak Terpilih ({selectedAssetIds.size})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownloadBulkPdf('Service')}>
                      Surat Permintaan Service
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadBulkPdf('Barang')}>
                      Surat Permintaan Barang
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadBulkPdf('Penghapusan')}>
                      Surat Permintaan Penghapusan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-md border">
                <Button 
                  variant={statusFilter === "all" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => {
                    setStatusFilter("all")
                    setPage(0)
                  }}
                  className="h-8 text-[11px]"
                >
                  Semua
                </Button>
                <Button 
                  variant={statusFilter === "pending" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => {
                    setStatusFilter("pending")
                    setPage(0)
                  }}
                  className="h-8 text-[11px]"
                >
                  Belum
                </Button>
                <Button 
                  variant={statusFilter === "Layak Hapus" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => {
                    setStatusFilter("Layak Hapus")
                    setPage(0)
                  }}
                  className="h-8 text-[11px]"
                >
                  Layak Hapus
                </Button>
                <Button 
                  variant={statusFilter === "Dilelang" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => {
                    setStatusFilter("Dilelang")
                    setPage(0)
                  }}
                  className="h-8 text-[11px]"
                >
                  Dilelang
                </Button>
                <Button 
                  variant={statusFilter === "Diperbaiki" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => {
                    setStatusFilter("Diperbaiki")
                    setPage(0)
                  }}
                  className="h-8 text-[11px]"
                >
                  Diperbaiki
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
                    <TableHead className="w-[40px] text-center">
                      <Checkbox 
                        checked={paginatedAssets.length > 0 && selectedAssetIds.size === paginatedAssets.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Pilih semua baris di halaman ini"
                      />
                    </TableHead>
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
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        Tidak ada aset yang ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAssets.map((asset) => (
                      <TableRow key={asset.id_aset} className={selectedAssetIds.has(asset.id_aset) ? "bg-primary/5" : ""}>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={selectedAssetIds.has(asset.id_aset)}
                            onCheckedChange={() => toggleSelectRow(asset.id_aset)}
                            aria-label={`Pilih aset ${asset.kode_aset}`}
                          />
                        </TableCell>
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
                              ) : asset.fuzzy_status === "Dilelang" ? (
                                <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
                              ) : asset.fuzzy_status === "Diperbaiki" ? (
                                <Wrench className="h-4 w-4 text-blue-500" />
                              ) : (
                                <CheckCircle2Icon className="h-4 w-4 text-teal-500" />
                              )}
                              <span className={`text-xs font-semibold ${
                                asset.fuzzy_status === "Layak Hapus" ? "text-green-600" : 
                                asset.fuzzy_status === "Dilelang" ? "text-yellow-600" : 
                                asset.fuzzy_status === "Diperbaiki" ? "text-blue-600" : "text-teal-600"
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
          <CardFooter className="border-t bg-muted/20 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              Menampilkan {Math.min(filteredAssets.length, page * PAGE_SIZE + 1)}-{Math.min(filteredAssets.length, (page + 1) * PAGE_SIZE)} dari {filteredAssets.length} aset
              {filteredAssets.length !== assets.length && ` (difilter dari ${assets.length} total)`}
            </div>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(0, p - 1))} 
                  disabled={page === 0}
                  className="h-8"
                >
                  Sebelumnya
                </Button>
                <span className="text-xs flex items-center px-2 font-medium">
                  Halaman {page + 1} dari {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                  disabled={page >= totalPages - 1}
                  className="h-8"
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

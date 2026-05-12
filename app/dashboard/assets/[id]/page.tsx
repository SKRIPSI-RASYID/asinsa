"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  PlayIcon,
  FileDownIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FuzzyMembershipChart } from "@/components/fuzzy-membership-chart"
import { calculateAssetEligibility } from "@/lib/fuzzy-engine"
import { generateDisposalRecommendation } from "@/lib/pdf-export"
import { toast } from "sonner"
import { Asset } from "@/types"
import { createClient } from "@/lib/supabase/client"

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{score: number, status: string} | null>(null)

  useEffect(() => {
    async function fetchAsset() {
      const { data, error } = await supabase
        .from('aset')
        .select('*, kategori_barang(nama_kategori)')
        .eq('id_aset', params.id)
        .single()

      if (error || !data) {
        // Fallback to mock for demo if not found in real DB
        setAsset({
          id: params.id as string,
          name: "PC Desktop Dell Optiplex (Mock)",
          code: "AST-2018-045",
          category_id: "1",
          location_id: "1",
          purchase_year: 2018,
          purchase_price: 15000000,
          condition: "Rusak Berat",
          maintenance_cost: 5000000,
          expected_life: 5,
          created_at: new Date().toISOString(),
        })
      } else {
        const formattedAsset: Asset = {
          ...data,
          id: String(data.id_aset),
          name: data.merek ? `${data.kategori_barang?.nama_kategori} (${data.merek})` : data.kategori_barang?.nama_kategori || "Aset",
          code: data.kode_aset,
          purchase_year: data.tgl_pero ? new Date(data.tgl_pero).getFullYear() : 0,
          purchase_price: Number(data.harga) || 0,
          condition: data.kondisi === 'RR' ? 'Rusak Ringan' : (data.kondisi === 'RB' ? 'Rusak Berat' : 'Baik'),
          maintenance_cost: Number(data.jumlah_pengeluaran_perbaikan) || 0,
          biaya_perbaikan: Number(data.jumlah_pengeluaran_perbaikan) || 0,
          expected_life: 5,
          created_at: data.created_at || new Date().toISOString(),
        }
        setAsset(formattedAsset)
        if (data.fuzzy_score != null) {
          setAnalysisResult({ score: data.fuzzy_score, status: data.fuzzy_status })
        }
      }
      setLoading(false)
    }

    fetchAsset()
  }, [params.id, supabase])

  const handleAnalyze = async () => {
    if (!asset) return
    setIsAnalyzing(true)

    // Logic for numeric scores:
    // Kondisi: Baik=10, Rusak Ringan=50, Rusak Berat=90
    const kondisiScore = asset.condition === "Baik" ? 10 : asset.condition === "Rusak Ringan" ? 50 : 90

    // Umur: current year - purchase year
    const age = new Date().getFullYear() - asset.purchase_year

    // Biaya: (maintenance / price) * 100 (Default to 0 since maintenance is 0 for now)
    const costPercent = asset.purchase_price > 0 ? (asset.maintenance_cost / asset.purchase_price) * 100 : 0

    setTimeout(async () => {
      const result = calculateAssetEligibility(kondisiScore, age, costPercent)

      // Update in Supabase aset
      const { error } = await supabase
        .from('aset')
        .update({
          fuzzy_score: result.score,
          fuzzy_status: result.status,
          last_analyzed_at: new Date().toISOString()
        })
        .eq('id_aset', asset.id)

      setAnalysisResult(result)
      setIsAnalyzing(false)
      toast.success("Analisis selesai")
    }, 1500)
  }

  const handleExport = () => {
    if (!asset || !analysisResult) return
    generateDisposalRecommendation({
      ...asset,
      fuzzy_score: analysisResult.score,
      fuzzy_status: analysisResult.status as any,
    })
    toast.success("Laporan PDF berhasil dibuat")
  }

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (!asset) return <div>Aset tidak ditemukan</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Detail Aset</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Umum</CardTitle>
              <CardDescription>Detail teknis dan administrasi aset.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1 col-span-2">
                <span className="text-muted-foreground">Nama Aset</span>
                <p className="font-medium">{asset.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Spesifikasi</span>
                <p className="font-medium">{asset.spek_nabar || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Kode Kategori</span>
                <p className="font-mono text-xs text-muted-foreground">{asset.code}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">No. Register</span>
                <p className="font-mono font-semibold">{asset.register}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Tahun Perolehan</span>
                <p className="font-medium">{asset.purchase_year}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Harga Perolehan</span>
                <p className="font-medium">Rp {asset.purchase_price.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Total Perbaikan</span>
                <p className="font-medium">{asset.total_perbaikan || 0} Kali</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Total Biaya Perbaikan</span>
                <p className="font-medium text-primary">Rp {asset.biaya_perbaikan?.toLocaleString("id-ID") || 0}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Kondisi</span>
                <div>
                  <Badge variant={asset.condition === "Baik" ? "default" : "destructive"}>
                    {asset.condition}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fungsi Keanggotaan Output</CardTitle>
              <CardDescription>Visualisasi logika kelayakan penghapusan.</CardDescription>
            </CardHeader>
            <CardContent>
              <FuzzyMembershipChart type="output" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Analisis Kelayakan</CardTitle>
              <CardDescription>Tentukan status penghapusan aset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!analysisResult ? (
                <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing}>
                  {isAnalyzing ? "Memproses..." : <><PlayIcon className="mr-2 h-4 w-4" /> Proses Analisis</>}
                </Button>
              ) : (
                <div className="space-y-4 text-center py-4">
                  <div className="flex justify-center">
                    {analysisResult.status === "Layak Hapus" ? (
                      <CheckCircleIcon className="h-12 w-12 text-green-500" />
                    ) : analysisResult.status === "Dipertimbangkan" ? (
                      <AlertTriangleIcon className="h-12 w-12 text-yellow-500" />
                    ) : (
                      <XCircleIcon className="h-12 w-12 text-red-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{analysisResult.status}</h3>
                    <p className="text-sm text-muted-foreground">Skor Kelayakan: {analysisResult.score.toFixed(2)}</p>
                  </div>
                  <Separator />
                  <Button className="w-full" variant="outline" onClick={handleExport}>
                    <FileDownIcon className="mr-2 h-4 w-4" /> Export PDF
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setAnalysisResult(null)}>
                    Ulangi Analisis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

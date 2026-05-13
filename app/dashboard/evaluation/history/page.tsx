"use client"

import { useState, useEffect } from "react"
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
  Loader2,
  CalendarIcon,
  SearchIcon,
  Trash2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  LayersIcon,
  BarChart3Icon
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
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
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function EvaluationHistoryPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  const supabase = createClient()

  const fetchBatches = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('batch_evaluasi')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBatches(data)
    } else {
      console.error("Fetch batches error:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  const clearHistory = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua riwayat evaluasi?")) return
    
    const { error } = await supabase
      .from('batch_evaluasi')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // delete all

    if (!error) {
      toast.success("Riwayat berhasil dihapus")
      setBatches([])
    } else {
      toast.error("Gagal menghapus riwayat")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Riwayat Evaluasi</h2>
          <p className="text-muted-foreground">
            Log hasil analisis dikelompokkan berdasarkan waktu eksekusi.
          </p>
        </div>
        <div className="ml-auto">
          <Button variant="destructive" size="sm" onClick={clearHistory} disabled={batches.length === 0}>
            <Trash2Icon className="mr-2 h-4 w-4" /> Hapus Semua
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat riwayat...</p>
        </div>
      ) : batches.length === 0 ? (
        <Card className="border-dashed h-64 flex flex-col items-center justify-center text-center p-6">
          <LayersIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <CardTitle className="text-muted-foreground">Belum ada riwayat</CardTitle>
          <CardDescription>
            Jalankan evaluasi masal untuk mulai merekam riwayat analisis.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => (
            <Link key={batch.id} href={`/dashboard/evaluation/history/${batch.id}`}>
              <Card className="overflow-hidden hover:border-primary hover:shadow-md transition-all group mb-4 border-l-4 border-l-primary/30">
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <BarChart3Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg tracking-tight">Batch Analisis #{batch.id.slice(0, 8)}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {new Date(batch.created_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                          })}
                        </div>
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        <div className="flex items-center gap-1 font-mono text-xs">
                          {new Date(batch.created_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:gap-6">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-600/70">Layak</span>
                        <span className="text-sm font-bold text-green-700">{batch.status_layak}</span>
                      </div>
                      <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-600/70">Pertimbang</span>
                        <span className="text-sm font-bold text-yellow-700">{batch.status_dipertimbangkan}</span>
                      </div>
                      <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600/70">Tidak</span>
                        <span className="text-sm font-bold text-red-700">{batch.status_tidak_layak}</span>
                      </div>
                    </div>
                    
                    <div className="hidden md:block h-8 w-px bg-muted" />
                    
                    <div className="flex flex-col md:items-end">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Objek</span>
                      <span className="text-sm font-bold">{batch.total_aset} Aset</span>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <ChevronRightIcon className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

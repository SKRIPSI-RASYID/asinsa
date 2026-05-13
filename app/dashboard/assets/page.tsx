"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Loader2, SearchIcon, PlusIcon, PencilIcon,
  Trash2Icon, ExternalLinkIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Asset, Category } from "@/types"
import { AssetForm } from "@/components/asset-form"

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const supabase = createClient()

  const [assets, setAssets] = useState<Asset[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filtered, setFiltered] = useState<Asset[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 100

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Asset | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ─── Fetch All ────────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setLoading(true)
    const BATCH = 1000
    let allData: any[] = []
    let from = 0
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from("aset")
        .select("*, kategori_barang(nama_kategori)")
        .order("id_aset", { ascending: true })
        .range(from, from + BATCH - 1)

      if (error) { console.error(error); break }
      if (data && data.length > 0) {
        allData = [...allData, ...data]
        from += BATCH
        hasMore = data.length === BATCH
      } else hasMore = false
    }

    setAssets(allData)
    setFiltered(allData)
    setLoading(false)
  }, [supabase])

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from("kategori_barang")
      .select("kode_kategori, nama_kategori")
      .order("kode_kategori")
    if (data) setCategories(data)
  }, [supabase])

  useEffect(() => {
    fetchAssets()
    fetchCategories()
  }, [fetchAssets, fetchCategories])

  // ─── Search/filter ────────────────────────────────────────────────────────
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      assets.filter(
        (a) =>
          (a.kode_aset?.toLowerCase().includes(q) ?? false) ||
          (a.kode_kategori?.toLowerCase().includes(q) ?? false) ||
          (a.register?.toLowerCase().includes(q) ?? false) ||
          (a.merek?.toLowerCase().includes(q) ?? false) ||
          (a.ket?.toLowerCase().includes(q) ?? false) ||
          (a.kategori_barang?.nama_kategori?.toLowerCase().includes(q) ?? false)
      )
    )
    setPage(0)
  }, [search, assets])

  // ─── Sheet helpers ────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null)
    setSheetOpen(true)
  }

  function openEdit(asset: Asset) {
    setEditTarget(asset)
    setSheetOpen(true)
  }

  // ─── Save (Add / Edit) ────────────────────────────────────────────────────
  async function handleSave(values: any) {
    setSaving(true)

    if (editTarget) {
      const { error } = await supabase
        .from("aset")
        .update(values)
        .eq("id_aset", editTarget.id_aset)
      if (error) { toast.error("Gagal memperbarui: " + error.message); setSaving(false); return }
      toast.success("Asset berhasil diperbarui!")
    } else {
      const { error } = await supabase.from("aset").insert([values])
      if (error) { toast.error("Gagal menyimpan: " + error.message); setSaving(false); return }
      toast.success("Asset baru berhasil ditambahkan!")
    }

    setSaving(false)
    setSheetOpen(false)
    fetchAssets()
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase
      .from("aset")
      .delete()
      .eq("id_aset", deleteTarget.id_aset)

    if (error) {
      toast.error("Gagal menghapus: " + error.message)
    } else {
      toast.success(`Asset "${deleteTarget.kode_aset}" berhasil dihapus.`)
      setDeleteTarget(null)
      fetchAssets()
    }
    setDeleting(false)
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const kondisiLabel = (k: string | null | undefined) => {
    if (!k || k === "B") return "Baik"
    if (k === "RR") return "Rusak Ringan"
    if (k === "RB") return "Rusak Berat"
    return k
  }
  const kondisiBadge = (k: string | null | undefined): "default" | "secondary" | "destructive" => {
    if (!k || k === "B") return "default"
    if (k === "RR") return "secondary"
    return "destructive"
  }

  const paginatedData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Asset</h2>
          <p className="text-muted-foreground">
            Seluruh data aset inventaris yang terdaftar dalam sistem.
          </p>
        </div>
        <Button onClick={openAdd}>
          <PlusIcon className="mr-2 h-4 w-4" /> Tambah Asset
        </Button>
      </div>

      {/* Main table card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Semua Asset</CardTitle>
          <CardDescription>
            {loading
              ? "Memuat data..."
              : `Menampilkan ${paginatedData.length} dari ${filtered.length.toLocaleString()} aset${filtered.length !== assets.length ? ` (difilter dari ${assets.length.toLocaleString()} total)` : ""}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari kode, kategori, merek..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Delete confirmation bar */}
          {deleteTarget && (
            <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
              <span>
                Hapus aset <strong>{deleteTarget.kode_aset}</strong>? Tindakan ini tidak dapat dibatalkan.
              </span>
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => setDeleteTarget(null)}>
                  Batal
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ya, Hapus"}
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Asset</TableHead>
                      <TableHead>Kode Kategori</TableHead>
                      <TableHead>Nama Kategori</TableHead>
                      <TableHead>Register</TableHead>
                      <TableHead>Merek</TableHead>
                      <TableHead>Tahun</TableHead>
                      <TableHead className="text-right">Harga (Rp)</TableHead>
                      <TableHead className="text-center">Perbaikan</TableHead>
                      <TableHead className="text-right">Biaya Perbaikan</TableHead>
                      <TableHead>Kondisi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                          Tidak ada aset ditemukan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((asset) => (
                        <TableRow key={asset.id_aset}>
                          <TableCell>
                            <span className="font-mono font-semibold text-xs">{asset.kode_aset}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground">{asset.kode_kategori}</span>
                          </TableCell>
                          <TableCell className="max-w-[160px] truncate font-medium">
                            {asset.kategori_barang?.nama_kategori || "-"}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono">{asset.register}</span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                            {asset.merek || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {asset.tgl_pero ? new Date(asset.tgl_pero).getFullYear() : "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {asset.harga ? Number(asset.harga).toLocaleString("id-ID") : "-"}
                          </TableCell>
                          <TableCell className="text-center text-sm font-mono">
                            {asset.total_perbaikan || 0}x
                          </TableCell>
                          <TableCell className="text-right text-sm font-mono text-primary">
                            {asset.jumlah_pengeluaran_perbaikan ? `Rp ${asset.jumlah_pengeluaran_perbaikan.toLocaleString("id-ID")}` : "Rp 0"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={kondisiBadge(asset.kondisi)}>
                              {kondisiLabel(asset.kondisi)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <span className="sr-only">Buka menu</span>
                                  ···
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <a href={`/dashboard/assets/${asset.id_aset}`}>
                                    <ExternalLinkIcon className="mr-2 h-4 w-4" /> Lihat Detail
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(asset)}>
                                  <PencilIcon className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(asset)}
                                >
                                  <Trash2Icon className="mr-2 h-4 w-4" /> Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    Halaman {page + 1} dari {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                      Sebelumnya
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>


      {/* ─── Add / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
          <div className="flex flex-col h-full">
            <div className="p-8 border-b bg-primary/5">
              <DialogHeader>
                <DialogTitle className="text-3xl font-extrabold flex items-center gap-3">
                  <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                    {editTarget ? <PencilIcon className="h-6 w-6" /> : <PlusIcon className="h-6 w-6" />}
                  </div>
                  {editTarget ? "Perbarui Data Aset" : "Pendaftaran Aset Baru"}
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {editTarget
                    ? `Silakan perbarui rincian informasi untuk aset dengan kode ${editTarget.kode_aset}.`
                    : "Lengkapi seluruh informasi teknis dan administratif untuk menambahkan aset baru ke dalam inventaris."}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 bg-background">
              <AssetForm
                categories={categories}
                initialData={editTarget || undefined}
                onSubmit={handleSave}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

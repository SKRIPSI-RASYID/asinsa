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
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Aset {
  id_aset: number
  kode_aset: string
  kode_kategori: string
  harga: number
  tgl_pero: string
  register: string
  spek_nabar: string | null
  merek: string | null
  satuan: string | null
  cara_pero: string | null
  status_pgn: string
  in_ex: string
  ket: string
  kondisi: string | null
  total_perbaikan?: number
  jumlah_pengeluaran_perbaikan?: number
  kategori_barang?: { nama_kategori: string } | null
}

const emptyForm = {
  kode_aset: "",
  kode_kategori: "",
  harga: "",
  tgl_pero: "",
  register: "",
  spek_nabar: "",
  merek: "",
  satuan: "Unit",
  cara_pero: "Pembelian",
  status_pgn: "DISKOMINSA",
  in_ex: "Intra",
  ket: "",
  kondisi: "B",
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const supabase = createClient()

  const [assets, setAssets] = useState<Aset[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filtered, setFiltered] = useState<Aset[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 100

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Aset | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Aset | null>(null)
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
          a.kode_aset?.toLowerCase().includes(q) ||
          a.kode_kategori?.toLowerCase().includes(q) ||
          a.register?.toLowerCase().includes(q) ||
          a.merek?.toLowerCase().includes(q) ||
          a.ket?.toLowerCase().includes(q) ||
          a.kategori_barang?.nama_kategori?.toLowerCase().includes(q)
      )
    )
    setPage(0)
  }, [search, assets])

  // ─── Sheet helpers ────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null)
    setForm({ ...emptyForm })
    setSheetOpen(true)
  }

  function openEdit(asset: Aset) {
    setEditTarget(asset)
    setForm({
      kode_aset: asset.kode_aset,
      kode_kategori: asset.kode_kategori,
      harga: String(asset.harga),
      tgl_pero: asset.tgl_pero,
      register: asset.register,
      spek_nabar: asset.spek_nabar || "",
      merek: asset.merek || "",
      satuan: asset.satuan || "Unit",
      cara_pero: asset.cara_pero || "Pembelian",
      status_pgn: asset.status_pgn,
      in_ex: asset.in_ex,
      ket: asset.ket,
      kondisi: asset.kondisi || "B",
    })
    setSheetOpen(true)
  }

  function setField(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // ─── Save (Add / Edit) ────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.kode_aset || !form.kode_kategori || !form.tgl_pero || !form.register) {
      toast.error("Isi semua field yang wajib diisi.")
      return
    }
    setSaving(true)

    const payload = {
      kode_aset: form.kode_aset,
      kode_kategori: form.kode_kategori,
      harga: Number(form.harga) || 0,
      tgl_pero: form.tgl_pero,
      register: form.register,
      spek_nabar: form.spek_nabar || null,
      merek: form.merek || null,
      satuan: form.satuan || null,
      cara_pero: form.cara_pero || null,
      status_pgn: form.status_pgn,
      in_ex: form.in_ex,
      ket: form.ket,
      kondisi: form.kondisi || null,
    }

    if (editTarget) {
      const { error } = await supabase
        .from("aset")
        .update(payload)
        .eq("id_aset", editTarget.id_aset)
      if (error) { toast.error("Gagal memperbarui: " + error.message); setSaving(false); return }
      toast.success("Aset berhasil diperbarui!")
    } else {
      const { error } = await supabase.from("aset").insert(payload)
      if (error) { toast.error("Gagal menyimpan: " + error.message); setSaving(false); return }
      toast.success("Aset baru berhasil ditambahkan!")
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
      toast.success(`Aset "${deleteTarget.kode_aset}" berhasil dihapus.`)
      setDeleteTarget(null)
      fetchAssets()
    }
    setDeleting(false)
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const kondisiLabel = (k: string | null) => {
    if (!k || k === "B") return "Baik"
    if (k === "RR") return "Rusak Ringan"
    if (k === "RB") return "Rusak Berat"
    return k
  }
  const kondisiBadge = (k: string | null): "default" | "secondary" | "destructive" => {
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
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Aset</h2>
          <p className="text-muted-foreground">
            Seluruh data aset inventaris yang terdaftar dalam sistem.
          </p>
        </div>
        <Button onClick={openAdd}>
          <PlusIcon className="mr-2 h-4 w-4" /> Tambah Aset
        </Button>
      </div>

      {/* Main table card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Semua Aset</CardTitle>
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
                      <TableHead>Kode Aset</TableHead>
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

      {/* ─── Add / Edit Sheet ─────────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editTarget ? "Edit Aset" : "Tambah Aset Baru"}</SheetTitle>
            <SheetDescription>
              {editTarget
                ? `Perbarui data aset ${editTarget.kode_aset}`
                : "Isi data aset baru. Field bertanda * wajib diisi."}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Kode Aset */}
            <div className="space-y-1">
              <Label>Kode Aset *</Label>
              <Input
                placeholder="contoh: 1.3.2.10.02.04.023.0001"
                value={form.kode_aset}
                onChange={e => setField("kode_aset", e.target.value)}
              />
            </div>

            {/* Kode Kategori */}
            <div className="space-y-1">
              <Label>Kode Kategori *</Label>
              <Select value={form.kode_kategori} onValueChange={v => setField("kode_kategori", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.kode_kategori} value={c.kode_kategori}>
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{c.kode_kategori}</span>
                      {c.nama_kategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Register */}
            <div className="space-y-1">
              <Label>No. Register *</Label>
              <Input
                placeholder="contoh: 0001"
                value={form.register}
                onChange={e => setField("register", e.target.value)}
              />
            </div>

            {/* Merek */}
            <div className="space-y-1">
              <Label>Merek / Spesifikasi</Label>
              <Input
                placeholder="contoh: Dell / Latitude 5490"
                value={form.merek}
                onChange={e => setField("merek", e.target.value)}
              />
            </div>

            {/* Spek Nabar */}
            <div className="space-y-1">
              <Label>Spesifikasi Detail</Label>
              <Input
                placeholder="Spesifikasi teknis barang"
                value={form.spek_nabar}
                onChange={e => setField("spek_nabar", e.target.value)}
              />
            </div>

            {/* Harga */}
            <div className="space-y-1">
              <Label>Harga Perolehan (Rp)</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.harga}
                onChange={e => setField("harga", e.target.value)}
              />
            </div>

            {/* Tanggal Perolehan */}
            <div className="space-y-1">
              <Label>Tanggal Perolehan *</Label>
              <Input
                type="date"
                value={form.tgl_pero}
                onChange={e => setField("tgl_pero", e.target.value)}
              />
            </div>

            {/* Satuan */}
            <div className="space-y-1">
              <Label>Satuan</Label>
              <Select value={form.satuan} onValueChange={v => setField("satuan", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unit">Unit</SelectItem>
                  <SelectItem value="Buah">Buah</SelectItem>
                  <SelectItem value="Set">Set</SelectItem>
                  <SelectItem value="Paket">Paket</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cara Perolehan */}
            <div className="space-y-1">
              <Label>Cara Perolehan</Label>
              <Select value={form.cara_pero} onValueChange={v => setField("cara_pero", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pembelian">Pembelian</SelectItem>
                  <SelectItem value="Hibah">Hibah</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Pengguna */}
            <div className="space-y-1">
              <Label>Status Pengguna</Label>
              <Input
                value={form.status_pgn}
                onChange={e => setField("status_pgn", e.target.value)}
              />
            </div>

            {/* Intra / Extra */}
            <div className="space-y-1">
              <Label>Intra / Extra Komptabel</Label>
              <Select value={form.in_ex} onValueChange={v => setField("in_ex", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Intra">Intra</SelectItem>
                  <SelectItem value="Extra">Extra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Kondisi */}
            <div className="space-y-1">
              <Label>Kondisi</Label>
              <Select value={form.kondisi} onValueChange={v => setField("kondisi", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">Baik</SelectItem>
                  <SelectItem value="RR">Rusak Ringan</SelectItem>
                  <SelectItem value="RB">Rusak Berat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Keterangan */}
            <div className="space-y-1">
              <Label>Keterangan</Label>
              <Input
                placeholder="Keterangan tambahan..."
                value={form.ket}
                onChange={e => setField("ket", e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {saving ? "Menyimpan..." : editTarget ? "Simpan Perubahan" : "Tambah Aset"}
              </Button>
              <Button variant="outline" onClick={() => setSheetOpen(false)}>
                Batal
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

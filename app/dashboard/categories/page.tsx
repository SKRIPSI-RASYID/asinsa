"use client"

import { useState, useEffect } from "react"
import { PlusIcon, SearchIcon, Loader2, TagsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("kategori_barang")
        .select("*")
        .order("kode_kategori", { ascending: true })

      if (!error && data) {
        setCategories(data)
        setFiltered(data)
      }
      setLoading(false)
    }
    fetchCategories()
  }, [supabase])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      categories.filter(
        (c) =>
          c.kode_kategori?.toLowerCase().includes(q) ||
          c.nama_kategori?.toLowerCase().includes(q)
      )
    )
  }, [search, categories])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kategori Barang</h2>
          <p className="text-muted-foreground">
            Daftar klasifikasi dan kode kategori seluruh barang inventaris.
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Kategori</CardTitle>
            <TagsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">klasifikasi barang</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Barang Terdaftar</CardTitle>
            <TagsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, c) => sum + (c.jumlah_barang || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">unit barang</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>
            Semua kategori barang yang tersedia. Total: {filtered.length} kategori ditampilkan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode atau nama kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Kategori</TableHead>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead className="text-right">Jumlah Barang</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        Tidak ada kategori ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((category) => (
                      <TableRow key={category.kode_kategori}>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            {category.kode_kategori}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {category.nama_kategori}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            {(category.jumlah_barang || 0).toLocaleString()} unit
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

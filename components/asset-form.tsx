"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Asset, Category } from "@/types"
import {
  PackageIcon,
  TagIcon,
  HashIcon,
  CalendarIcon,
  BanknoteIcon,
  InfoIcon,
  WrenchIcon,
  ShieldCheckIcon,
  LayersIcon,
  LayoutGridIcon
} from "lucide-react"

const assetSchema = z.object({
  kode_aset: z.string().min(2, "Kode minimal 2 karakter"),
  kode_kategori: z.string().min(1, "Pilih kategori"),
  register: z.string().min(1, "Register wajib diisi"),
  merek: z.string().default(""),
  spek_nabar: z.string().default(""),
  harga: z.number().min(0),
  tgl_pero: z.string().min(1, "Tanggal perolehan wajib diisi"),
  satuan: z.string().min(1, "Satuan wajib diisi"),
  cara_pero: z.string().min(1, "Cara perolehan wajib diisi"),
  status_pgn: z.string().min(1, "Status pengguna wajib diisi"),
  in_ex: z.string().min(1, "Intra/Extra wajib diisi"),
  ket: z.string().default(""),
  kondisi: z.enum(["B", "RR", "RB"]),
  expected_life: z.number().min(1),
})

type AssetFormValues = z.infer<typeof assetSchema>

interface AssetFormProps {
  initialData?: Asset
  categories: Category[]
  onSubmit: (data: AssetFormValues) => void
}

export function AssetForm({ initialData, categories, onSubmit }: AssetFormProps) {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData ? {
      kode_aset: initialData.kode_aset || "",
      kode_kategori: initialData.kode_kategori || "",
      register: initialData.register || "",
      merek: initialData.merek || "",
      spek_nabar: initialData.spek_nabar || "",
      harga: initialData.harga || 0,
      tgl_pero: initialData.tgl_pero || new Date().toISOString().split('T')[0],
      satuan: initialData.satuan || "Unit",
      cara_pero: initialData.cara_pero || "Pembelian",
      status_pgn: initialData.status_pgn || "DISKOMINSA",
      in_ex: initialData.in_ex || "Intra",
      ket: initialData.ket || "",
      kondisi: (initialData.kondisi as any) || "B",
      expected_life: initialData.expected_life || 5,
    } : {
      kode_aset: "",
      kode_kategori: "",
      register: "",
      merek: "",
      spek_nabar: "",
      harga: 0,
      tgl_pero: new Date().toISOString().split('T')[0],
      satuan: "Unit",
      cara_pero: "Pembelian",
      status_pgn: "DISKOMINSA",
      in_ex: "Intra",
      ket: "",
      kondisi: "B",
      expected_life: 5,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex-1 space-y-8 pr-2">
          {/* Section 1: Identitas Dasar */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                <TagIcon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-sm uppercase tracking-wider">Identitas Aset</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kode_aset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <HashIcon className="h-3.5 w-3.5 text-muted-foreground" /> Kode Aset *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="1.3.2.10.02.04.023.0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kode_kategori"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <LayoutGridIcon className="h-3.5 w-3.5 text-muted-foreground" /> Kategori *
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.kode_kategori} value={cat.kode_kategori}>
                              {cat.nama_kategori}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="register"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <LayersIcon className="h-3.5 w-3.5 text-muted-foreground" /> No. Register *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 2: Spesifikasi & Biaya */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="p-1.5 bg-blue-50 rounded-md text-blue-600">
                <PackageIcon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-800">Detail & Spesifikasi</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="merek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merek / Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Dell Latitude" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="spek_nabar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spesifikasi Teknis</FormLabel>
                    <FormControl>
                      <Input placeholder="Core i7, 16GB RAM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="harga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BanknoteIcon className="h-3.5 w-3.5 text-muted-foreground" /> Harga (Rp)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tgl_pero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" /> Tgl Perolehan *
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 3: Status & Legalitas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="p-1.5 bg-green-50 rounded-md text-green-600">
                <ShieldCheckIcon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-green-800">Status & Perolehan</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kondisi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <WrenchIcon className="h-3.5 w-3.5 text-muted-foreground" /> Kondisi
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kondisi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B">Baik</SelectItem>
                          <SelectItem value="RR">Rusak Ringan</SelectItem>
                          <SelectItem value="RB">Rusak Berat</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cara_pero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cara Perolehan</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pembelian">Pembelian</SelectItem>
                          <SelectItem value="Hibah">Hibah</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_life"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Umur Ekonomis (Thn)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="in_ex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intra / Extra</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Intra">Intra</SelectItem>
                          <SelectItem value="Extra">Extra</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="ket"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" /> Keterangan
                </FormLabel>
                <FormControl>
                  <Input placeholder="Informasi tambahan..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-6 mt-8 border-t sticky bottom-0 bg-background pb-2">
          <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20">
            {initialData ? "Simpan Perubahan Aset" : "Daftarkan Aset Baru"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

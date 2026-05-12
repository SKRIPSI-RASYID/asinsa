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

const assetSchema = z.object({
  kode_aset: z.string().min(2, "Kode minimal 2 karakter"),
  kode_kategori: z.string().min(1, "Pilih kategori"),
  register: z.string().min(1, "Register wajib diisi"),
  merek: z.string().optional(),
  spek_nabar: z.string().optional(),
  harga: z.number().min(0),
  tgl_pero: z.string().min(1, "Tanggal perolehan wajib diisi"),
  satuan: z.string().default("Unit"),
  cara_pero: z.string().default("Pembelian"),
  status_pgn: z.string().default("DISKOMINSA"),
  in_ex: z.string().default("Intra"),
  ket: z.string().optional(),
  kondisi: z.enum(["B", "RR", "RB"]),
  expected_life: z.number().min(1).default(5),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="kode_aset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Aset *</FormLabel>
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
                <FormLabel>Kategori *</FormLabel>
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
                <FormLabel>No. Register *</FormLabel>
                <FormControl>
                  <Input placeholder="0001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="merek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Merek</FormLabel>
                <FormControl>
                  <Input placeholder="Dell / Lenovo / Apple" {...field} />
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
                <FormLabel>Spesifikasi</FormLabel>
                <FormControl>
                  <Input placeholder="Core i7, 16GB RAM, 512GB SSD" {...field} />
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
                <FormLabel>Harga Perolehan (Rp)</FormLabel>
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
                <FormLabel>Tanggal Perolehan *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kondisi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kondisi</FormLabel>
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

          <FormField
            control={form.control}
            name="expected_life"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Umur Ekonomis (Tahun)</FormLabel>
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
            name="status_pgn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Pengguna</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ket"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keterangan</FormLabel>
                <FormControl>
                  <Input placeholder="Informasi tambahan..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          {initialData ? "Simpan Perubahan" : "Tambah Aset"}
        </Button>
      </form>
    </Form>
  )
}

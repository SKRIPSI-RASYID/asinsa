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
import { Asset, Category, Location } from "@/types"

const assetSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  code: z.string().min(2, "Kode minimal 2 karakter"),
  category_id: z.string().min(1, "Pilih kategori"),
  location_id: z.string().min(1, "Pilih lokasi"),
  purchase_year: z.number().min(1900).max(new Date().getFullYear()),
  purchase_price: z.number().min(0),
  condition: z.enum(["Baik", "Rusak Ringan", "Rusak Berat"]),
  maintenance_cost: z.number().min(0),
  expected_life: z.number().min(1),
})

type AssetFormValues = z.infer<typeof assetSchema>

interface AssetFormProps {
  initialData?: Asset
  categories: Category[]
  locations: Location[]
  onSubmit: (data: AssetFormValues) => void
}

export function AssetForm({ initialData, categories, locations, onSubmit }: AssetFormProps) {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      code: initialData.code,
      category_id: initialData.category_id,
      location_id: initialData.location_id,
      purchase_year: initialData.purchase_year,
      purchase_price: initialData.purchase_price,
      condition: initialData.condition,
      maintenance_cost: initialData.maintenance_cost,
      expected_life: initialData.expected_life,
    } : {
      name: "",
      code: "",
      category_id: "",
      location_id: "",
      purchase_year: new Date().getFullYear(),
      purchase_price: 0,
      condition: "Baik",
      maintenance_cost: 0,
      expected_life: 5,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Aset</FormLabel>
                <FormControl>
                  <Input placeholder="Laptop MacBook Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Aset</FormLabel>
                <FormControl>
                  <Input placeholder="AST-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokasi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Lokasi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchase_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tahun Perolehan</FormLabel>
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
            name="purchase_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Perolehan</FormLabel>
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
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kondisi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kondisi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Baik">Baik</SelectItem>
                    <SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem>
                    <SelectItem value="Rusak Berat">Rusak Berat</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maintenance_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biaya Pemeliharaan (Tahunan)</FormLabel>
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
        </div>
        <Button type="submit" className="w-full">
          {initialData ? "Simpan Perubahan" : "Tambah Aset"}
        </Button>
      </form>
    </Form>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AssetForm } from "@/components/asset-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Category, Location } from "@/types"

export default function NewAssetPage() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    async function fetchData() {
      const { data: cats } = await supabase
        .from('kategori_barang')
        .select('kode_kategori, nama_kategori')
        .order('nama_kategori')
      
      if (cats) setCategories(cats)
    }
    fetchData()
  }, [supabase])

  const handleSubmit = async (values: any) => {
    const { error } = await supabase.from('aset').insert([values])

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Aset berhasil ditambahkan")
      router.push("/dashboard/assets")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Aset Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetForm
            categories={categories}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  )
}

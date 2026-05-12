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
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    async function fetchData() {
      const { data: cats } = await supabase.from('categories').select('*')
      const { data: locs } = await supabase.from('locations').select('*')

      setCategories(cats || [{ id: '1', name: 'Perangkat IT', created_at: '' }])
      setLocations(locs || [{ id: '1', name: 'Gedung A', created_at: '' }])
    }
    fetchData()
  }, [supabase])

  const handleSubmit = async (values: any) => {
    const { error } = await supabase.from('assets').insert([values])

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Aset berhasil ditambahkan")
      router.push("/dashboard")
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
            locations={locations}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  )
}

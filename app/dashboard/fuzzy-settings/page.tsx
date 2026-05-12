"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function FuzzySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Parameter Fuzzy</h2>
        <p className="text-muted-foreground">
          Konfigurasi variabel input dan fungsi keanggotaan untuk analisis Mamdani.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Variabel: Kondisi Aset</CardTitle>
            <CardDescription>Skor 0 (Terbaik) - 100 (Terburuk)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Baik (Range)</Label>
                <Input defaultValue="0 - 50" />
              </div>
              <div className="space-y-2">
                <Label>Rusak Ringan (Range)</Label>
                <Input defaultValue="30 - 70" />
              </div>
              <div className="space-y-2">
                <Label>Rusak Berat (Range)</Label>
                <Input defaultValue="50 - 100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variabel: Umur Ekonomis</CardTitle>
            <CardDescription>Dalam satuan Tahun (0 - 10+)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Baru</Label>
                <Input defaultValue="0 - 5" />
              </div>
              <div className="space-y-2">
                <Label>Sedang</Label>
                <Input defaultValue="3 - 7" />
              </div>
              <div className="space-y-2">
                <Label>Lama</Label>
                <Input defaultValue="5 - 10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Basis Aturan (IF-THEN)</CardTitle>
            <CardDescription>Logika yang digunakan untuk menentukan hasil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-muted rounded">IF Kondisi <b>Rusak Berat</b> OR (Umur <b>Lama</b> AND Biaya <b>Tinggi</b>) THEN <b>Layak Hapus</b></div>
              <div className="p-2 bg-muted rounded">IF Kondisi <b>Baik</b> AND Umur <b>Baru</b> THEN <b>Tidak Layak Hapus</b></div>
              <div className="p-2 bg-muted rounded">ELSE <b>Dipertimbangkan</b></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>Simpan Konfigurasi</Button>
      </div>
    </div>
  )
}

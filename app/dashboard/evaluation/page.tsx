"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ZapIcon, ConstructionIcon } from "lucide-react"

export default function EvaluationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Evaluasi Kelayakan</h2>
          <p className="text-muted-foreground">
            Lakukan analisis kelayakan hapus aset secara massal dengan metode Fuzzy Mamdani.
          </p>
        </div>
      </div>

      <Alert>
        <ConstructionIcon className="h-4 w-4" />
        <AlertTitle>Modul Dalam Pengembangan</AlertTitle>
        <AlertDescription>
          Modul evaluasi kelayakan masal saat ini sedang dalam tahap pengembangan (Milestone 3). 
          Silakan akses detail masing-masing aset di menu "Manajemen Aset" untuk melihat simulasi hasil fuzzy per aset.
        </AlertDescription>
      </Alert>

      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="h-5 w-5 text-yellow-500" />
            Panel Eksekusi Evaluasi
          </CardTitle>
          <CardDescription>
            Pilih aset atau jalankan evaluasi untuk seluruh data yang belum dianalisis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/5">
            <p className="text-sm text-muted-foreground mb-4">
              Antarmuka untuk melakukan proses fuzzifikasi, inferensi, dan defuzzifikasi secara otomatis akan tersedia di sini.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

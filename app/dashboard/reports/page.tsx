"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { FileTextIcon, DownloadIcon } from "lucide-react"

const mockReports = [
  { id: "1", date: "2024-03-20", title: "Rekomendasi Penghapusan Maret 2024", total_assets: 12, status: "Selesai" },
  { id: "2", date: "2024-02-15", title: "Rekomendasi Penghapusan Februari 2024", total_assets: 8, status: "Selesai" },
  { id: "3", date: "2024-01-10", title: "Rekomendasi Penghapusan Januari 2024", total_assets: 5, status: "Selesai" },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sistem Pelaporan</h2>
        <p className="text-muted-foreground">
          Kelola dan unduh laporan rekomendasi penghapusan aset.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Laporan</CardTitle>
          <CardDescription>
            Daftar laporan yang telah dibuat oleh sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileTextIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{report.title}</h4>
                    <p className="text-xs text-muted-foreground">{report.date} • {report.total_assets} Aset</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

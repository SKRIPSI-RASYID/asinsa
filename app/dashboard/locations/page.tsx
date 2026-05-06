"use client"

import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
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

const mockLocations = [
  { id: "1", name: "Ruang IT", address: "Gedung A, Lt. 2" },
  { id: "2", name: "Bidang Persandian", address: "Gedung B, Lt. 1" },
  { id: "3", name: "Aula Utama", address: "Gedung C, Lt. 1" },
]

export default function LocationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lokasi Aset</h2>
          <p className="text-muted-foreground">
            Kelola lokasi penempatan aset.
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> Tambah Lokasi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Lokasi</CardTitle>
          <CardDescription>
            Semua lokasi penempatan aset yang terdaftar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lokasi</TableHead>
                <TableHead>Alamat/Keterangan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLocations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-destructive">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

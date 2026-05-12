"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EllipsisVerticalIcon, SearchIcon, EyeIcon } from "lucide-react"
import Link from "next/link"

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "kode_barang",
    header: "Kode Kategori",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.original.kode_barang}</span>
    ),
  },
  {
    accessorKey: "register",
    header: "No. Register",
    cell: ({ row }) => (
      <span className="font-mono font-semibold">{row.original.register}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Nama Aset",
  },
  {
    accessorKey: "category",
    header: "Kategori",
  },
  {
    accessorKey: "condition",
    header: "Kondisi",
    cell: ({ row }) => (
      <Badge variant={row.original.condition === "Baik" ? "default" : "destructive"}>
        {row.original.condition}
      </Badge>
    ),
  },
  {
    accessorKey: "total_perbaikan",
    header: "Perbaikan",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.total_perbaikan || 0}x</span>
    ),
  },
  {
    accessorKey: "biaya_perbaikan",
    header: "Biaya Perbaikan",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.biaya_perbaikan ? `Rp ${row.original.biaya_perbaikan.toLocaleString("id-ID")}` : "Rp 0"}
      </span>
    ),
  },
  {
    accessorKey: "fuzzy_status",
    header: "Status Kelayakan",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-semibold">
        {row.original.fuzzy_status || "Belum Dianalisis"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Link href={`/dashboard/assets/${row.original.id}`}>
          <Button variant="ghost" size="icon">
            <EyeIcon className="h-4 w-4" />
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Hapus</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export function DataTable({ data }: { data: any[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari aset..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  )
}

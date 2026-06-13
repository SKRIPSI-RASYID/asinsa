import jsPDF from "jspdf"
import "jspdf-autotable"
import { Asset } from "@/types"

export async function generateDisposalRecommendation(asset: Asset) {
  const doc = new jsPDF() as any

  // Header
  doc.setFontSize(18)
  doc.text("SURAT REKOMENDASI PENGHAPUSAN ASET", 105, 20, { align: "center" })

  doc.setFontSize(12)
  doc.text("Dinas Komunikasi, Informasi, dan Persandian Aceh", 105, 30, { align: "center" })
  doc.line(20, 35, 190, 35)

  // Asset Details
  doc.setFontSize(14)
  doc.text("Informasi Aset", 20, 45)

  doc.autoTable({
    startY: 50,
    head: [["Atribut", "Nilai"]],
    body: [
      ["Nama Aset", asset.name],
      ["Kode Aset", asset.code],
      ["Tahun Perolehan", asset.purchase_year.toString()],
      ["Harga Perolehan", `Rp ${asset.purchase_price.toLocaleString()}`],
      ["Kondisi Terakhir", asset.condition],
    ],
  })

  // Analysis Results
  const finalY = (doc as any).lastAutoTable.finalY || 100
  doc.text("Hasil Analisis Kelayakan", 20, finalY + 15)

  doc.autoTable({
    startY: finalY + 20,
    head: [["Parameter", "Skor/Status"]],
    body: [
      ["Skor Kelayakan (Fuzzy)", asset.fuzzy_score?.toFixed(2) || "N/A"],
      ["Status Kelayakan", asset.fuzzy_status || "N/A"],
      ["Tanggal Analisis", new Date().toLocaleDateString("id-ID")],
    ],
  })

  // Recommendation
  const finalY2 = (doc as any).lastAutoTable.finalY || 150
  doc.setFontSize(12)
  doc.text("Kesimpulan:", 20, finalY2 + 15)

  let recommendationText = ""
  if (asset.fuzzy_status === "Layak Hapus") {
    recommendationText = "Berdasarkan hasil analisis sistem menggunakan logika Fuzzy Mamdani, aset ini dinyatakan LAYAK untuk dihapus dari daftar inventaris karena kondisi dan umur ekonomis yang sudah tidak optimal."
  } else if (asset.fuzzy_status === "Dilelang") {
    recommendationText = "Berdasarkan hasil analisis sistem menggunakan logika Fuzzy Mamdani, aset ini direkomendasikan untuk DILELANG karena umur ekonomis telah habis namun masih memiliki nilai jual/kondisi yang cukup baik."
  } else if (asset.fuzzy_status === "Diperbaiki") {
    recommendationText = "Berdasarkan hasil analisis sistem menggunakan logika Fuzzy Mamdani, aset ini direkomendasikan untuk DIPERBAIKI karena masih dalam umur ekonomis produktif dengan kerusakan ringan."
  } else {
    recommendationText = "Berdasarkan hasil analisis sistem menggunakan logika Fuzzy Mamdani, aset ini dinyatakan NORMAL dan tidak memerlukan tindakan khusus karena kondisi masih baik dan tidak ada masalah signifikan."
  }

  const splitText = doc.splitTextToSize(recommendationText, 170)
  doc.text(splitText, 20, finalY2 + 25)

  // Signatures
  doc.text("Banda Aceh, " + new Date().toLocaleDateString("id-ID"), 140, finalY2 + 60)
  doc.text("Kepala Bidang,", 140, finalY2 + 70)
  doc.text("(...........................)", 140, finalY2 + 100)

  // Save the PDF
  doc.save(`Rekomendasi_Penghapusan_${asset.code}.pdf`)
}

export async function generateSuratDinas(assets: Asset[], type: 'Service' | 'Barang' | 'Penghapusan') {
  const doc = new jsPDF() as any

  // Title
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  const title = `SURAT PERMINTAAN ${type.toUpperCase()}`
  doc.text(title, 105, 20, { align: "center" })
  
  // NOMOR:
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text("NOMOR : ...................................", 105, 26, { align: "center" })

  // Metadata headers
  doc.text("Unit Kerja", 20, 40)
  doc.text(": Dinas Komunikasi, Informatika dan Persandian Aceh", 45, 40)
  
  if (type === 'Service' || type === 'Penghapusan') {
    doc.text("Bidang", 20, 46)
    doc.text(": Layanan E-Government", 45, 46)
    doc.text("Seksi", 20, 52)
    doc.text(": Pengembangan Aplikasi", 45, 52)
  } else {
    doc.text("Bagian", 20, 46)
    doc.text(": Sekretariat", 45, 46)
    doc.text("Subbag", 20, 52)
    doc.text(": Hukum, Kepegawaian dan Umum", 45, 52)
  }
  
  doc.text("Tanggal", 20, 58)
  const today = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(`: ${today}`, 45, 58)

  // Table
  const tableData = assets.map((asset, index) => {
    let keterangan = ""
    if (type === 'Service') {
      keterangan = asset.condition === "Rusak Berat" ? "Perlu perbaikan berat" : (asset.condition === "Rusak Ringan" ? "Perlu perbaikan ringan" : "")
    } else if (type === 'Penghapusan') {
      keterangan = asset.fuzzy_status || ""
    }

    return [
      index + 1,
      asset.name,
      asset.merek || "-",
      "1",
      keterangan
    ]
  })

  doc.autoTable({
    startY: 65,
    head: [["NOMOR", "NAMA BARANG", "MERK / TYPE", "JUMLAH\nBARANG", "KETERANGAN"]],
    body: tableData,
    theme: 'plain',
    headStyles: {
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 25 },
    }
  })

  const finalY = (doc as any).lastAutoTable.finalY || 100

  // Signatures
  if (type === 'Service' || type === 'Penghapusan') {
    doc.text("Mengetahui,", 140, finalY + 20, { align: "center" })
    doc.text("Analis Kebijakan Ahli Muda", 140, finalY + 26, { align: "center" })
    
    doc.setFont("helvetica", "bold")
    doc.text("Yudi Kasmara, S.Kom, M.Cs", 140, finalY + 50, { align: "center" })
    doc.setFont("helvetica", "normal")
    doc.text("Pembina", 140, finalY + 55, { align: "center" })
    doc.text("NIP. 19720616 199803 1 005", 140, finalY + 60, { align: "center" })

    doc.text("TO. Suem", 30, finalY + 20)
    doc.text("Acc", 30, finalY + 30)
  } else {
    doc.text("Yang mengajukan permintaan,", 140, finalY + 20, { align: "center" })
    
    doc.setFont("helvetica", "bold")
    doc.text("SAIFUDDIN, ST, MT", 140, finalY + 50, { align: "center" })
    doc.setFont("helvetica", "normal")
    doc.text("NIP. 19770623 200701 1 001", 140, finalY + 55, { align: "center" })

    doc.text("ACC", 50, finalY + 20, { align: "center" })
  }

  doc.save(`Surat_Permintaan_${type}_${today.replace(/ /g, '_')}.pdf`)
}


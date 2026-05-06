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
  } else if (asset.fuzzy_status === "Dipertimbangkan") {
    recommendationText = "Berdasarkan hasil analisis sistem, status aset ini perlu DIPERTIMBANGKAN lebih lanjut oleh tim teknis sebelum melakukan penghapusan."
  } else {
    recommendationText = "Aset dinyatakan TIDAK LAYAK hapus. Aset masih dalam kondisi produktif dan disarankan untuk tetap digunakan atau dilakukan pemeliharaan rutin."
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

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, ShieldCheck, BarChart3, Trash2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">ASINSA</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Fitur
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#flow">
            Alur
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Daftar</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50 dark:bg-slate-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Sistem Penentuan Kelayakan Penghapusan Aset
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Optimalkan pengelolaan aset negara dengan analisis cerdas menggunakan Logika Fuzzy Mamdani.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg" className="px-8">
                    Mulai Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="px-8">
                    Pelajari Lebih Lanjut
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Fitur Utama</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Solusi lengkap untuk manajemen dan analisis penghapusan aset.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Analisis Fuzzy</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Menggunakan metode Mamdani untuk menentukan skor kelayakan penghapusan secara akurat.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 p-3 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Manajemen Inventaris</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Kelola data aset, kategori, dan lokasi dengan mudah dalam satu dashboard terpusat.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Trash2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Rekomendasi Penghapusan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dapatkan laporan rekomendasi penghapusan aset yang siap cetak untuk keperluan administrasi.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="flow" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Alur Sistem</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Input Data", desc: "Masukkan informasi aset seperti umur, kondisi, dan biaya pemeliharaan." },
                { step: "2", title: "Proses Fuzzy", desc: "Sistem melakukan fuzzifikasi, inferensi aturan, dan defuzzifikasi." },
                { step: "3", title: "Hasil Analisis", desc: "Lihat skor kelayakan dan status akhir aset (Layak/Tidak Layak)." },
                { step: "4", title: "Laporan", desc: "Unduh surat rekomendasi penghapusan aset dalam format PDF." },
              ].map((item, i) => (
                <div key={i} className="relative flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold z-10">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 Dinas Komunikasi, Informasi, dan Persandian Aceh. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

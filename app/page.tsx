import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, ShieldCheck, BarChart3, Trash2 } from "lucide-react"
import RetroGrid from "@/components/magicui/retro-grid"
import ShinyButton from "@/components/magicui/shiny-button"
import WordPullUp from "@/components/magicui/word-pull-up"
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid"
import Meteors from "@/components/magicui/meteors"
import Marquee from "@/components/magicui/marquee"

export default function LandingPage() {
  const features = [
    {
      Icon: BarChart3,
      name: "Analisis Fuzzy",
      description: "Menggunakan metode Mamdani untuk menentukan skor kelayakan penghapusan secara akurat.",
      href: "/register",
      cta: "Coba Sekarang",
      className: "col-span-3 lg:col-span-1",
      background: <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />,
    },
    {
      Icon: CheckCircle2,
      name: "Manajemen Inventaris",
      description: "Kelola data aset, kategori, dan lokasi dengan mudah dalam satu dashboard terpusat.",
      href: "/register",
      cta: "Pelajari",
      className: "col-span-3 lg:col-span-1",
      background: <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />,
    },
    {
      Icon: Trash2,
      name: "Rekomendasi Penghapusan",
      description: "Dapatkan laporan rekomendasi penghapusan aset yang siap cetak untuk keperluan administrasi.",
      href: "/register",
      cta: "Cetak Laporan",
      className: "col-span-3 lg:col-span-1",
      background: <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />,
    },
  ];

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center group" href="#">
          <ShieldCheck className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
          <span className="ml-2 text-xl font-bold tracking-tighter">ASINSA</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Fitur
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#flow">
            Alur
          </Link>
          <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
          <Link href="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Daftar</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative">
        {/* Background Effects */}
        <RetroGrid className="opacity-30" />
        <Meteors number={30} />
        
        <section className="relative w-full py-20 md:py-32 lg:py-48 flex items-center justify-center">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-4xl">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-background/50 backdrop-blur-sm mb-4">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                  Sistem Analisis Aset Berbasis AI
                </div>
                
                <WordPullUp 
                  words="Sistem Penentuan Kelayakan Penghapusan Aset" 
                  className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
                />
                
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl font-light">
                  Optimalkan pengelolaan aset negara dengan analisis cerdas menggunakan <span className="text-foreground font-medium">Logika Fuzzy Mamdani</span>.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <ShinyButton className="w-full sm:w-auto">
                    Mulai Sekarang <ArrowRight className="inline-block ml-2 h-4 w-4" />
                  </ShinyButton>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="px-8 rounded-lg backdrop-blur-sm bg-background/30 transition-all hover:bg-background/50">
                    Pelajari Fitur
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="relative w-full py-20 md:py-32 border-t bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Fitur Utama</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Solusi lengkap untuk manajemen dan analisis penghapusan aset secara transparan dan akurat.
                </p>
              </div>
            </div>
            
            <BentoGrid className="lg:grid-cols-3">
              {features.map((feature, idx) => (
                <BentoCard key={idx} {...feature} />
              ))}
            </BentoGrid>
          </div>
        </section>

        <section className="py-12 border-t overflow-hidden bg-background">
          <div className="container px-4 md:px-6 mb-8">
            <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Teknologi yang Digunakan
            </p>
          </div>
          <Marquee pauseOnHover className="[--duration:20s]">
            {["Next.js", "React", "Tailwind CSS", "Supabase", "Framer Motion", "Lucide React", "TypeScript", "MagicUI"].map((tech, i) => (
              <div key={i} className="flex items-center justify-center px-8 py-4 rounded-xl border bg-card/50 backdrop-blur-sm mx-2">
                <span className="text-xl font-bold tracking-tight text-muted-foreground hover:text-foreground transition-colors cursor-default">
                  {tech}
                </span>
              </div>
            ))}
          </Marquee>
        </section>

        <section id="flow" className="relative w-full py-20 md:py-32 border-t">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-16">Alur Kerja Sistem</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent z-0" />
              
              {[
                { step: "1", title: "Input Data", desc: "Masukkan informasi aset seperti umur, kondisi, dan biaya pemeliharaan." },
                { step: "2", title: "Proses Fuzzy", desc: "Sistem melakukan fuzzifikasi, inferensi aturan, dan defuzzifikasi." },
                { step: "3", title: "Hasil Analisis", desc: "Lihat skor kelayakan dan status akhir aset (Layak/Tidak Layak)." },
                { step: "4", title: "Laporan", desc: "Unduh surat rekomendasi penghapusan aset dalam format PDF." },
              ].map((item, i) => (
                <div key={i} className="relative flex flex-col items-center text-center space-y-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold z-10 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3">
                    {item.step}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative w-full py-20 border-t bg-primary text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-8">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Siap Mengoptimalkan Pengelolaan Aset?</h2>
              <p className="max-w-[600px] text-primary-foreground/80 md:text-xl">
                Bergabunglah sekarang dan rasakan kemudahan dalam pengambilan keputusan penghapusan aset.
              </p>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-12 rounded-full font-bold hover:scale-105 transition-transform">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t backdrop-blur-sm bg-background/50">
        <p className="text-xs text-muted-foreground">
          © 2024 Dinas Komunikasi, Informasi, dan Persandian Aceh. Developed for Research Excellence.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:text-primary transition-colors" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:text-primary transition-colors" href="#">
            Privacy Policy
          </Link>
          <Link className="text-xs hover:text-primary transition-colors" href="#">
            Support
          </Link>
        </nav>
      </footer>
    </div>
  )
}


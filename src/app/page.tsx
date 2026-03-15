import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-8 md:p-12 font-sans">
      
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mb-12 mt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Visualisasi <span className="text-blue-600">Struktur Data</span>
        </h1>
        <p className="text-base md:text-lg text-slate-600 leading-relaxed">
          Belajar struktur data nggak perlu pusing baca kode abstrak. Mari bongkar dan lihat langsung apa yang terjadi di dalam memori komputermu secara interaktif!
        </p>
      </div>

      {/* GRID DAFTAR MODUL */}
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl">
        
        {/* Card Modul 1: High Level */}
        <Link href="/array/high-level" className="group">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
            <div className="text-4xl mb-4">🚂</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Array: High-Level View</h2>
            <p className="text-slate-500 mb-6 flex-grow leading-relaxed">
              Pahami konsep dasar array, indeks, dan kecepatan akses memori lewat simulasi gerbong kereta. Cocok banget buat pemula!
            </p>
            <div className="text-blue-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Mulai Belajar <span>→</span>
            </div>
          </div>
        </Link>

        {/* Card Modul 2: Low Level */}
        <Link href="/array/low-level" className="group">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-rose-300 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
            <div className="text-4xl mb-4">🧠</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-rose-600 transition-colors">Array: Memory Dive</h2>
            <p className="text-slate-500 mb-6 flex-grow leading-relaxed">
              Step-by-step melihat bagaimana RAM komputer mengalokasikan memori secara <i>contiguous</i> dan bagaimana <i>pointer</i> bekerja di low-level.
            </p>
            <div className="text-rose-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Bongkar Memori <span>→</span>
            </div>
          </div>
        </Link>

        {/* Card Modul 3: Python */}
        <Link href="/python" className="group">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
            <div className="text-4xl mb-4">🐍</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-amber-500 transition-colors">Array: Python List</h2>
            <p className="text-slate-500 mb-6 flex-grow leading-relaxed">
              Misteri di balik List Python. Cari tahu bagaimana sebuah array statis bisa berubah wujud menjadi <i>Dynamic Array</i> (bisa memanjang otomatis).
            </p>
            <div className="text-amber-500 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Pelajari List <span>→</span>
            </div>
          </div>
        </Link>

        {/* Card Modul 4: Array Algorithms (YANG BARU KITA BUAT) */}
        <Link href="/array-algo" className="group">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-bl-lg border-b border-l border-emerald-200 uppercase tracking-wider">
              Baru
            </div>
            <div className="text-4xl mb-4">🕹️</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">Array Algo Playground</h2>
            <p className="text-slate-500 mb-6 flex-grow leading-relaxed">
              Visualisasi animasi interaktif! Mainkan operasi Insert, Delete, Search, dan Traversal step-by-step dan pahami <i>Time Complexity</i>-nya.
            </p>
            <div className="text-emerald-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Masuk Lab DSA <span>→</span>
            </div>
          </div>
        </Link>

      </div>
    </main>
  );
}
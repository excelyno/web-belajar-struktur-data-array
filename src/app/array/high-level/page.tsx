import Kereta from "@/components/game/Kereta";
import ControlPanel from "@/components/game/ControlPanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-8 flex flex-col items-center font-sans">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
          Struktur Data: <span className="text-blue-600">Array</span>
        </h1>
        <p className="text-slate-500 font-medium">Fase 1: Kereta Memori Berurutan 🚂</p>
      </div>

      {/* Arena Game */}
      <div className="w-full max-w-5xl p-6 bg-white rounded-3xl shadow-md border border-slate-200 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Render Komponen di sini */}
        <Kereta />
        <ControlPanel />

      </div>
    </main>
  );
}
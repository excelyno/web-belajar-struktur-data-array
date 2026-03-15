"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RAMGrid, { toHex } from "@/components/game/RAMGrid";
import { useRAMStore } from "@/store/useRAMStore";

export default function LowLevelGame() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [inputSize, setInputSize] = useState<number>(4);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [targetData, setTargetData] = useState<string>("X");
  const [newResize, setNewResize] = useState<number>(8); // State baru untuk Step 4

const { 
    alokasiArray, dealokasiArray, tulisKeMemory, setHighlight, setErrorMessage, resizeArray, // <-- Tambahkan resizeArray
    isAllocated, baseAddress, errorMessage, arraySize 
  } = useRAMStore();

  useEffect(() => {
    // Laser pointer menyala di step 2 dan 3
    if ((step === 2 || step === 3) && baseAddress !== null) {
      setHighlight(baseAddress + targetIndex);
    } else {
      setHighlight(null);
    }
  }, [targetIndex, baseAddress, step, setHighlight]);

  // Bersihkan error saat pindah step
  useEffect(() => {
    setErrorMessage(null);
  }, [step, setErrorMessage]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleCreateArray = () => alokasiArray(inputSize);
  const handleResetAllocation = () => dealokasiArray();

  const handleWriteMemory = () => {
    if (baseAddress === null) return;
    const targetAddress = baseAddress + targetIndex;
    const isCrash = tulisKeMemory(targetAddress, targetData);
    
    // Kalau nabrak/crash, getarkan layar (efek opsional)
    if (isCrash) {
      document.body.classList.add('animate-shake');
      setTimeout(() => document.body.classList.remove('animate-shake'), 500);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-mono">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors">← Kembali ke Menu</Link>
        <div className="font-bold text-lg text-emerald-400">Memory Dive: Step {step} of {totalSteps}</div>
        <div className="w-40 text-right text-xs text-slate-500">Root Access Granted</div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Layar Kiri */}
        <div className="w-full md:w-1/3 border-r border-slate-800 p-8 flex flex-col bg-slate-900 shadow-xl z-10 overflow-y-auto">
          <h2 className="text-2xl font-bold text-emerald-400 mb-6 border-b border-slate-700 pb-4">
            {step === 1 && "1. Alokasi Memori"}
            {step === 2 && "2. Pointer Offset O(1)"}
            {step === 3 && "3. Out of Bounds (Hack!)"}
            {step === 4 && "4. Resizing Array"}
          </h2>
          
          <div className="flex-grow text-slate-300 leading-relaxed space-y-4 text-sm">
            
            {/* ====== STEP 1 ====== */}
            {step === 1 && (
              <div className="space-y-6">
                <p>OS membutuhkan instruksi untuk mengalokasikan memori. Masukkan ukuran array yang ingin kamu buat.</p>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono shadow-inner">
                  <div className="flex items-center gap-2 mb-4 text-emerald-500 flex-wrap">
                    <span>&gt;</span><span className="text-blue-400">let</span><span className="text-white">arr</span> = <span className="text-blue-400">new</span><span className="text-yellow-200">Array</span>(
                    <input type="number" min="1" max="64" disabled={isAllocated} value={inputSize} onChange={(e) => setInputSize(Number(e.target.value))} className="w-12 bg-slate-900 text-emerald-400 border border-slate-700 rounded px-1 outline-none text-center disabled:opacity-50" />
                    );
                  </div>
                  {!isAllocated ? (
                    <button onClick={handleCreateArray} className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/50 rounded transition-all active:scale-95">
                      ⚡ Compile & Run
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-emerald-400 text-xs p-2 bg-emerald-900/30 border border-emerald-800 rounded">
                        ✓ Success: {arraySize} blocks allocated at {toHex(baseAddress!)}
                      </div>
                      <button onClick={handleResetAllocation} className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded text-xs">🗑️ Free Memory</button>
                    </div>
                  )}
                  {errorMessage && !isAllocated && (
                    <div className="mt-3 text-rose-400 text-xs p-2 bg-rose-950/50 border border-rose-900 rounded animate-pulse">⚠ {errorMessage}</div>
                  )}
                </div>
              </div>
            )}

            {/* ====== STEP 2 ====== */}
            {step === 2 && (
              <div className="space-y-6">
                <p>Memori bersebelahan memungkinkan komputer pakai rumus matematika pointer.</p>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm shadow-inner">
                  <div className="text-emerald-500/70 mb-3 text-xs border-b border-slate-800 pb-2">BASE_ADDRESS + INDEX = TARGET</div>
                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded mb-2">
                    <span className="text-slate-400">Target Index:</span>
                    <input type="number" min="0" max={Math.max(0, arraySize - 1)} value={targetIndex} onChange={(e) => setTargetIndex(Number(e.target.value))} className="w-16 bg-slate-950 border border-slate-700 rounded px-2 text-blue-400 text-center font-bold" />
                  </div>
                  <div className="flex justify-between items-center p-2 border-t border-slate-800">
                    <span className="text-yellow-400 font-bold">Target RAM:</span>
                    <span className="text-yellow-400 text-xl font-bold animate-pulse">{baseAddress !== null ? toHex(baseAddress + targetIndex) : '???'}</span>
                  </div>
                </div>
                
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono mt-4">
                  <div className="flex items-center gap-2 mb-4 text-emerald-500">
                    &gt; arr[<span className="text-blue-400">{targetIndex}</span>] = "<input type="text" maxLength={1} value={targetData} onChange={(e) => setTargetData(e.target.value.toUpperCase())} className="w-6 bg-slate-900 text-yellow-300 border border-slate-700 text-center" />";
                  </div>
                  <button onClick={handleWriteMemory} className="w-full py-2 bg-blue-600/20 text-blue-400 border border-blue-500/50 rounded font-bold">💾 Write Data</button>
                </div>
              </div>
            )}


           {/* ====== STEP 3 ====== */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <p className="mb-2">Apa yang terjadi jika kamu memaksa mengisi indeks yang melebih batas array (misal kapasitas 4, tapi kamu isi indeks ke-15)?</p>
                  <p>Inilah kelemahan memori <strong>Contiguous</strong>. Rumus pointer akan terus berjalan secara buta (<em>Out of Bounds</em>) dan menimpa memori aplikasi lain! Ini disebut <strong>Buffer Overflow</strong>.</p>
                </div>
                
                <ul className="text-xs space-y-2 bg-slate-950 p-3 rounded border border-slate-800 text-slate-400">
                  <li><strong className="text-amber-400">Nabrak App:</strong> Aplikasi (misal Discord) akan membaca data yang salah dan langsung <strong>Force Close / Crash</strong>.</li>
                  <li><strong className="text-red-400">Nabrak OS:</strong> Sistem Inti hancur. Komputer mengalami <strong>Blue Screen (BSOD)</strong>.</li>
                  <li><strong className="text-purple-400">Hacker:</strong> Menggunakan celah ini untuk menyuntikkan virus/malware ke dalam aplikasi yang sedang berjalan.</li>
                </ul>

                <p className="text-rose-400 font-bold border-l-4 border-rose-500 pl-3 bg-rose-950/30 py-2">
                  Tugas: Masukkan Index besar (misal 12, 20, atau mundur ke negatif) sampai Laser Pointer menyorot aplikasi lain, lalu tekan Inject!
                </p>
                
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm shadow-inner">
                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded mb-2">
                    <span className="text-slate-400">Target Index (HACK):</span>
                    <input type="number" value={targetIndex} onChange={(e) => setTargetIndex(Number(e.target.value))} className="w-16 bg-slate-950 border border-rose-700 rounded px-2 text-rose-400 text-center font-bold outline-none focus:border-rose-500" />
                  </div>
                  <div className="flex justify-between items-center p-2 border-t border-slate-800">
                    <span className="text-yellow-400 font-bold">Target RAM:</span>
                    <span className="text-yellow-400 text-xl font-bold animate-pulse">{baseAddress !== null ? toHex(baseAddress + targetIndex) : '???'}</span>
                  </div>
                </div>
                
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono mt-4">
                  <div className="flex items-center gap-2 mb-4 text-emerald-500">
                    &gt; arr[<span className="text-rose-400">{targetIndex}</span>] = "<input type="text" maxLength={1} value="💥" readOnly className="w-6 bg-slate-900 text-rose-500 border border-slate-700 text-center" />";
                  </div>
                  <button onClick={handleWriteMemory} className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/50 rounded font-bold transition-all active:scale-95">
                    ☠️ Inject Payload (Buffer Overflow)
                  </button>
                  
                  {errorMessage && (
                    <div className="mt-4 text-white text-xs p-3 bg-rose-950/80 border border-rose-500 rounded shadow-[0_0_15px_rgba(225,29,72,0.6)] font-bold leading-relaxed">
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ====== STEP 4 ====== */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <p className="mb-2">Array kita penuh dan mentok tetangga! Apa yang terjadi saat kita pakai <code>array.push()</code> di JavaScript?</p>
                  <p>Sistem akan melakukan <strong>Dynamic Resizing</strong> di belakang layar:</p>
                </div>
                
                <ol className="list-decimal list-inside text-xs space-y-2 bg-slate-950 p-3 rounded border border-slate-800 text-slate-400">
                  <li>Cari lahan kosong <strong>baru</strong> yang lebih besar.</li>
                  <li>Sewa memori baru tersebut (<em>Allocation</em>).</li>
                  <li className="text-amber-400 font-bold">Copy-paste data lama satu per satu ke lahan baru (Ini butuh waktu <code className="text-emerald-400 font-bold">O(n)</code>!).</li>
                  <li>Hancurkan lahan memori lama (<em>Deallocation</em>).</li>
                </ol>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm shadow-inner mt-4">
                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded mb-4">
                    <span className="text-slate-400">Ukuran Baru (Resize):</span>
                    <input 
                      type="number" min={arraySize + 1} max="64" 
                      value={newResize} 
                      onChange={(e) => setNewResize(Number(e.target.value))} 
                      className="w-16 bg-slate-950 border border-blue-700 rounded px-2 text-blue-400 text-center font-bold outline-none" 
                    />
                  </div>
                  
                  <button 
                    onClick={() => resizeArray(newResize)} 
                    className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/50 rounded font-bold transition-all active:scale-95 flex justify-center items-center gap-2"
                  >
                    🔄 Reallocate & Copy Data O(n)
                  </button>

                  {errorMessage && (
                    <div className={`mt-4 text-xs p-3 border rounded font-bold leading-relaxed ${errorMessage.includes('SUKSES') ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' : 'bg-rose-950/80 border-rose-500 text-rose-400'}`}>
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={prevStep} disabled={step === 1} className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg font-bold text-sm">&lt; Mundur</button>
            <button onClick={nextStep} disabled={step === totalSteps || (step === 1 && !isAllocated)} className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 rounded-lg font-bold text-sm text-slate-950">Lanjut Step &gt;</button>
          </div>
        </div>

        {/* Layar Kanan (Tidak perlu diubah, pakai RAMGrid yang sama) */}
        <div className="w-full md:w-2/3 bg-slate-950 p-8 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
          <RAMGrid step={step} />
        </div>
      </div>
    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useArrayAlgoStore } from "@/store/useArrayAlgoStore";
import { main } from "framer-motion/client";

// --- KUMPULAN SNIPPET KODE ---
const ALGO_CODES: Record<string, string[]> = {
  'None': [
    "# Pilih operasi di panel kontrol",
    "# untuk melihat eksekusi algoritma."
  ],
  'Traversal': [
    "def traverse(arr):",
    "    for i in range(len(arr)):",
    "        print(arr[i])",
    "    return"
  ],
  'Linear Search': [
    "def linear_search(arr, target):",
    "    for i in range(len(arr)):",
    "        if arr[i] == target:",
    "            return i",
    "    return -1"
  ], 
  'Insertion': [
    "def insert(arr, index, value):",
    "    arr.append(None) # Alokasi slot ujung",
    "    for i in range(len(arr)-1, index, -1):",
    "        arr[i] = arr[i-1] # Geser ke kanan",
    "    arr[index] = value # Sisipkan",
    "    return"
  ],
  'Deletion': [
    "def delete(arr, index):",
    "    arr[index] = None # Hapus elemen",
    "    for i in range(index + 1, len(arr)):",
    "        arr[i-1] = arr[i] # Geser ke kiri",
    "    arr.pop() # Buang slot kosong terakhir",
    "    return"
  ],
  'Access': [
    "def access(arr, index):",
    "    return arr[index] # Alamat dihitung secara matematis"
  ],
  'Update': [
    "def update(arr, index, new_value):",
    "    arr[index] = new_value # Timpa nilai secara instan",
    "    return"
  ],
  'Append': [
    "def append(arr, value):",
    "    arr.append(value)",
    "    return"
  ],
};

export default function ArrayAlgoPage() {
  const store = useArrayAlgoStore();
  
  // Local state untuk input form
  const [searchValue, setSearchValue] = useState("40");
  const [insertIndex, setInsertIndex] = useState("2");
  const [insertValue, setInsertValue] = useState("99");
  const [deleteIndex, setDeleteIndex] = useState("1");
  const [accessIndex, setAccessIndex] = useState("2");
  const [updateIndex, setUpdateIndex] = useState("2");
  const [updateValue, setUpdateValue] = useState("999");
  const [appendValue, setAppendValue] = useState('10');

  // Pointer ke frame yang sedang aktif
  const currentFrame = store.frames[store.currentFrameIndex] || null;
  const displayArray = currentFrame ? currentFrame.arraySnapshot : store.baseArray;
  const codeLines = ALGO_CODES[store.currentAlgo] || ALGO_CODES['None'];

  // --- ENGINE ANIMASI (AUTO-PLAY) ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (store.isPlaying && store.currentFrameIndex < store.frames.length - 1) {
      interval = setInterval(() => {
        store.nextFrame();
      }, store.speedMs);
    } else if (store.currentFrameIndex >= store.frames.length - 1 && store.isPlaying) {
      store.pause(); // Auto-stop kalau udah sampai ujung frame
    }
    return () => clearInterval(interval);
  }, [store.isPlaying, store.currentFrameIndex, store.frames.length, store.speedMs, store]);


  // --- HANDLER TOMBOL ---
  const handleRunTraversal = () => {
    store.generateTraversal();
    setTimeout(() => store.play(), 100); // Jeda dikit biar state kerender dulu
  };

  // HANDLER INSERT
  const handleRunInsert = () => {
    store.generateInsertion(Number(insertIndex), Number(insertValue));
    setTimeout(() => store.play(), 100);
  };

  // HANDLER DELETE
  const handleRunDelete = () => {
    store.generateDeletion(Number(deleteIndex));
    setTimeout(() => store.play(), 100);
  };

  // HANDLER ACCESS
  const handleRunAccess = () => {
    store.generateAccess(Number(accessIndex));
    setTimeout(() => store.play(), 100);
  };

  // HANDLER UPDATE
  const handleRunUpdate = () => {
    store.generateUpdate(Number(updateIndex), Number(updateValue));
    setTimeout(() => store.play(), 100);
  };

    // HANDLER APPEND
    const handleRunAppend = () => {
        if (appendValue === '') return;
        store.generateAppend(Number(appendValue));
        setTimeout(() => store.play(), 100);
        setAppendValue(''); // Opsional: kosongkan input setelah diklik
    };
    // HANDLER SEARCH
  const handleRunSearch = () => {
    store.generateLinearSearch(Number(searchValue));
    setTimeout(() => store.play(), 10);
  };

  // --- HELPER UNTUK WARNA KOTAK ARRAY ---
  const getBoxColor = (index: number) => {
    if (!currentFrame) return "bg-[#161B22] border-slate-700 text-emerald-400"; // Default
    
    const isHighlighted = currentFrame.highlightIndices.includes(index);
    if (!isHighlighted) return "bg-[#161B22] border-slate-700 text-emerald-400 opacity-50";

    switch (currentFrame.status) {
      case 'comparing': return "bg-yellow-900/40 border-yellow-500 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.2)]"; // Kuning (Sedang dicek)
      case 'found': 
      case 'success': return "bg-emerald-900/40 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-110"; // Hijau (Berhasil/Ketemu)
      case 'error': return "bg-rose-900/40 border-rose-500 text-rose-300"; // Merah (Gagal/Bukan target)
      default: return "bg-blue-900/40 border-blue-500 text-blue-300 scale-105"; // Biru (Akses biasa)
    }
  };

  return (
    <main className="min-h-screen bg-[#0E1117] text-slate-300 flex flex-col font-mono selection:bg-blue-900 selection:text-blue-100">
      
      {/* HEADER */}
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0B0D12] z-20">
        <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">← Kembali ke Menu</Link>
        <div className="font-semibold text-slate-300 tracking-wide text-sm flex items-center gap-3">
          <span>Array Algorithms Playground</span>
          <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-[10px] rounded border border-blue-900/50">DSA Mode</span>
        </div>
      </header>

      {/* SPLIT SCREEN CONTAINER */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        
        {/* ================= PANEL KIRI: VISUALIZER PANGGUNG (50%) ================= */}
        <div className="w-full lg:w-1/2 border-r border-slate-800 relative bg-gradient-to-b from-[#0B0D12] to-[#0E1117] flex flex-col items-center justify-center p-8 overflow-hidden">
          
          <div className="absolute top-6 left-6 flex gap-4 text-xs text-slate-500">
            <div className="bg-[#161B22] px-3 py-1.5 rounded border border-slate-800">Length: <span className="text-blue-400">{displayArray.length}</span></div>
            <div className="bg-[#161B22] px-3 py-1.5 rounded border border-slate-800">Index Range: <span className="text-blue-400">0 - {displayArray.length - 1}</span></div>
          </div>

          {/* THE ARRAY BOXES */}
          <div className="flex items-end gap-3 md:gap-4 relative h-40">
            {displayArray.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-4 relative">
                
                {/* Kotak Memori */}
                <div className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-lg md:text-xl font-bold rounded transition-all duration-300 transform 
                  ${val === null 
                    ? 'bg-[#050608] border-2 border-slate-700 border-dashed text-slate-600 shadow-inner' 
                    : `border-2 ${getBoxColor(idx)}`
                  }`}>
                  {val === null ? '∅' : val}
                </div>
                
                {/* Indeks di bawah kotak */}
                <div className="text-slate-600 text-[10px] md:text-xs">[{idx}]</div>

                {/* Panah Pointer (Muncul kalau ditunjuk oleh store) */}
                {currentFrame && Object.entries(currentFrame.pointers).map(([ptrName, ptrIndex]) => (
                  ptrIndex === idx && (
                    <div key={ptrName} className="absolute -bottom-10 flex flex-col items-center animate-bounce text-blue-400">
                      <span className="text-lg">↑</span>
                      <span className="text-[10px] bg-blue-900/30 px-1.5 rounded border border-blue-800 mt-1">{ptrName}</span>
                    </div>
                  )
                ))}
              </div>
            ))}
          </div>

        </div>


        {/* ================= PANEL KANAN: LOGIKA & KONTROL (50%) ================= */}
        <div className="w-full lg:w-1/2 flex flex-col bg-[#0B0D12]">
          
          {/* PANEL KANAN ATAS: TERMINAL KODE (50% dari Kanan) */}
          <div className="h-1/2 flex flex-col border-b border-slate-800">
            <div className="bg-[#161B22] px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">🐍 script.py - <span className="text-blue-400">{store.currentAlgo}</span></span>
            </div>
            
            {/* Code Editor Area */}
            <div className="flex-grow p-4 bg-[#0B0D12] overflow-y-auto text-sm leading-relaxed">
              {codeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isActive = currentFrame?.activeLine === lineNum;
                return (
                  <div key={lineNum} className={`flex px-2 py-0.5 rounded transition-colors duration-200 ${isActive ? 'bg-blue-900/40 border-l-2 border-blue-500 text-blue-200' : 'text-slate-400 border-l-2 border-transparent'}`}>
                    <span className="w-8 text-slate-600 select-none">{lineNum}</span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                );
              })}
            </div>

            {/* Console Output (Log Message) */}
            <div className="h-20 bg-[#050608] border-t border-slate-800 p-3 text-xs flex flex-col justify-end">
              <div className="text-slate-600 mb-1">&gt; Console Output</div>
              <div className={`font-medium ${currentFrame?.status === 'error' ? 'text-rose-400' : currentFrame?.status === 'success' || currentFrame?.status === 'found' ? 'text-emerald-400' : 'text-slate-300'}`}>
                {currentFrame?.logMessage || "Menunggu instruksi..."}
              </div>
            </div>
          </div>


          {/* PANEL KANAN BAWAH: KONTROL (50% dari Kanan) */}
          <div className="h-1/2 p-6 flex flex-col gap-6 bg-[#0E1117] overflow-y-auto">
            
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-slate-200">Operation Panel</h2>
              
              {/* BIG-O BADGE */}
              {store.currentAlgo !== 'None' && (
                <div className={`px-4 py-2 rounded border flex flex-col items-center justify-center transform transition-all shadow-lg ${store.complexity === 'O(1)' ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-400' : 'bg-yellow-900/20 border-yellow-900/50 text-yellow-400'}`}>
                  <span className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Time Complexity</span>
                  <span className="text-xl font-bold">{store.complexity}</span>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* Card Access */}
              <div className="bg-[#161B22] p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                <div className="text-sm text-slate-300 mb-2 font-semibold">
                  Access <span className="italic font-serif text-slate-400">O(1)</span>
                </div>
                <div className="flex gap-2">
                  <input type="number" value={accessIndex} onChange={(e) => setAccessIndex(e.target.value)} className="w-12 bg-[#0B0D12] border border-slate-700 rounded text-center text-xs text-blue-400 outline-none focus:border-blue-500" title="Index" placeholder="Idx" />
                  <button onClick={handleRunAccess} className="flex-1 py-1.5 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 text-xs rounded border border-blue-900/30 transition-colors">
                    Read
                  </button>
                </div>
              </div>

              {/* Card Update */}
              <div className="bg-[#161B22] p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                <div className="text-sm text-slate-300 mb-2 font-semibold">Update <span className="italic font-serif text-slate-400">O(1)</span></div>
                <div className="flex gap-2">
                  <input type="number" value={updateIndex} onChange={(e) => setUpdateIndex(e.target.value)} className="w-8 bg-[#0B0D12] border border-slate-700 rounded text-center text-xs text-yellow-400 outline-none focus:border-yellow-500" title="Index" placeholder="Idx" />
                  <input type="number" value={updateValue} onChange={(e) => setUpdateValue(e.target.value)} className="w-10 bg-[#0B0D12] border border-slate-700 rounded text-center text-xs text-emerald-400 outline-none focus:border-emerald-500" title="New Value" placeholder="Val" />
                  <button onClick={handleRunUpdate} className="flex-1 py-1.5 bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-400 text-xs rounded border border-yellow-900/30 transition-colors">
                    Write
                  </button>
                </div>
              </div>

              {/* Card Traversal */}
              <div className="bg-[#161B22] p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                <div className="text-sm text-slate-300 mb-2 font-semibold">Traversal <span className="italic font-serif text-slate-400">O(N)</span></div>
                <button onClick={handleRunTraversal} className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-colors">
                  Run Traversal
                </button>
              </div>

              {/* Card Linear Search */}
              <div className="bg-[#161B22] p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                <div className="text-sm text-slate-300 mb-2 font-semibold">Search <span className="italic font-serif text-slate-400">O(N)</span></div>
                <div className="flex gap-2">
                  <input type="number" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="w-12 bg-[#0B0D12] border border-slate-700 rounded text-center text-xs text-emerald-400 outline-none focus:border-emerald-500" placeholder="Val" />
                  <button onClick={handleRunSearch} className="flex-1 py-1.5 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 text-xs rounded border border-emerald-900/30 transition-colors">
                    Search
                  </button>
                </div>
              </div>

              {/* Card Insertion */}
              <div className="bg-[#161B22] p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                <div className="text-sm text-slate-300 mb-2 font-semibold">Insertion <span className="italic font-serif text-slate-400">O(N)</span></div>
                <div className="flex gap-2">
                  <input type="number" value={insertIndex} onChange={(e) => setInsertIndex(e.target.value)} className="w-8 bg-[#0B0D12] border border-slate-700 rounded text-center text-xs text-purple-400 outline-none focus:border-purple-500" title="Index" placeholder="Idx" />
                  <input type="number" value={insertValue} onChange={(e) => setInsertValue(e.target.value)} className="w-10 bg-[#0B0D12] border border-slate-700 rounded text-center text-xs text-emerald-400 outline-none focus:border-emerald-500" title="Value" placeholder="Val" />
                  <button onClick={handleRunInsert} className="flex-1 py-1.5 bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 text-xs rounded border border-purple-900/30 transition-colors">
                    Insert
                  </button>
                </div>
              </div>

              {/* Card Deletion */}
              <div className="bg-[#161B22] p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                <div className="text-sm text-slate-300 mb-2 font-semibold">Deletion <span className="italic font-serif text-slate-400">O(N)</span></div>
                <div className="flex gap-2">
                  <input type="number" value={deleteIndex} onChange={(e) => setDeleteIndex(e.target.value)} className="w-10 bg-[#0B0D12] border border-slate-700 rounded text-center text-xs text-rose-400 outline-none focus:border-rose-500" title="Index" placeholder="Idx" />
                  <button onClick={handleRunDelete} className="flex-1 py-1.5 bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 text-xs rounded border border-rose-900/30 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
            
            {/* Card Append */}
              <div className="bg-[#161B22] p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                <div className="text-sm text-slate-300 mb-2 font-semibold">Append <span className="italic font-serif text-slate-400">O(1)</span></div>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={appendValue} 
                    onChange={(e) => setAppendValue(e.target.value)} 
                    className="w-10 bg-[#0B0D12] border border-slate-700 rounded text-center text-xs text-cyan-400 outline-none focus:border-cyan-500" 
                    title="Value" 
                    placeholder="Val" 
                  />
                  <button 
                    onClick={handleRunAppend} 
                    className="flex-1 py-1.5 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-400 text-xs rounded border border-cyan-900/30 transition-colors"
                  >
                    Append
                  </button>
                </div>
              </div>

            {/* PLAYBACK CONTROLS */}
            <div className="mt-auto bg-[#161B22] p-3 rounded border border-slate-800 flex items-center justify-between">
              
              {/* Progress text */}
              <div className="text-xs text-slate-500 w-24">
                Step: {store.frames.length > 0 ? store.currentFrameIndex + 1 : 0} / {store.frames.length}
              </div>

              {/* Media Buttons */}
              <div className="flex items-center gap-2">
                <button onClick={store.prevFrame} disabled={store.currentFrameIndex === 0 || store.frames.length === 0} className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
                  ⏪
                </button>
                <button onClick={store.isPlaying ? store.pause : store.play} disabled={store.frames.length === 0} className="w-10 h-10 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white transition-colors">
                  {store.isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={store.nextFrame} disabled={store.currentFrameIndex === store.frames.length - 1 || store.frames.length === 0} className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
                  ⏩
                </button>
              </div>

              {/* Speed Control */}
              <select value={store.speedMs} onChange={(e) => store.setSpeed(Number(e.target.value))} className="bg-[#0B0D12] text-xs text-slate-400 border border-slate-700 rounded px-2 py-1 outline-none">
                <option value={1500}>0.5x (Slow)</option>
                <option value={800}>1x (Normal)</option>
                <option value={400}>2x (Fast)</option>
              </select>
            </div>

          </div>
        </div>
      </div>
    </main>
  );        
}
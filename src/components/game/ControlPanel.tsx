"use client";

import { useState } from "react";
import { useArrayStore } from "@/store/useArrayStore";

export default function ControlPanel() {
  const { isiGerbong, sisipGerbong, hapusGerbong, resetArray, gerbongs } = useArrayStore();
  const [pilihHewan, setPilihHewan] = useState("🐶");
  const [targetIndex, setTargetIndex] = useState(0);

  return (
    <div className="mt-8 flex flex-col gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full max-w-3xl">
      <h3 className="font-bold text-lg text-slate-700 text-center mb-2">Panel Operasi Array</h3>
      
      <div className="flex gap-4 justify-center items-end flex-wrap">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-500 mb-1">Pilih Data:</label>
          <select value={pilihHewan} onChange={(e) => setPilihHewan(e.target.value)} className="border-2 border-slate-300 p-2 rounded-lg text-2xl bg-slate-50 focus:border-blue-500 outline-none">
            <option value="🐶">🐶 Anjing</option>
            <option value="🐱">🐱 Kucing</option>
            <option value="🦊">🦊 Rubah</option>
            <option value="🐼">🐼 Panda</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-500 mb-1">Target Indeks:</label>
          <input type="number" min="0" max={Math.max(0, gerbongs.length)} value={targetIndex} onChange={(e) => setTargetIndex(Number(e.target.value))} className="border-2 border-slate-300 p-2 rounded-lg text-xl w-24 text-center font-bold bg-slate-50 focus:border-blue-500 outline-none" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button onClick={() => isiGerbong(targetIndex, pilihHewan)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 text-sm">
            Timpa O(1)
          </button>
          <button onClick={() => sisipGerbong(targetIndex, pilihHewan)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 text-sm">
            Sisipkan O(n)
          </button>
          <button onClick={() => hapusGerbong(targetIndex)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95 text-sm">
            Hapus O(n)
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-4 border-t pt-4">
        <button onClick={resetArray} className="text-slate-500 text-sm font-semibold hover:underline">Reset Semua Gerbong</button>
      </div>
    </div>
  );
}
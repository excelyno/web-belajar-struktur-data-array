"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRAMStore } from "@/store/useRAMStore";

export const toHex = (num: number) => `0x${num.toString(16).padStart(2, '0').toUpperCase()}`;

export default function RAMGrid({ step }: { step: number }) {
  const { memory, inisialisasiMemory, highlightedAddress } = useRAMStore();

  useEffect(() => {
    if (step === 1) {
      inisialisasiMemory();
    }
  }, [step, inisialisasiMemory]);

  const getBlockColor = (status: string, isHighlighted: boolean) => {
    // Laser pointer glow effect super terang!
    if (isHighlighted) {
      return 'bg-yellow-400 border-yellow-200 text-slate-900 shadow-[0_0_30px_rgba(250,204,21,1)] z-50 scale-110 font-extrabold';
    }

    switch (status) {
      case 'os': return 'bg-red-950 border-red-800 text-red-500';
      case 'app': return 'bg-amber-950 border-amber-800 text-amber-500 text-xs';
      case 'array': return 'bg-emerald-900 border-emerald-400 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.2)] z-10';
      case 'error': return 'bg-rose-600 border-rose-400 text-white animate-pulse z-20';
      default: return 'bg-slate-900 border-slate-800 text-slate-700'; 
    }
  };

  return (
    <div className="w-full max-w-2xl bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-emerald-500 font-bold font-mono tracking-widest text-sm md:text-base">RAM_ALLOCATION_TABLE</h3>
        <div className="flex gap-3 text-[10px] font-mono uppercase tracking-wider">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-950 border border-red-800"></div> System</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-950 border border-amber-800"></div> App</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-900 border border-slate-800"></div> Free</span>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1.5 md:gap-2">
        {memory.map((block) => {
          const isHighlighted = block.address === highlightedAddress;

          return (
            <motion.div
              key={block.address}
              layout
              className={`relative aspect-square border rounded flex flex-col items-center justify-center transition-all duration-300 ${getBlockColor(block.status, isHighlighted)}`}
            >
              <span className={`absolute top-0.5 left-1 text-[0.55rem] font-mono ${isHighlighted ? 'opacity-100 text-slate-800 font-bold' : 'opacity-60'}`}>
                {toHex(block.address)}
              </span>
              
              <span className="font-bold text-sm md:text-lg z-10 font-mono">
                {block.value || (block.status === 'array' && !isHighlighted ? '' : block.label?.charAt(0))}
              </span>
              
              {block.label && block.status === 'array' && !block.value && (
                <span className={`text-[0.5rem] md:text-[0.6rem] absolute bottom-1 font-mono font-bold ${isHighlighted ? 'text-slate-800' : 'text-emerald-300 opacity-90'}`}>
                  {block.label}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
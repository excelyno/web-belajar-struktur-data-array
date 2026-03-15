"use client";

import { motion } from "framer-motion";

interface GerbongProps {
  index: number;
  isi: string | null;
}

export default function Gerbong({ index, isi }: GerbongProps) {
  return (
    // 'layout' bikin elemen otomatis geser (sliding) kalau ada elemen lain yg nyelip/ilang
    <motion.div 
      layout 
      initial={{ opacity: 0, y: -50, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex flex-col items-center mx-2 shrink-0"
    >
      {/* Kotak Gerbong */}
      <div className="w-24 h-24 bg-blue-100 border-4 border-blue-500 rounded-lg shadow-md flex items-center justify-center relative overflow-hidden">
        {isi ? (
          <span className="text-4xl">{isi}</span>
        ) : (
          <span className="text-blue-300 text-sm italic">Kosong</span>
        )}
      </div>

      {/* Roda */}
      <div className="flex gap-4 mt-1">
        <div className="w-4 h-4 bg-slate-800 rounded-full"></div>
        <div className="w-4 h-4 bg-slate-800 rounded-full"></div>
      </div>

      {/* Label Indeks */}
      <motion.div layout className="mt-3 bg-slate-800 text-white px-4 py-1 rounded-full text-lg font-bold shadow-sm">
        [{index}]
      </motion.div>
    </motion.div>
  );
}
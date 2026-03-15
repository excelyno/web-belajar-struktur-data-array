"use client";

import { useArrayStore } from "@/store/useArrayStore";
import Gerbong from "./Gerbong";
import { AnimatePresence } from "framer-motion"; // Tambahan baru

export default function Kereta() {
  const gerbongs = useArrayStore((state) => state.gerbongs);

  return (
    <div className="flex items-end justify-start w-full p-8 overflow-x-auto bg-slate-50 rounded-xl border border-slate-200 shadow-inner min-h-[250px]">
      {/* Kepala Kereta */}
      <div className="shrink-0 w-32 h-32 bg-slate-800 rounded-t-2xl rounded-l-2xl border-b-8 border-slate-900 flex items-center justify-center mr-4 shadow-lg relative z-10">
         <span className="text-white font-bold text-xl">ArrayJS</span>
         <div className="absolute top-[-20px] right-4 w-6 h-8 bg-slate-600 rounded-t-sm"></div>
      </div>

      {/* Area Render Gerbong dengan Animasi */}
      <div className="flex items-end">
        <AnimatePresence mode="popLayout">
          {gerbongs.map((gerbong) => (
            <Gerbong key={gerbong.id} index={gerbong.index} isi={gerbong.isi} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
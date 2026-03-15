import { create } from 'zustand';
import { Gerbong } from '../types/game';

interface ArrayState {
  gerbongs: Gerbong[];
  isiGerbong: (index: number, nilai: string) => void;   // Update (O(1))
  sisipGerbong: (index: number, nilai: string) => void; // Insert (O(n) - geser kanan)
  hapusGerbong: (index: number) => void;                // Delete (O(n) - geser kiri)
  resetArray: () => void;
}

let nextId = 5; // Untuk bikin ID unik setiap kali ada gerbong baru

const initialArray: Gerbong[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `gerbong-${i}`,
  index: i,
  isi: null,
}));

export const useArrayStore = create<ArrayState>((set) => ({
  gerbongs: initialArray,
  
  // O(1) - Langsung timpa data di indeks tersebut (TIDAK ADA GESER)
  isiGerbong: (index, nilai) => set((state) => {
    const newGerbongs = [...state.gerbongs];
    if (newGerbongs[index]) {
      newGerbongs[index] = { ...newGerbongs[index], isi: nilai };
    }
    return { gerbongs: newGerbongs };
  }),

  // O(n) - Nyelipin gerbong di tengah (YANG KANAN GESER KANAN)
  sisipGerbong: (index, nilai) => set((state) => {
    const newGerbongs = [...state.gerbongs];
    newGerbongs.splice(index, 0, {
      id: `gerbong-${nextId++}`,
      index: 0, 
      isi: nilai,
    });
    // Kalkulasi ulang nomor indeks setelah digeser
    return { gerbongs: newGerbongs.map((g, i) => ({ ...g, index: i })) };
  }),

  // O(n) - Hapus gerbong di tengah (YANG KANAN GESER KIRI)
  hapusGerbong: (index) => set((state) => {
    const newGerbongs = [...state.gerbongs];
    newGerbongs.splice(index, 1);
    // Kalkulasi ulang nomor indeks setelah digeser
    return { gerbongs: newGerbongs.map((g, i) => ({ ...g, index: i })) };
  }),

  resetArray: () => {
    nextId = 5;
    return set({ gerbongs: initialArray });
  },
}));
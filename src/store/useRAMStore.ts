import { create } from 'zustand';
import { MemoryBlock } from '@/types/memory';

const toHex = (num: number) => `0x${num.toString(16).padStart(2, '0').toUpperCase()}`;

interface RAMState {
  memory: MemoryBlock[];
  baseAddress: number | null; 
  arraySize: number;          
  isAllocated: boolean;       
  errorMessage: string | null;
  highlightedAddress: number | null; 
  resizeArray: (newSize: number) => boolean;
  inisialisasiMemory: () => void;
  alokasiArray: (size: number) => boolean; 
  dealokasiArray: () => void;
  // Kita ubah agar mengembalikan boolean (true = nabrak/error, false = aman)
  tulisKeMemory: (targetAddress: number, value: string) => boolean;
  setHighlight: (address: number | null) => void;
  setErrorMessage: (msg: string | null) => void;
}

const generateInitialMemory = (): MemoryBlock[] => {
  const mem: MemoryBlock[] = Array.from({ length: 64 }).map((_, i) => ({
    address: i,
    status: 'free',
    value: null,
  }));

  for (let i = 0; i <= 3; i++) mem[i] = { ...mem[i], status: 'os', label: 'OS' };
  for (let i = 8; i <= 10; i++) mem[i] = { ...mem[i], status: 'app', label: 'Discord' };
  for (let i = 18; i <= 21; i++) mem[i] = { ...mem[i], status: 'app', label: 'Chrome' };
  mem[25] = { ...mem[25], status: 'app', label: 'Spotify' };
  for (let i = 40; i <= 45; i++) mem[i] = { ...mem[i], status: 'app', label: 'VSCode' };

  return mem;
};

export const useRAMStore = create<RAMState>((set, get) => ({
  memory: generateInitialMemory(),
  baseAddress: null,
  arraySize: 0,
  isAllocated: false,
  errorMessage: null,
  highlightedAddress: null,

  inisialisasiMemory: () => set({ 
    memory: generateInitialMemory(), baseAddress: null, arraySize: 0,
    isAllocated: false, errorMessage: null, highlightedAddress: null
  }),

  dealokasiArray: () => set((state) => {
    const newMemory = state.memory.map(block => 
      block.status === 'array' || block.status === 'error' ? { ...block, status: 'free', label: undefined, value: null } : block
    );
    return { memory: newMemory, baseAddress: null, arraySize: 0, isAllocated: false, errorMessage: null, highlightedAddress: null };
  }),

  alokasiArray: (size) => {
    const { memory } = get();
    let consecutiveFree = 0;
    let startIndex = -1;

    if (size <= 0 || size > 64) {
      set({ errorMessage: "Fatal Error: Ukuran tidak valid." });
      return false;
    }

    for (let i = 0; i < memory.length; i++) {
      if (memory[i].status === 'free') {
        if (consecutiveFree === 0) startIndex = i;
        consecutiveFree++;
        
        if (consecutiveFree === size) {
          const newMemory = [...memory];
          for (let j = startIndex; j < startIndex + size; j++) {
            newMemory[j] = { ...newMemory[j], status: 'array', label: `arr[${j - startIndex}]` };
          }
          set({ memory: newMemory, baseAddress: startIndex, arraySize: size, isAllocated: true, errorMessage: null });
          return true;
        }
      } else {
        consecutiveFree = 0; 
      }
    }
    
    set({ errorMessage: `Memory Error: Tidak ada ${size} blok bersebelahan yang kosong.` });
    return false;
  },

  tulisKeMemory: (targetAddress, value) => {
    let isCrash = false;
    set((state) => {
      const newMemory = [...state.memory];
      let newError = state.errorMessage;

      if (targetAddress >= 0 && targetAddress < 64) {
        const targetBlock = newMemory[targetAddress];
        
        // CEK APAKAH NABRAK APLIKASI LAIN (OUT OF BOUNDS)!
        if (targetBlock.status === 'os' || targetBlock.status === 'app') {
          newMemory[targetAddress] = { ...targetBlock, status: 'error', value: '💥' };
          
          // Format alamat ke Hex (misal: 0x0A)
          const hexAddress = `0x${targetAddress.toString(16).padStart(2, '0').toUpperCase()}`;
          const appName = targetBlock.label || 'Sistem OS';
          
          // Pesan error dinamis sesuai aplikasi yang ditabrak
          if (targetBlock.status === 'os') {
            newError = `FATAL CRASH (BSOD) 💀: Kamu menabrak alamat ${hexAddress}. Memori inti ${appName} hancur! Komputer harus restart.`;
          } else {
            newError = `SEGMENTATION FAULT 💥: Buffer Overflow di alamat ${hexAddress}! Aplikasi ${appName} korup dan terpaksa di-Force Close oleh OS.`;
          }
          isCrash = true;
        } else {
          newMemory[targetAddress] = { ...targetBlock, value: value };
          newError = null; // Clear error kalau aman (nulis di area array atau area kosong)
        }
      }
      return { memory: newMemory, errorMessage: newError };
    });
    return isCrash;
  },
  resizeArray: (newSize) => {
    const { memory, baseAddress, arraySize } = get();
    if (baseAddress === null) return false;

    let consecutiveFree = 0;
    let newStartIndex = -1;

    // 1. Cari lahan baru yang muat untuk ukuran baru
    for (let i = 0; i < memory.length; i++) {
      // Kita abaikan lahan lama, cari murni di lahan yang 'free'
      if (memory[i].status === 'free') {
        if (consecutiveFree === 0) newStartIndex = i;
        consecutiveFree++;
        if (consecutiveFree === newSize) break; // Ketemu lahan yang pas!
      } else {
        consecutiveFree = 0; // Nabrak, reset hitungan
      }
    }

    if (consecutiveFree === newSize) {
      const newMemory = [...memory];
      const oldData = [];

      // 2. COPY DATA LAMA (Proses O(n) yang bikin lemot) & Hancurkan rumah lama
      for (let i = 0; i < arraySize; i++) {
        oldData.push(newMemory[baseAddress + i].value); // Ambil barangnya
        
        // Bersihkan blok memori lama
        newMemory[baseAddress + i] = { 
          ...newMemory[baseAddress + i], 
          status: 'free', label: undefined, value: null 
        };
      }

      // 3. Pindah ke rumah baru dan masukkan data lama
      for (let j = 0; j < newSize; j++) {
        const val = j < oldData.length ? oldData[j] : null;
        newMemory[newStartIndex + j] = { 
          ...newMemory[newStartIndex + j], 
          status: 'array', 
          label: `arr[${j}]`,
          value: val 
        };
      }

      set({ 
        memory: newMemory, 
        baseAddress: newStartIndex, 
        arraySize: newSize,
        errorMessage: `✅ SUKSES: Pindah dari ${toHex(baseAddress)} ke ${toHex(newStartIndex)}. Proses mindahin ${arraySize} elemen butuh waktu O(n)!`
      });
      return true;
    } else {
      set({ errorMessage: `❌ GAGAL: RAM Penuh/Terfragmentasi! Tidak ada lahan kosong sebesar ${newSize} blok bersebelahan.` });
      return false;
    }
  },

  setHighlight: (address) => set({ highlightedAddress: address }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),
}));
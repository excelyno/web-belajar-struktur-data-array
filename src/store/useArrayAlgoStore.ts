import { create } from 'zustand';

// Representasi satu "adegan" dalam animasi algoritma
export interface AnimationFrame {
  arraySnapshot: (number | string | null)[]; // Kondisi array saat ini (bisa null kalau ada "lubang" pas shifting)
  activeLine: number;                        // Baris kode yang sedang dieksekusi (untuk highlight Terminal)
  pointers: Record<string, number>;          // Posisi panah penunjuk, misal: { i: 2 }
  highlightIndices: number[];                // Indeks kotak yang sedang disorot (berubah warna)
  status: 'default' | 'comparing' | 'found' | 'error' | 'shifting' | 'success'; 
  logMessage: string;                        // Pesan di console bawah terminal
}

export interface ArrayAlgoState {
  // --- STATE ---
  baseArray: number[];
  frames: AnimationFrame[];
  currentFrameIndex: number;
  isPlaying: boolean;
  speedMs: number;
  currentAlgo: string;
  complexity: string;

  // --- CONTROLS ---
  setBaseArray: (arr: number[]) => void; // 👈 TAMBAHKAN INI
  resetAnimation: () => void;            // 👈 TAMBAHKAN INI
  setSpeed: (speed: number) => void;
  play: () => void;
  pause: () => void;
  nextFrame: () => void;
  prevFrame: () => void;

  // --- ALGORITHM GENERATORS ---
  generateTraversal: () => void;
  generateLinearSearch: (target: number) => void;
  generateInsertion: (index: number, value: number) => void;
  generateDeletion: (index: number) => void;
  generateAccess: (index: number) => void;
  generateUpdate: (index: number, newValue: number) => void;
}

const DEFAULT_ARRAY = [10, 20, 30, 40, 50];

export const useArrayAlgoStore = create<ArrayAlgoState>((set, get) => ({
  baseArray: DEFAULT_ARRAY,
  frames: [],
  currentFrameIndex: 0,
  isPlaying: false,
  speedMs: 800, // Kecepatan default (0.8 detik per frame)
  currentAlgo: 'None',
  complexity: 'O(1)',

  setBaseArray: (arr) => set({ baseArray: arr, frames: [], currentFrameIndex: 0, isPlaying: false }),
  setSpeed: (speed) => set({ speedMs: speed }),
  
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  
  nextFrame: () => set((state) => ({ 
    currentFrameIndex: Math.min(state.currentFrameIndex + 1, state.frames.length - 1) 
  })),
  
  prevFrame: () => set((state) => ({ 
    currentFrameIndex: Math.max(state.currentFrameIndex - 1, 0) 
  })),
  
  resetAnimation: () => set({ currentFrameIndex: 0, isPlaying: false }),

  // ==========================================
  // ALGORITHM GENERATORS (THE LOGIC)
  // ==========================================

  generateTraversal: () => {
    const { baseArray } = get();
    const frames: AnimationFrame[] = [];
    const snapshot = [...baseArray];

    // Frame 0: Persiapan
    frames.push({
      arraySnapshot: [...snapshot], activeLine: 1, pointers: {}, highlightIndices: [],
      status: 'default', logMessage: `Memulai Traversal pada array berukuran ${snapshot.length}...`
    });

    for (let i = 0; i < snapshot.length; i++) {
      // Frame 1: Cek kondisi Loop
      frames.push({
        arraySnapshot: [...snapshot], activeLine: 2, pointers: { i }, highlightIndices: [],
        status: 'default', logMessage: `Looping: i = ${i}`
      });

      // Frame 2: Akses/Print elemen
      frames.push({
        arraySnapshot: [...snapshot], activeLine: 3, pointers: { i }, highlightIndices: [i],
        status: 'success', logMessage: `Mengakses elemen arr[${i}] -> ${snapshot[i]}`
      });
    }

    frames.push({
      arraySnapshot: [...snapshot], activeLine: 4, pointers: {}, highlightIndices: [],
      status: 'success', logMessage: `Selesai! Seluruh elemen telah dikunjungi.`
    });

    set({ frames, currentFrameIndex: 0, isPlaying: false, currentAlgo: 'Traversal', complexity: 'O(N)' });
  },

  generateLinearSearch: (target: number) => {
    const { baseArray } = get();
    const frames: AnimationFrame[] = [];
    const snapshot = [...baseArray];

    frames.push({
      arraySnapshot: [...snapshot], activeLine: 1, pointers: {}, highlightIndices: [],
      status: 'default', logMessage: `Memulai Linear Search mencari angka ${target}...`
    });

    let found = false;
    for (let i = 0; i < snapshot.length; i++) {
      // Frame Masuk Loop
      frames.push({
        arraySnapshot: [...snapshot], activeLine: 2, pointers: { i }, highlightIndices: [],
        status: 'default', logMessage: `Mengecek indeks ke-${i}...`
      });

      // Frame Membandingkan (Comparing)
      frames.push({
        arraySnapshot: [...snapshot], activeLine: 3, pointers: { i }, highlightIndices: [i],
        status: 'comparing', logMessage: `Apakah arr[${i}] (${snapshot[i]}) == ${target}?`
      });

      if (snapshot[i] === target) {
        // Frame Ketemu (Found)
        frames.push({
          arraySnapshot: [...snapshot], activeLine: 4, pointers: { i }, highlightIndices: [i],
          status: 'found', logMessage: `Target ${target} ditemukan pada indeks ${i}!`
        });
        found = true;
        break;
      } else {
        // Frame Gagal (Not Match)
        frames.push({
          arraySnapshot: [...snapshot], activeLine: 3, pointers: { i }, highlightIndices: [i],
          status: 'error', logMessage: `${snapshot[i]} bukan ${target}. Lanjut...`
        });
      }
    }

    if (!found) {
      frames.push({
        arraySnapshot: [...snapshot], activeLine: 5, pointers: {}, highlightIndices: [],
        status: 'error', logMessage: `Pencarian selesai. Angka ${target} tidak ditemukan dalam array.`
      });
    }

    set({ frames, currentFrameIndex: 0, isPlaying: false, currentAlgo: 'Linear Search', complexity: 'O(N)' });
  },
  generateInsertion: (index: number, value: number) => {
    const { baseArray } = get();
    const frames: AnimationFrame[] = [];
    
    // Kita buat array baru yang isinya sama, tapi tipe datanya mengizinkan null
    let currentArr: (number | string | null)[] = [...baseArray];

    // Validasi kalau index ngawur
    if (index < 0 || index > currentArr.length) {
      frames.push({
        arraySnapshot: [...currentArr], activeLine: 1, pointers: {}, highlightIndices: [],
        status: 'error', logMessage: `❌ IndexError: Indeks ${index} di luar batas!`
      });
      set({ frames, currentFrameIndex: 0, isPlaying: false, currentAlgo: 'Insertion', complexity: 'O(1)' });
      return;
    }

    // Frame 0: Persiapan
    frames.push({
      arraySnapshot: [...currentArr], activeLine: 1, pointers: { target: index }, highlightIndices: [index],
      status: 'default', logMessage: `Memulai Insertion angka ${value} pada indeks ke-${index}...`
    });

    // Frame 1: Python mengalokasikan slot baru di ujung list (mensimulasikan over-allocation)
    currentArr.push(null); // null merepresentasikan "lubang" kosong
    frames.push({
      arraySnapshot: [...currentArr], activeLine: 2, pointers: { target: index }, highlightIndices: [currentArr.length - 1],
      status: 'default', logMessage: `Mengalokasikan slot memori kosong di ujung array...`
    });

    // Frame Loop: Menggeser data dari kanan ke kiri, sampai ke index target
    for (let i = currentArr.length - 1; i > index; i--) {
      // Sorot data yang mau digeser
      frames.push({
        arraySnapshot: [...currentArr], activeLine: 3, pointers: { target: index, i, 'i-1': i - 1 }, highlightIndices: [i, i - 1],
        status: 'shifting', logMessage: `Mempersiapkan pergeseran elemen ${currentArr[i - 1]} ke kanan...`
      });

      // Lakukan pergeseran
      currentArr[i] = currentArr[i - 1];
      currentArr[i - 1] = null; // Bekas tempatnya jadi lubang

      frames.push({
        arraySnapshot: [...currentArr], activeLine: 4, pointers: { target: index, i }, highlightIndices: [i],
        status: 'success', logMessage: `Elemen digeser ke indeks ${i}.`
      });
    }

    // Frame Terakhir: Masukkan nilai baru ke "lubang" yang sudah tersedia
    frames.push({
      arraySnapshot: [...currentArr], activeLine: 5, pointers: { target: index }, highlightIndices: [index],
      status: 'comparing', logMessage: `Menyisipkan nilai ${value} ke lubang di indeks ${index}...`
    });

    currentArr[index] = value;

    frames.push({
      arraySnapshot: [...currentArr], activeLine: 6, pointers: {}, highlightIndices: [index],
      status: 'success', logMessage: `✅ Selesai! Elemen berhasil disisipkan.`
    });

    // Kita update baseArray sekalian, biar kalau run animasi lagi, array-nya udah yang terbaru!
    set({ baseArray: currentArr as number[], frames, currentFrameIndex: 0, isPlaying: false, currentAlgo: 'Insertion', complexity: 'O(N)' });
  },
  generateDeletion: (index: number) => {
    const { baseArray } = get();
    const frames: AnimationFrame[] = [];
    let currentArr: (number | string | null)[] = [...baseArray];

    // Validasi index
    if (index < 0 || index >= currentArr.length) {
      frames.push({
        arraySnapshot: [...currentArr], activeLine: 1, pointers: {}, highlightIndices: [],
        status: 'error', logMessage: `❌ IndexError: Indeks ${index} tidak valid!`
      });
      set({ frames, currentFrameIndex: 0, isPlaying: false, currentAlgo: 'Deletion', complexity: 'O(1)' });
      return;
    }

    // Frame 0: Persiapan (Sorot elemen yang mau dihapus)
    frames.push({
      arraySnapshot: [...currentArr], activeLine: 1, pointers: { target: index }, highlightIndices: [index],
      status: 'error', logMessage: `Menandai elemen di indeks ke-${index} (${currentArr[index]}) untuk dihapus...`
    });

    // Frame 1: Elemen dihapus (menjadi lubang / null)
    currentArr[index] = null;
    frames.push({
      arraySnapshot: [...currentArr], activeLine: 2, pointers: { target: index }, highlightIndices: [index],
      status: 'shifting', logMessage: `Elemen dihapus, meninggalkan lubang kosong (∅).`
    });

    // Frame Loop: Menggeser data dari kanan ke kiri (mulai dari index + 1)
    for (let i = index + 1; i < currentArr.length; i++) {
      // Sorot elemen yang mau digeser ke kiri
      frames.push({
        arraySnapshot: [...currentArr], activeLine: 3, pointers: { 'i-1': i - 1, i: i }, highlightIndices: [i, i - 1],
        status: 'comparing', logMessage: `Mempersiapkan pergeseran elemen ${currentArr[i]} ke kiri...`
      });

      // Lakukan pergeseran ke kiri
      currentArr[i - 1] = currentArr[i];
      currentArr[i] = null; // Bekas tempatnya jadi lubang

      frames.push({
        arraySnapshot: [...currentArr], activeLine: 4, pointers: { 'i-1': i - 1, i: i }, highlightIndices: [i - 1],
        status: 'success', logMessage: `Elemen digeser maju ke indeks ${i - 1}.`
      });
    }

    // Frame Terakhir: Buang "lubang" yang tersisa di ujung paling kanan
    currentArr.pop(); // Menghapus elemen terakhir
    frames.push({
      arraySnapshot: [...currentArr], activeLine: 5, pointers: {}, highlightIndices: [],
      status: 'success', logMessage: `✅ Array berhasil disusutkan. Deletion selesai!`
    });

    set({ baseArray: currentArr as number[], frames, currentFrameIndex: 0, isPlaying: false, currentAlgo: 'Deletion', complexity: 'O(N)' });
  },
  generateAccess: (index: number) => {
    const { baseArray } = get();
    const frames: AnimationFrame[] = [];
    const currentArr = [...baseArray];

    if (index < 0 || index >= currentArr.length) {
      frames.push({
        arraySnapshot: [...currentArr], activeLine: 1, pointers: {}, highlightIndices: [],
        status: 'error', logMessage: `❌ IndexError: Indeks ${index} di luar batas!`
      });
      set({ frames, currentFrameIndex: 0, isPlaying: false, currentAlgo: 'Access', complexity: 'O(1)' });
      return;
    }

    // Frame 0: Start
    frames.push({
      arraySnapshot: [...currentArr], activeLine: 1, pointers: {}, highlightIndices: [],
      status: 'default', logMessage: `Meminta akses ke memori indeks ke-${index}...`
    });

    // Frame 1: Langsung tembak!
    frames.push({
      arraySnapshot: [...currentArr], activeLine: 2, pointers: { target: index }, highlightIndices: [index],
      status: 'success', logMessage: `⚡ Instan O(1)! Komputer langsung menuju alamat memori arr[${index}]. Nilainya: ${currentArr[index]}`
    });

    set({ frames, currentFrameIndex: 0, isPlaying: false, currentAlgo: 'Access', complexity: 'O(1)' });
  },

  generateUpdate: (index: number, newValue: number) => {
    const { baseArray } = get();
    const frames: AnimationFrame[] = [];
    const currentArr = [...baseArray];

    if (index < 0 || index >= currentArr.length) {
      frames.push({
        arraySnapshot: [...currentArr], activeLine: 1, pointers: {}, highlightIndices: [],
        status: 'error', logMessage: `❌ IndexError: Indeks ${index} di luar batas!`
      });
      set({ frames, currentFrameIndex: 0, isPlaying: false, currentAlgo: 'Update', complexity: 'O(1)' });
      return;
    }

    // Frame 0: Sorot target
    frames.push({
      arraySnapshot: [...currentArr], activeLine: 1, pointers: { target: index }, highlightIndices: [index],
      status: 'default', logMessage: `Membidik memori di indeks ke-${index} untuk ditimpa...`
    });

    // Frame 1: Timpa nilai
    currentArr[index] = newValue;
    frames.push({
      arraySnapshot: [...currentArr], activeLine: 2, pointers: { target: index }, highlightIndices: [index],
      status: 'success', logMessage: `⚡ Instan O(1)! Memori di arr[${index}] berhasil ditimpa dengan nilai ${newValue}.`
    });

    set({ baseArray: currentArr, frames, currentFrameIndex: 0, isPlaying: false, currentAlgo: 'Update', complexity: 'O(1)' });
  },
}));


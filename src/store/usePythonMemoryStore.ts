import { create } from 'zustand';

export interface PyObject {
  address: string;
  type: string;
  value: any;
  refcnt: number;
  isFree: boolean;
}

export interface PointerBlock {
  index: number;
  targetAddress: string | null;
  isAllocated: boolean;
  belongsTo: string | null;
}

interface PythonMemoryState {
  heap: PyObject[];
  pointerSpace: PointerBlock[];
  variables: Record<string, string>;
  logs: string[];

  initPythonEngine: () => void;
  createPyObject: (type: string, value: any) => string | null;
  assignVariable: (varName: string, objectAddress: string) => void;
  createList: (varName: string, items: any[]) => void;
  appendToList: (varName: string, newItem: any) => void;
  popFromList: (varName: string) => void; // <--- FUNGSI BARU UNTUK POP
  garbageCollect: () => void;
  addLog: (msg: string) => void;
}

// Alamat memori 64-bit ala debugger
const generateAddress = (index: number) => `0x000001A8${(843200 + index * 32).toString(16).toUpperCase()}`;

export const usePythonMemoryStore = create<PythonMemoryState>((set, get) => ({
  heap: Array.from({ length: 20 }).map((_, i) => ({
    address: generateAddress(i), type: '', value: null, refcnt: 0, isFree: true,
  })),
  // Lahan diperluas jadi 50 supaya kelihatan pas pindah rumah
  pointerSpace: Array.from({ length: 50 }).map((_, i) => ({
    index: i, targetAddress: null, isAllocated: false, belongsTo: null,
  })),
  variables: {},
  logs: ["[System] CPython Virtual Machine Initialized."],

  initPythonEngine: () => set((state) => ({
    heap: state.heap.map(b => ({ ...b, isFree: true, refcnt: 0, type: '', value: null })),
    pointerSpace: state.pointerSpace.map(b => ({ ...b, isAllocated: false, targetAddress: null, belongsTo: null })),
    variables: {},
    logs: ["[System] Engine Rebooted. Memory wiped."]
  })),

  addLog: (msg) => set((state) => ({ logs: [...state.logs, msg] })),

  createPyObject: (type, value) => {
    const { heap, addLog } = get();
    const freeIndex = heap.findIndex(obj => obj.isFree);
    if (freeIndex === -1) { addLog(`❌ MemoryError: Heap penuh!`); return null; }

    const newHeap = [...heap];
    const targetAddress = newHeap[freeIndex].address;
    newHeap[freeIndex] = { address: targetAddress, type, value, refcnt: 0, isFree: false };
    
    set({ heap: newHeap });
    addLog(`Allocated PyObject (${type}) at ${targetAddress}`);
    return targetAddress;
  },

  assignVariable: (varName, targetAddress) => {
    set((state) => {
      const newHeap = [...state.heap];
      const newVars = { ...state.variables };
      
      const oldAddress = newVars[varName];
      if (oldAddress) {
        const oldObjIndex = newHeap.findIndex(o => o.address === oldAddress);
        if (oldObjIndex !== -1) newHeap[oldObjIndex].refcnt -= 1;
      }

      const newObjIndex = newHeap.findIndex(o => o.address === targetAddress);
      if (newObjIndex !== -1) newHeap[newObjIndex].refcnt += 1;

      newVars[varName] = targetAddress;
      return { heap: newHeap, variables: newVars };
    });
    get().garbageCollect();
  },

  createList: (varName, items) => {
    const { createPyObject, pointerSpace, assignVariable, addLog } = get();
    
    const itemAddresses: string[] = [];
    for (const item of items) {
      const type = typeof item === 'number' ? 'int' : 'str';
      const addr = createPyObject(type, item);
      if (addr) itemAddresses.push(addr);
    }

    const requiredSize = itemAddresses.length + 2; // Default over-allocation
    let consecutiveFree = 0;
    let startIndex = -1;

    for (let i = 0; i < pointerSpace.length; i++) {
      if (!pointerSpace[i].isAllocated) {
        if (consecutiveFree === 0) startIndex = i;
        consecutiveFree++;
        if (consecutiveFree === requiredSize) break;
      } else { consecutiveFree = 0; }
    }

    if (consecutiveFree < requiredSize) { addLog(`❌ MemoryError: Fragmentation limit reached.`); return; }

    const newPointerSpace = [...pointerSpace];
    const listId = `list_${Date.now()}`;
    
    for (let i = 0; i < requiredSize; i++) {
      const target = i < itemAddresses.length ? itemAddresses[i] : null;
      newPointerSpace[startIndex + i] = { index: startIndex + i, targetAddress: target, isAllocated: true, belongsTo: listId };
      if (target) {
        const state = get();
        const heapIndex = state.heap.findIndex(o => o.address === target);
        if (heapIndex !== -1) {
          const updatedHeap = [...state.heap];
          updatedHeap[heapIndex].refcnt += 1;
          set({ heap: updatedHeap });
        }
      }
    }

    const listAddress = createPyObject('list', { startIndex, size: itemAddresses.length, capacity: requiredSize, listId });
    if (listAddress) { assignVariable(varName, listAddress); }
  },

  appendToList: (varName, newItem) => {
    const state = get();
    const listAddress = state.variables[varName];
    if (!listAddress) return;

    const listObjIndex = state.heap.findIndex(o => o.address === listAddress);
    const listObj = state.heap[listObjIndex];
    if (!listObj || listObj.type !== 'list') return;

    const listData = listObj.value;
    const type = typeof newItem === 'number' ? 'int' : 'str';
    const itemAddress = state.createPyObject(type, newItem);
    if (!itemAddress) return;

    let newHeap = [...state.heap];
    const newItemIdx = newHeap.findIndex(o => o.address === itemAddress);
    if (newItemIdx !== -1) newHeap[newItemIdx].refcnt += 1;
    
    let newPointerSpace = [...state.pointerSpace];

    // Cek apakah kapasitas masih muat
    if (listData.size < listData.capacity) {
      // ✅ O(1) Amortized Append
      const targetIndex = listData.startIndex + listData.size;
      newPointerSpace[targetIndex] = { ...newPointerSpace[targetIndex], targetAddress: itemAddress };
      
      newHeap[listObjIndex] = { ...listObj, value: { ...listData, size: listData.size + 1 } };
      set({ pointerSpace: newPointerSpace, heap: newHeap });
      state.addLog(`⚡ Amortized O(1): Elemen di-append ke slot NULL yang tersedia.`);
      
    } else {
      // 🚨 KIAMAT KAPASITAS: O(N) REALLOCATION TERPICU!
      state.addLog(`⚠️ Kapasitas Penuh (${listData.capacity})! Memulai O(N) Reallocation...`);
      
      // Rumus asli CPython Growth Factor: new_allocated = newsize + (newsize >> 3) + (newsize < 9 ? 3 : 6)
      const newSize = listData.size + 1;
      const newCapacity = newSize + (newSize >> 3) + (newSize < 9 ? 3 : 6);
      
      state.addLog(`🧮 Rumus CPython: Mengalokasikan array baru dengan kapasitas ${newCapacity} slot.`);

      // Cari lahan kosong baru yang berjejer (Contiguous) sebesar newCapacity
      let consecutiveFree = 0;
      let newStartIndex = -1;
      for (let i = 0; i < newPointerSpace.length; i++) {
        if (!newPointerSpace[i].isAllocated) {
          if (consecutiveFree === 0) newStartIndex = i;
          consecutiveFree++;
          if (consecutiveFree === newCapacity) break;
        } else { consecutiveFree = 0; }
      }

      if (consecutiveFree < newCapacity) { state.addLog(`❌ Fatal: Tidak ada memori contiguous yang cukup!`); return; }

      // 1. Copy pointer lama ke rumah baru (Proses O(N))
      for (let i = 0; i < listData.size; i++) {
        newPointerSpace[newStartIndex + i] = {
          index: newStartIndex + i,
          targetAddress: newPointerSpace[listData.startIndex + i].targetAddress,
          isAllocated: true,
          belongsTo: listData.listId
        };
      }
      
      // 2. Masukkan item baru
      newPointerSpace[newStartIndex + listData.size] = {
        index: newStartIndex + listData.size,
        targetAddress: itemAddress,
        isAllocated: true,
        belongsTo: listData.listId
      };

      // 3. Sisanya di-set jadi slot NULL (Over-allocation)
      for (let i = listData.size + 1; i < newCapacity; i++) {
        newPointerSpace[newStartIndex + i] = {
          index: newStartIndex + i, targetAddress: null, isAllocated: true, belongsTo: listData.listId
        };
      }

      // 4. Hancurkan rumah lama (Free the old memory)
      for (let i = 0; i < listData.capacity; i++) {
        newPointerSpace[listData.startIndex + i] = {
          index: listData.startIndex + i, targetAddress: null, isAllocated: false, belongsTo: null
        };
      }

      // 5. Update metadata di PyListObject
      newHeap[listObjIndex] = {
        ...listObj,
        value: { ...listData, startIndex: newStartIndex, size: newSize, capacity: newCapacity }
      };

      set({ pointerSpace: newPointerSpace, heap: newHeap });
      state.addLog(`✅ Reallocation selesai. Array dipindahkan ke index [${newStartIndex}]. Lahan lama dibebaskan.`);
    }
  },

  popFromList: (varName) => {
    const state = get();
    const listAddress = state.variables[varName];
    if (!listAddress) return;

    const listObjIndex = state.heap.findIndex(o => o.address === listAddress);
    const listObj = state.heap[listObjIndex];
    if (!listObj || listObj.type !== 'list') return;

    const listData = listObj.value;
    if (listData.size === 0) { state.addLog(`❌ IndexError: pop from empty list`); return; }

    const newHeap = [...state.heap];
    const newPointerSpace = [...state.pointerSpace];
    
    // Index target yang mau di-pop (indeks terakhir)
    const targetIndex = listData.startIndex + listData.size - 1;
    const removedItemAddress = newPointerSpace[targetIndex].targetAddress;

    // Turunkan reference count objek yang di-pop
    if (removedItemAddress) {
      const itemIdx = newHeap.findIndex(o => o.address === removedItemAddress);
      if (itemIdx !== -1) newHeap[itemIdx].refcnt -= 1;
    }

    // Putuskan pointer di array (jadikan NULL), TAPI KOTAK TETAP ALOCATED!
    newPointerSpace[targetIndex] = { ...newPointerSpace[targetIndex], targetAddress: null };

    // Update metadata (size berkurang, kapasitas TETAP)
    newHeap[listObjIndex] = {
      ...listObj,
      value: { ...listData, size: listData.size - 1 }
    };

    set({ pointerSpace: newPointerSpace, heap: newHeap });
    state.addLog(`🗑️ Pop dieksekusi: ob_size mengecil, tapi memori (allocated) TIDAK diserahkan kembali ke OS.`);
    state.garbageCollect();
  },

  garbageCollect: () => {
    set((state) => {
      let collectedCount = 0;
      const newHeap = state.heap.map(obj => {
        if (!obj.isFree && obj.refcnt <= 0) {
          collectedCount++;
          return { ...obj, isFree: true, type: '', value: null, refcnt: 0 };
        }
        return obj;
      });
      if (collectedCount > 0) state.logs.push(`🧹 Garbage Collector membebaskan ${collectedCount} PyObject(s).`);
      return { heap: newHeap };
    });
  }
}));
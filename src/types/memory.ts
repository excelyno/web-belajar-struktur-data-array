export type BlockStatus = 'free' | 'os' | 'app' | 'array' | 'error';

export interface MemoryBlock {
  address: number;      // Angka desimal (0, 1, 2, ...) nanti kita ubah ke Hex saat render
  status: BlockStatus;  // Status memori saat ini
  value: string | null; // Isi datanya
  label?: string;       // Penanda (misal: "Spotify", "Chrome")
}
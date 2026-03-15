export interface Gerbong {
    id: string;        // ID unik untuk React key
    index: number;     // Posisi indeks (0, 1, 2, 3...) -> Wajib buat belajar array!
    isi: string | null; // Isi gerbongnya (bisa nama hewan/barang), null kalau kosong
}
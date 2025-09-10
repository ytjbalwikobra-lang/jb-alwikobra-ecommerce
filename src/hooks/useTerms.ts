import { useMemo } from 'react';

export interface TermsSection {
  id: string;
  title: string;
  content: string[] | string;
  isImportant?: boolean;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
}

export interface UseTermsReturn {
  lastUpdated: string;
  tableOfContents: TableOfContentsItem[];
  sections: TermsSection[];
}

export const useTerms = (): UseTermsReturn => {
  const lastUpdated = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  }, []);

  const tableOfContents: TableOfContentsItem[] = useMemo(() => [
    { id: 'definisi', title: 'Definisi' },
    { id: 'akun-kyc', title: 'Akun & KYC' },
    { id: 'transaksi', title: 'Transaksi' },
    { id: 'pembayaran-refund-biaya', title: 'Pembayaran, Refund, dan Biaya' },
    { id: 'pengiriman-akses', title: 'Pengiriman & Akses Akun' },
    { id: 'larangan', title: 'Larangan' },
    { id: 'batasan-tanggung-jawab', title: 'Batasan Tanggung Jawab' },
    { id: 'persetujuan', title: 'Pernyataan Persetujuan' },
    { id: 'kekayaan-intelektual', title: 'Kekayaan Intelektual' },
    { id: 'perubahan', title: 'Perubahan' },
    { id: 'tanggung-jawab-pemakaian', title: 'Tanggung Jawab Penggunaan Akun' },
    { id: 'hukum', title: 'Hukum yang Berlaku' },
    { id: 'kontak', title: 'Kontak' }
  ], []);

  const sections: TermsSection[] = useMemo(() => [
    {
      id: 'definisi',
      title: '1. Definisi',
      content: [
        '"Layanan" adalah platform jual beli dan/atau rental akun game yang dikelola oleh Perusahaan.',
        '"Pengguna" adalah setiap pihak yang mengakses atau menggunakan Layanan.',
        '"Penjual" adalah Pengguna yang menawarkan akun game untuk dijual atau disewakan.',
        '"Pembeli" adalah Pengguna yang membeli atau menyewa akun game melalui Layanan.'
      ]
    },
    {
      id: 'akun-kyc',
      title: '2. Akun & KYC',
      content: [
        'Pengguna wajib memberikan data yang benar, lengkap, dan terbaru.',
        'Perusahaan berhak melakukan verifikasi (KYC) sesuai kebijakan untuk pencegahan fraud.',
        'Pengguna bertanggung jawab atas kerahasiaan kredensial dan seluruh aktivitas pada akunnya.'
      ]
    },
    {
      id: 'transaksi',
      title: '3. Transaksi',
      content: [
        'Semua transaksi pembelian diproses melalui mitra pembayaran resmi yang ditentukan Perusahaan.',
        'Perusahaan berhak menunda/menolak transaksi yang diduga melanggar hukum atau kebijakan platform.',
        'Penjual wajib menjamin keaslian, kepemilikan, dan kelayakan akun yang ditawarkan.'
      ]
    },
    {
      id: 'pembayaran-refund-biaya',
      title: '4. Pembayaran, Refund, dan Biaya',
      content: [
        'Pembayaran dilakukan sesuai instruksi pada Layanan. Bukti pembayaran sah jika tervalidasi oleh sistem.',
        'Semua pembelian bersifat final dan tidak dapat di-refund.',
        'Biaya layanan dan/atau komisi dapat dikenakan dan diinformasikan secara transparan.'
      ],
      isImportant: true
    },
    {
      id: 'pengiriman-akses',
      title: '5. Pengiriman & Akses Akun',
      content: [
        'Detail akun akan dikirim setelah pembayaran terkonfirmasi.',
        'Untuk rental, akses diberikan sesuai durasi dan ketentuan yang disepakati.',
        'Pengguna wajib mengikuti panduan keamanan yang diberikan untuk mencegah pengambilalihan akun.'
      ]
    },
    {
      id: 'larangan',
      title: '6. Larangan',
      content: [
        'Penggunaan untuk tindakan ilegal, penipuan, atau pelanggaran hak pihak ketiga.',
        'Distribusi kembali data yang melanggar privasi atau kebijakan platform.',
        'Eksploitasi bug, celah, atau akses tidak sah terhadap sistem.'
      ]
    },
    {
      id: 'batasan-tanggung-jawab',
      title: '7. Batasan Tanggung Jawab',
      content: 'Layanan disediakan "sebagaimana adanya". Perusahaan tidak bertanggung jawab atas kehilangan tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan Layanan, sejauh diizinkan oleh hukum yang berlaku.'
    },
    {
      id: 'persetujuan',
      title: '8. Pernyataan Persetujuan',
      content: [
        'Pembelian akun dilakukan tanpa paksaan dan 100% atas kehendak Pengguna/Guest sendiri.',
        'Semua pembelian tidak dapat di-refund.',
        'PT ALWI KOBRA INDONESIA tidak bertanggung jawab atas penggunaan akun setelah dibeli.'
      ],
      isImportant: true
    },
    {
      id: 'kekayaan-intelektual',
      title: '8. Kekayaan Intelektual',
      content: 'Seluruh konten dan materi dalam Layanan adalah milik Perusahaan atau pemberi lisensi yang dilindungi hukum. Pengguna dilarang memperbanyak atau mendistribusikan tanpa izin tertulis.'
    },
    {
      id: 'perubahan',
      title: '9. Perubahan',
      content: 'Perusahaan dapat memperbarui Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui Layanan. Dengan tetap menggunakan Layanan, Anda menyetujui perubahan tersebut.'
    },
    {
      id: 'tanggung-jawab-pemakaian',
      title: '10. Tanggung Jawab atas Penggunaan Akun',
      content: 'Setelah kredensial akun diserahkan kepada Pembeli, seluruh risiko, pengelolaan, dan kepatuhan terhadap syarat platform game sepenuhnya menjadi tanggung jawab Pembeli. PT ALWI KOBRA INDONESIA tidak bertanggung jawab atas konsekuensi pemakaian akun setelah pembelian.',
      isImportant: true
    },
    {
      id: 'hukum',
      title: '11. Hukum yang Berlaku',
      content: 'Syarat & Ketentuan ini diatur oleh hukum Republik Indonesia. Sengketa akan diselesaikan melalui mekanisme yang ditentukan Perusahaan sesuai peraturan perundang-undangan.'
    },
    {
      id: 'kontak',
      title: '12. Kontak',
      content: 'Untuk pertanyaan, keluhan, atau permintaan terkait Syarat & Ketentuan ini, silakan hubungi Perusahaan.'
    }
  ], []);

  return {
    lastUpdated,
    tableOfContents,
    sections
  };
};

import React from 'react';

/* eslint-disable react/no-unescaped-entities */

const TermsPage: React.FC = () => {
  const updated = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 id="syarat-ketentuan" className="text-3xl font-bold text-white mb-2">Syarat & Ketentuan</h1>
        <p className="text-sm text-gray-400 mb-8">Terakhir diperbarui: {updated}</p>

        {/* Table of Contents */}
        <nav aria-label="Daftar Isi" className="mb-8 bg-black/40 border border-pink-500/30 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Daftar Isi</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm list-disc list-inside text-pink-300">
            <li><a href="#definisi" className="hover:underline">Definisi</a></li>
            <li><a href="#akun-kyc" className="hover:underline">Akun & KYC</a></li>
            <li><a href="#transaksi" className="hover:underline">Transaksi</a></li>
            <li><a href="#pembayaran-refund-biaya" className="hover:underline">Pembayaran, Refund, dan Biaya</a></li>
            <li><a href="#pengiriman-akses" className="hover:underline">Pengiriman & Akses Akun</a></li>
            <li><a href="#larangan" className="hover:underline">Larangan</a></li>
            <li><a href="#batasan-tanggung-jawab" className="hover:underline">Batasan Tanggung Jawab</a></li>
            <li><a href="#persetujuan" className="hover:underline">Pernyataan Persetujuan</a></li>
            <li><a href="#kekayaan-intelektual" className="hover:underline">Kekayaan Intelektual</a></li>
            <li><a href="#perubahan" className="hover:underline">Perubahan</a></li>
            <li><a href="#tanggung-jawab-pemakaian" className="hover:underline">Tanggung Jawab Penggunaan Akun</a></li>
            <li><a href="#hukum" className="hover:underline">Hukum yang Berlaku</a></li>
            <li><a href="#kontak" className="hover:underline">Kontak</a></li>
          </ul>
        </nav>

        <div className="space-y-6">
          <p className="text-gray-300">
            Dokumen Syarat & Ketentuan ini mengatur penggunaan layanan marketplace akun game yang dioperasikan oleh
            <strong> PT ALWI KOBRA INDONESIA</strong> (selanjutnya disebut "Perusahaan"). Dengan mengakses atau menggunakan layanan,
            Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan berikut.
          </p>

          <section>
            <h2 id="definisi" className="text-xl font-semibold text-white mb-2">1. Definisi</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>"Layanan" adalah platform jual beli dan/atau rental akun game yang dikelola oleh Perusahaan.</li>
              <li>"Pengguna" adalah setiap pihak yang mengakses atau menggunakan Layanan.</li>
              <li>"Penjual" adalah Pengguna yang menawarkan akun game untuk dijual atau disewakan.</li>
              <li>"Pembeli" adalah Pengguna yang membeli atau menyewa akun game melalui Layanan.</li>
            </ul>
          </section>

          <section>
            <h2 id="akun-kyc" className="text-xl font-semibold text-white mb-2">2. Akun & KYC</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Pengguna wajib memberikan data yang benar, lengkap, dan terbaru.</li>
              <li>Perusahaan berhak melakukan verifikasi (KYC) sesuai kebijakan untuk pencegahan fraud.</li>
              <li>Pengguna bertanggung jawab atas kerahasiaan kredensial dan seluruh aktivitas pada akunnya.</li>
            </ul>
          </section>

          <section>
            <h2 id="transaksi" className="text-xl font-semibold text-white mb-2">3. Transaksi</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Semua transaksi pembelian diproses melalui mitra pembayaran resmi yang ditentukan Perusahaan.</li>
              <li>Perusahaan berhak menunda/menolak transaksi yang diduga melanggar hukum atau kebijakan platform.</li>
              <li>Penjual wajib menjamin keaslian, kepemilikan, dan kelayakan akun yang ditawarkan.</li>
            </ul>
          </section>

          <section>
            <h2 id="pembayaran-refund-biaya" className="text-xl font-semibold text-white mb-2">4. Pembayaran, Refund, dan Biaya</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Pembayaran dilakukan sesuai instruksi pada Layanan. Bukti pembayaran sah jika tervalidasi oleh sistem.</li>
              <li><strong>Semua pembelian bersifat final dan <u>tidak dapat di-refund</u>.</strong></li>
              <li>Biaya layanan dan/atau komisi dapat dikenakan dan diinformasikan secara transparan.</li>
            </ul>
          </section>

          <section>
            <h2 id="pengiriman-akses" className="text-xl font-semibold text-white mb-2">5. Pengiriman & Akses Akun</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Detail akun akan dikirim setelah pembayaran terkonfirmasi.</li>
              <li>Untuk rental, akses diberikan sesuai durasi dan ketentuan yang disepakati.</li>
              <li>Pengguna wajib mengikuti panduan keamanan yang diberikan untuk mencegah pengambilalihan akun.</li>
            </ul>
          </section>

          <section>
            <h2 id="larangan" className="text-xl font-semibold text-white mb-2">6. Larangan</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Penggunaan untuk tindakan ilegal, penipuan, atau pelanggaran hak pihak ketiga.</li>
              <li>Distribusi kembali data yang melanggar privasi atau kebijakan platform.</li>
              <li>Eksploitasi bug, celah, atau akses tidak sah terhadap sistem.</li>
            </ul>
          </section>

          <section>
            <h2 id="batasan-tanggung-jawab" className="text-xl font-semibold text-white mb-2">7. Batasan Tanggung Jawab</h2>
            <p className="text-gray-300">
              Layanan disediakan “sebagaimana adanya”. Perusahaan tidak bertanggung jawab atas kehilangan tidak langsung,
              insidental, atau konsekuensial yang timbul dari penggunaan Layanan, sejauh diizinkan oleh hukum yang berlaku.
            </p>
          </section>

          <section>
            <h2 id="persetujuan" className="text-xl font-semibold text-white mb-2">8. Pernyataan Persetujuan</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li><strong>Pembelian akun dilakukan tanpa paksaan dan 100% atas kehendak Pengguna/Guest sendiri.</strong></li>
              <li><strong>Semua pembelian tidak dapat di-refund.</strong></li>
              <li><strong>PT ALWI KOBRA INDONESIA tidak bertanggung jawab atas penggunaan akun setelah dibeli.</strong></li>
            </ul>
          </section>

          <section>
            <h2 id="kekayaan-intelektual" className="text-xl font-semibold text-white mb-2">8. Kekayaan Intelektual</h2>
            <p className="text-gray-300">
              Seluruh konten dan materi dalam Layanan adalah milik Perusahaan atau pemberi lisensi yang dilindungi hukum.
              Pengguna dilarang memperbanyak atau mendistribusikan tanpa izin tertulis.
            </p>
          </section>

          <section>
            <h2 id="perubahan" className="text-xl font-semibold text-white mb-2">9. Perubahan</h2>
            <p className="text-gray-300">
              Perusahaan dapat memperbarui Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui Layanan.
              Dengan tetap menggunakan Layanan, Anda menyetujui perubahan tersebut.
            </p>
          </section>

          <section>
            <h2 id="tanggung-jawab-pemakaian" className="text-xl font-semibold text-white mb-2">10. Tanggung Jawab atas Penggunaan Akun</h2>
            <p className="text-gray-300">
              Setelah kredensial akun diserahkan kepada Pembeli, seluruh risiko, pengelolaan, dan kepatuhan terhadap syarat platform game
              sepenuhnya menjadi tanggung jawab Pembeli. <strong>PT ALWI KOBRA INDONESIA tidak bertanggung jawab atas konsekuensi pemakaian akun setelah pembelian.</strong>
            </p>
          </section>

          <section>
            <h2 id="hukum" className="text-xl font-semibold text-white mb-2">11. Hukum yang Berlaku</h2>
            <p className="text-gray-300">
              Syarat & Ketentuan ini diatur oleh hukum Republik Indonesia. Sengketa akan diselesaikan melalui mekanisme yang
              ditentukan Perusahaan sesuai peraturan perundang-undangan.
            </p>
          </section>

          <section>
            <h2 id="kontak" className="text-xl font-semibold text-white mb-2">12. Kontak</h2>
            <p className="text-gray-300">
              Untuk pertanyaan, keluhan, atau permintaan terkait Syarat & Ketentuan ini, silakan hubungi Perusahaan.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

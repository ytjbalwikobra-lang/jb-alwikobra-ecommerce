import React from 'react';
import { SettingsService } from '../services/settingsService.ts';
import { 
  HelpCircle, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  MessageSquare, 
  ChevronDown, 
  Search, 
  Sparkles,
  User,
  ShoppingBag,
  Heart,
  Settings,
  Zap,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const faqs = [
  {
    category: 'Akun & Registrasi',
    q: 'Bagaimana cara membuat akun?',
    a: 'Klik tombol "Masuk" di header, lalu pilih "Daftar". Masukkan email, password, dan nomor WhatsApp (opsional). Setelah registrasi, Anda bisa langsung login dan menggunakan fitur seperti Wishlist dan Riwayat Order.'
  },
  {
    category: 'Pembelian',
    q: 'Bagaimana cara membeli akun game?',
    a: 'Pilih produk dari katalog → Klik "Detail" → Pilih "Beli Sekarang" → Isi data pembeli → Klik "Proses Pembayaran" → Selesaikan pembayaran di invoice Xendit. Setelah sukses, Anda akan diarahkan ke halaman "Pembayaran Berhasil" dan otomatis kembali ke beranda. Bukti pembayaran dan status dapat dilihat di Riwayat Order.'
  },
  {
    category: 'Pembelian',
    q: 'Apa itu sistem rental dan bagaimana cara kerjanya?',
    a: 'Sistem rental memungkinkan Anda menyewa akun untuk durasi tertentu (harian/bulanan). Klik tombol "Sewa" pada produk, pilih durasi yang diinginkan, dan lakukan pembayaran. Akun akan dikembalikan otomatis setelah masa sewa berakhir.'
  },
  {
    category: 'Pembayaran',
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Pembayaran diproses melalui Xendit dengan opsi: Transfer Bank (BCA, BNI, BRI, Mandiri, dll), E-Wallet (OVO, DANA, GoPay, LinkAja), Virtual Account, QRIS, dan Kartu Kredit/Debit. Pilih metode yang sesuai saat checkout.'
  },
  {
    category: 'Pembayaran',
    q: 'Berapa lama proses konfirmasi pembayaran?',
    a: 'Konfirmasi dilakukan otomatis (webhook Xendit). Transfer bank umumnya 1–15 menit, e-wallet instan, virtual account 1–5 menit. Setelah terkonfirmasi Anda akan melihat status "Sukses" dan diarahkan ke halaman "Pembayaran Berhasil".'
  },
  {
    category: 'Keamanan',
    q: 'Apakah data saya aman?',
    a: 'Ya, sangat aman. Kami menggunakan: Row Level Security (RLS) pada database, enkripsi data sensitif, pembayaran melalui Xendit (PCI DSS compliant), dan tidak menyimpan data kartu kredit. Semua transaksi dimonitor 24/7.'
  },
  {
    category: 'Keamanan',
    q: 'Bagaimana jika akun yang dibeli bermasalah?',
    a: 'Kami memberikan garansi untuk semua akun. Jika ada masalah (akun tidak bisa login, data tidak sesuai, dll), hubungi admin dengan bukti pembelian. Tim support akan membantu troubleshoot atau memberikan replacement sesuai kebijakan.'
  },
  {
    category: 'Fitur',
    q: 'Apa itu produk terkait di halaman detail?',
    a: 'Di bawah detail produk, kami menampilkan maksimal 3 produk terkait dengan rasio gambar 4:5 untuk pengalaman belanja yang konsisten. Bagian ini disembunyikan khusus pada halaman detail Flash Sale.'
  },
  {
    category: 'Fitur',
    q: 'Bagaimana cara menggunakan wishlist?',
    a: 'Klik ikon ❤️ pada produk untuk menambah ke wishlist. Akses wishlist melalui navigasi atau profile dashboard. Wishlist tersimpan otomatis dan tersinkron dengan akun Anda. Anda akan mendapat notifikasi jika ada flash sale untuk item wishlist.'
  },
  {
    category: 'Fitur',
    q: 'Apa itu Flash Sale dan bagaimana cara mengikutinya?',
    a: 'Flash Sale adalah diskon terbatas waktu dengan stok terbatas. Akses melalui menu "Flash Sale". Setiap halaman menampilkan maksimal 8 produk dengan pagination. Gunakan tombol halaman untuk melihat item lainnya.'
  },
  {
    category: 'Akses Admin',
    q: 'Saya tidak bisa membuka halaman admin. Kenapa?',
    a: 'Halaman admin hanya untuk admin. Jika belum login, Anda akan diarahkan ke halaman Masuk. Jika sudah login namun bukan admin, Anda akan melihat halaman "Tidak memiliki akses".'
  },
  {
    category: 'Bantuan',
    q: 'Bagaimana cara menghubungi customer service?',
    a: 'Customer service tersedia melalui WhatsApp (09:00–21:00 WIB, tercepat) dan Email support. Untuk masalah mendesak, gunakan WhatsApp dan sertakan nomor order.'
  }
];

const guides = [
  {
    title: 'Panduan Pembelian Pertama',
    steps: [
      'Daftar akun dengan email valid',
      'Verifikasi nomor WhatsApp (opsional)',
      'Browse katalog produk',
      'Pilih produk dan baca deskripsi',
      'Klik "Beli Sekarang"',
      'Isi data pembeli dengan lengkap',
      'Pilih metode pembayaran',
      'Selesaikan pembayaran dalam 24 jam',
      'Tunggu konfirmasi dan pengiriman akun'
    ]
  },
  {
    title: 'Tips Berbelanja Aman',
    steps: [
      'Selalu login dengan akun resmi',
      'Periksa detail produk dan harga',
      'Gunakan metode pembayaran resmi',
      'Simpan bukti pembayaran',
      'Jangan share data akun dengan orang lain',
      'Update password secara berkala',
      'Hubungi admin jika ada yang mencurigakan'
    ]
  }
];

const HelpPage: React.FC = () => {
  const [open, setOpen] = React.useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Semua');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [whatsappNumber, setWhatsappNumber] = React.useState<string>(process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890');
  
  React.useEffect(() => {
    (async () => {
      try {
        const s = await SettingsService.get();
        if (s?.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
      } catch {}
    })();
  }, []);

  const categories = ['Semua', ...Array.from(new Set(faqs.map(faq => faq.category)))];
  
  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'Semua' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
  {/* Hero */}
      <div className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 border-b border-pink-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black border border-pink-500/40 mb-6">
              <HelpCircle className="text-pink-400 w-8 h-8" />
            </div>
    <h1 id="pusat-bantuan" className="text-4xl font-bold text-white mb-4">Pusat Bantuan</h1>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Temukan jawaban untuk pertanyaan umum, panduan lengkap, dan kontak support untuk pengalaman terbaik di JB Alwikobra
            </p>
            <div className="max-w-md mx-auto relative">
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/70 border border-pink-500/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500/60" 
                placeholder="Cari: pembelian, pembayaran, keamanan..." 
              />
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* TOC */}
        <nav aria-label="Daftar Isi" className="mb-8 bg-black/40 border border-pink-500/30 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Daftar Isi</p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm list-disc list-inside text-pink-300">
            <li><a href="#topik-cepat" className="hover:underline">Topik Cepat</a></li>
            <li><a href="#kategori" className="hover:underline">Kategori</a></li>
            <li><a href="#faq" className="hover:underline">Pertanyaan Umum</a></li>
            <li><a href="#kontak-cepat" className="hover:underline">Kontak Cepat</a></li>
            <li><a href="#panduan" className="hover:underline">Panduan</a></li>
            <li><a href="#butuh-bantuan" className="hover:underline">Butuh Bantuan?</a></li>
          </ul>
        </nav>

  {/* Quick Topics */}
  <h2 id="topik-cepat" className="text-2xl font-bold text-white mb-4">Topik Cepat</h2>
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4 text-center hover:border-pink-500/50 transition-colors cursor-pointer">
            <User className="mx-auto text-pink-400 mb-2" size={24} />
            <p className="text-sm font-medium">Akun</p>
          </div>
          <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4 text-center hover:border-pink-500/50 transition-colors cursor-pointer">
            <ShoppingBag className="mx-auto text-pink-400 mb-2" size={24} />
            <p className="text-sm font-medium">Pembelian</p>
          </div>
          <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4 text-center hover:border-pink-500/50 transition-colors cursor-pointer">
            <CreditCard className="mx-auto text-pink-400 mb-2" size={24} />
            <p className="text-sm font-medium">Pembayaran</p>
          </div>
          <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4 text-center hover:border-pink-500/50 transition-colors cursor-pointer">
            <ShieldCheck className="mx-auto text-pink-400 mb-2" size={24} />
            <p className="text-sm font-medium">Keamanan</p>
          </div>
          <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4 text-center hover:border-pink-500/50 transition-colors cursor-pointer">
            <Heart className="mx-auto text-pink-400 mb-2" size={24} />
            <p className="text-sm font-medium">Wishlist</p>
          </div>
          <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4 text-center hover:border-pink-500/50 transition-colors cursor-pointer">
            <Zap className="mx-auto text-pink-400 mb-2" size={24} />
            <p className="text-sm font-medium">Flash Sale</p>
          </div>
        </div>

  {/* Category Filter */}
  <h2 id="kategori" className="text-2xl font-bold text-white mb-4">Kategori</h2>
  <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-pink-500 text-white'
                    : 'bg-black/60 border border-pink-500/30 text-gray-300 hover:border-pink-500/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 id="faq" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <MessageSquare className="text-pink-400" />
              Pertanyaan Umum
            </h2>
            
            <div className="bg-black/60 border border-pink-500/30 rounded-xl divide-y divide-pink-500/20">
              {filteredFaqs.map((item, idx) => (
                <div key={idx} className="p-6">
                  <button
                    onClick={() => setOpen(open === idx ? null : idx)}
                    className="w-full text-left focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="inline-block px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full mb-2">
                          {item.category}
                        </span>
                        <h3 className="font-semibold text-white text-lg">{item.q}</h3>
                      </div>
                      <ChevronDown className={`transition-transform text-pink-400 ${open === idx ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {open === idx && (
                    <div className="mt-4 text-gray-300 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="bg-black/60 border border-pink-500/30 rounded-xl p-8 text-center">
                <Search className="mx-auto text-gray-500 mb-4" size={48} />
                <p className="text-gray-400">Tidak ada FAQ yang cocok dengan pencarian Anda.</p>
                <p className="text-gray-500 text-sm mt-2">Coba gunakan kata kunci lain atau hubungi support.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="bg-black/60 border border-pink-500/30 rounded-xl p-6">
              <h3 id="kontak-cepat" className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="text-pink-400" />
                Butuh Bantuan Cepat?
              </h3>
              <p className="text-gray-300 mb-4">
                Tim support kami siap membantu Anda pada jam operasional 09:00–21:00 WIB melalui WhatsApp.
              </p>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Halo%20admin,%20saya%20butuh%20bantuan%20terkait%20JB%20Alwikobra`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <MessageSquare size={18} />
                Chat WhatsApp Support
              </a>
              <div className="mt-4 space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span>Respon ±5 menit (jam operasional)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  <span>Online: 09:00 – 21:00 WIB</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-400" />
                  <span>Rating 4.9/5 customer satisfaction</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-black/60 border border-pink-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="text-pink-400" />
                Status Sistem
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Website</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Pembayaran</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Normal</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Optimal</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Terakhir update: {new Date().toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Guides Section */}
        <div className="mt-12">
          <h2 id="panduan" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Sparkles className="text-pink-400" />
            Panduan Lengkap
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {guides.map((guide, idx) => (
              <div key={idx} className="bg-black/60 border border-pink-500/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">{guide.title}</h3>
                <div className="space-y-3">
                  {guide.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {stepIdx + 1}
                      </div>
                      <p className="text-gray-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-gradient-to-r from-pink-600/20 to-rose-600/20 border border-pink-500/30 rounded-xl p-8 text-center">
          <AlertTriangle className="mx-auto text-yellow-400 mb-4" size={48} />
          <h3 id="butuh-bantuan" className="text-2xl font-bold text-white mb-4">Masih Belum Menemukan Jawaban?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Tim support kami siap membantu menyelesaikan masalah spesifik Anda. Jangan ragu untuk menghubungi kami kapan saja.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              WhatsApp Support
            </a>
            <a
              href="mailto:support@jbalwikobra.com"
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

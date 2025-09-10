/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-floating-promises, no-empty */
import React from 'react';
import { SettingsService } from '../services/settingsService';
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

  // FAQPage JSON-LD for rich results
  const faqJsonLd = React.useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  }), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-200">
      {/* Enhanced Hero */}
      <div className="relative bg-gradient-to-br from-pink-600/20 via-purple-600/15 to-rose-600/20 border-b border-pink-500/30 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-8">
            {/* Enhanced icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/50 mb-6 backdrop-blur-sm shadow-lg shadow-pink-500/20">
              <HelpCircle className="text-pink-400 w-10 h-10" />
            </div>
            
            {/* Enhanced title */}
            <div className="space-y-4">
              <h1 id="pusat-bantuan" className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Pusat Bantuan
              </h1>
              <p className="text-gray-300 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                Temukan jawaban untuk pertanyaan umum, panduan lengkap, dan kontak support untuk pengalaman terbaik di JB Alwikobra
              </p>
            </div>
            
            {/* Enhanced search */}
            <div className="max-w-lg mx-auto relative">
              <div className="relative">
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gradient-to-r from-black/80 to-gray-900/80 border border-pink-500/40 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-gray-400 focus:outline-none focus:border-pink-500/80 focus:ring-2 focus:ring-pink-500/30 backdrop-blur-sm transition-all duration-300 text-lg" 
                  placeholder="Cari: pembelian, pembayaran, keamanan..." 
                />
                <Search size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Search suggestions */}
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-gray-900/95 to-black/95 border border-gray-700/50 rounded-xl shadow-2xl backdrop-blur-md z-10">
                  {filteredFaqs.slice(0, 3).map((faq, i) => (
                    <div key={i} className="p-3 hover:bg-white/5 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl">
                      <p className="text-sm text-gray-300 font-medium">{faq.q}</p>
                      <p className="text-xs text-gray-500 mt-1">{faq.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick stats */}
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-400 pt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap size={16} className="text-yellow-500" />
                <span>Respons Cepat</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star size={16} className="text-purple-500" />
                <span>Expert Team</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQPage JSON-LD for rich results */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        {/* Enhanced TOC */}
        <nav aria-label="Daftar Isi" className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-pink-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              <Settings size={16} className="text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Daftar Isi</h3>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {[
              { href: "#topik-cepat", text: "Topik Cepat", icon: Sparkles },
              { href: "#kategori", text: "Kategori", icon: ShoppingBag },
              { href: "#faq", text: "Pertanyaan Umum", icon: HelpCircle },
              { href: "#kontak-cepat", text: "Kontak Cepat", icon: MessageSquare },
              { href: "#panduan", text: "Panduan", icon: User },
              { href: "#butuh-bantuan", text: "Butuh Bantuan?", icon: Heart }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={i}>
                  <a 
                    href={item.href} 
                    className="flex items-center space-x-2 p-2 text-gray-300 hover:text-pink-300 hover:bg-white/5 rounded-lg transition-all duration-200 group"
                  >
                    <Icon size={16} className="text-pink-400 group-hover:scale-110 transition-transform duration-200" />
                    <span>{item.text}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Enhanced Quick Topics Header */}
        <div className="space-y-3">
          <h2 id="topik-cepat" className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Topik Cepat
          </h2>
          <p className="text-gray-400">Akses cepat ke informasi yang paling sering dicari</p>
        </div>
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

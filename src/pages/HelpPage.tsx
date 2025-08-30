import React from 'react';
import { HelpCircle, ShieldCheck, CreditCard, Truck, MessageSquare, ChevronDown, Search, Sparkles } from 'lucide-react';

const faqs = [
  {
    q: 'Bagaimana cara membeli akun?',
    a: 'Pilih produk, klik Beli, lalu Anda akan diarahkan ke halaman pembayaran Xendit. Setelah pembayaran sukses, detail akun akan dikirim sesuai kebijakan toko.'
  },
  {
    q: 'Apakah bisa sewa akun?',
    a: 'Untuk penyewaan, silakan klik tombol Sewa/Hubungi WhatsApp pada halaman produk. Admin akan memproses secara manual sesuai kebijakan.'
  },
  {
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'Pembayaran dilakukan melalui Xendit (transfer bank, e-wallet, dll) sesuai opsi yang tersedia pada invoice.'
  },
  {
    q: 'Apakah transaksi aman?',
    a: 'Ya. Pembayaran diproses melalui Xendit dan data Anda dilindungi. Kami menggunakan kebijakan RLS pada database untuk keamanan data.'
  },
  {
    q: 'Bagaimana jika pembayaran saya pending/expire?',
    a: 'Status invoice akan diperbarui otomatis melalui webhook. Jika pending/expire, Anda dapat membuat order baru dari halaman produk atau menghubungi admin.'
  }
];

const HelpPage: React.FC = () => {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 border-b border-pink-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-pink-500/40 mb-4">
              <HelpCircle className="text-pink-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Pusat Bantuan</h1>
            <p className="text-gray-300 mt-2">FAQ, panduan, dan kontak untuk membantu Anda menggunakan JB Alwikobra</p>
            <div className="mt-6 max-w-md mx-auto relative">
              <input className="w-full bg-black/70 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-white placeholder:text-gray-500" placeholder="Cari topik: pembayaran, rental, keamanan..." />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Quick topics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-black border border-pink-500/30 rounded-xl p-4 text-center">
            <ShieldCheck className="mx-auto text-pink-400" />
            <p className="mt-2 text-sm">Keamanan</p>
          </div>
          <div className="bg-black border border-pink-500/30 rounded-xl p-4 text-center">
            <CreditCard className="mx-auto text-pink-400" />
            <p className="mt-2 text-sm">Pembayaran</p>
          </div>
          <div className="bg-black border border-pink-500/30 rounded-xl p-4 text-center">
            <Truck className="mx-auto text-pink-400" />
            <p className="mt-2 text-sm">Pengiriman</p>
          </div>
          <div className="bg-black border border-pink-500/30 rounded-xl p-4 text-center">
            <MessageSquare className="mx-auto text-pink-400" />
            <p className="mt-2 text-sm">Kontak</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-black border border-pink-500/30 rounded-xl divide-y divide-pink-500/20">
          {faqs.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setOpen(open === idx ? null : idx)}
              className="w-full text-left p-5 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{item.q}</h3>
                <ChevronDown className={`transition-transform ${open === idx ? 'rotate-180' : ''}`} />
              </div>
              {open === idx && (
                <p className="mt-2 text-gray-300">{item.a}</p>
              )}
            </button>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 bg-black border border-pink-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">Masih butuh bantuan?</h2>
          <p className="text-gray-300 mb-4">Hubungi admin melalui WhatsApp untuk bantuan cepat.</p>
          <a
            href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER || '6281234567890'}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          >
            Chat Admin via WhatsApp
          </a>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Sparkles size={12}/> Respon cepat di jam kerja (09.00-21.00 WIB)</p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

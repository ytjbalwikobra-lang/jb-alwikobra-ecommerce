import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SeoBreadcrumbs from '../components/SeoBreadcrumbs.tsx';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  React.useEffect(() => {
    const t = setTimeout(() => navigate('/', { replace: true }), 3500);
    return () => clearTimeout(t);
  }, [navigate]);

  const orderId = params.get('order_id');

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <SeoBreadcrumbs
          items={[
            { name: 'Beranda', item: '/' },
            { name: 'Pembayaran Berhasil', item: '/payment-success' }
          ]}
        />
        <h1 id="payment-success" className="text-3xl font-extrabold text-white mb-2 text-center">Pembayaran Berhasil</h1>
        {/* TOC for clarity and sitelinks discovery */}
        <nav aria-label="Daftar Isi" className="mb-6 bg-black/40 border border-pink-500/30 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Daftar Isi</p>
          <ul className="list-disc list-inside text-sm text-pink-300 space-y-1">
            <li><a href="#ringkasan" className="hover:underline">Ringkasan</a></li>
            <li><a href="#tindak-lanjut" className="hover:underline">Tindak Lanjut</a></li>
          </ul>
        </nav>
        <div className="text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
          <svg className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <h2 id="ringkasan" className="text-xl font-bold text-white mb-2">Terima kasih!</h2>
        <p className="text-gray-300 mb-6">Pembayaran Anda berhasil diproses.</p>
        {orderId && (
          <p className="text-sm text-gray-400 mb-6">ID Pesanan: <span className="font-mono">{orderId}</span></p>
        )}
        <h3 id="tindak-lanjut" className="text-lg font-semibold text-white mb-2">Langkah Selanjutnya</h3>
        <p className="text-gray-400 mb-2">Anda akan dialihkan ke beranda sebentar lagi.</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="mt-6 px-5 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
        >
          Kembali sekarang
        </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

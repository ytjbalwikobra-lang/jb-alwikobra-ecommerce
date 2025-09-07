import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  React.useEffect(() => {
    const t = setTimeout(() => navigate('/', { replace: true }), 3500);
    return () => clearTimeout(t);
  }, [navigate]);

  const orderId = params.get('order_id');

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
          <svg className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Terima kasih!</h1>
        <p className="text-gray-300 mb-6">Pembayaran Anda berhasil diproses.</p>
        {orderId && (
          <p className="text-sm text-gray-400 mb-6">ID Pesanan: <span className="font-mono">{orderId}</span></p>
        )}
        <p className="text-gray-400">Anda akan dialihkan ke beranda sebentar lagi...</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="mt-6 px-5 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
        >
          Kembali sekarang
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

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
    <>
      {/* Prevent indexing */}
      <meta name="robots" content="noindex,nofollow" />
      <div className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[60vw] h-[60vw] rounded-full bg-pink-600/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-[60vw] h-[60vw] rounded-full bg-emerald-500/20 blur-3xl animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05),transparent_40%)]" />
        </div>

        <div className="relative z-10 w-full max-w-xl px-6">
          <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur p-8 shadow-xl">
            <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-emerald-500/15 flex items-center justify-center animate-[pulse_1.6s_ease-in-out_infinite]">
              <svg className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <span className="sr-only">Pembayaran sukses</span>
            </div>
            <h1 id="payment-success" className="text-3xl font-extrabold text-white mb-2 text-center">Pembayaran Berhasil</h1>
            <p className="text-center text-gray-300">Terima kasih! Pembayaran Anda sudah kami terima dan pesanan sedang diproses.</p>
            {orderId && (
              <p className="text-center text-sm text-gray-400 mt-4">ID Pesanan: <span className="font-mono">{orderId}</span></p>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-xs text-gray-400">Status</div>
                <div className="text-white font-semibold">Sukses</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-xs text-gray-400">Estimasi</div>
                <div className="text-white font-semibold">Segera diproses</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-xs text-gray-400">Redirect</div>
                <div className="text-white font-semibold">Otomatis</div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <button onClick={() => navigate('/', { replace: true })} className="px-5 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700">
                Kembali ke Beranda
              </button>
              <a href="/orders" className="px-5 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-200">
                Lihat Pesanan
              </a>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">Anda akan dialihkan secara otomatis dalam beberapa detik…</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccessPage;

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, MessageCircle, ArrowRight, Home } from 'lucide-react';
import { useWhatsAppAuth } from '../contexts/WhatsAppAuthContext.tsx';

const MagicLinkVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  
  const { verifyMagicLink } = useWhatsAppAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan dalam URL');
      return;
    }

    verifyMagicLinkToken();
  }, [token]);

  const verifyMagicLinkToken = async () => {
    try {
      const result = await verifyMagicLink(token!);

      if (result.success) {
        setStatus('success');
        setMessage('Login berhasil! Anda akan diarahkan ke beranda...');
        setUser(result.user);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        setStatus('error');
        setMessage(result.error?.message || 'Verifikasi gagal');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Terjadi kesalahan jaringan. Silakan coba lagi.');
    }
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleRequestNewLink = () => {
    navigate('/auth?mode=whatsapp', { replace: true });
  };

  return (
    <div className="min-h-screen bg-app-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <MessageCircle className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Verifikasi WhatsApp
          </h1>
          <p className="text-gray-400">
            Memverifikasi link masuk Anda...
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-black border border-pink-500/30 rounded-xl p-6 mb-6">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold text-white mb-2">
                Memproses Verifikasi...
              </h2>
              <p className="text-gray-400">
                Mohon tunggu sebentar
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
              <h2 className="text-lg font-semibold text-white mb-2">
                🎉 Login Berhasil!
              </h2>
              <p className="text-gray-400 mb-4">
                {message}
              </p>
              
              {user && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 text-green-400 mb-2">
                    <MessageCircle size={20} />
                    <span className="font-medium">Selamat datang, {user.name}!</span>
                  </div>
                  <p className="text-sm text-green-300">
                    WhatsApp: {user.whatsapp}
                  </p>
                  {user.isAdmin && (
                    <p className="text-sm text-yellow-300 mt-1">
                      🔐 Admin access granted
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Home size={20} />
                <span>Lanjut ke Beranda</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
              <h2 className="text-lg font-semibold text-white mb-2">
                Verifikasi Gagal
              </h2>
              <p className="text-gray-400 mb-4">
                {message}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleRequestNewLink}
                  className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-700 transition-colors"
                >
                  Minta Link Baru
                </button>
                
                <button
                  onClick={handleGoHome}
                  className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MessageCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-blue-400 font-medium mb-1">
                WhatsApp Authentication
              </h3>
              <p className="text-blue-300 text-sm">
                Kami menggunakan WhatsApp untuk autentikasi yang aman dan mudah. 
                Link verifikasi berlaku selama 15 menit untuk keamanan maksimal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkVerifyPage;

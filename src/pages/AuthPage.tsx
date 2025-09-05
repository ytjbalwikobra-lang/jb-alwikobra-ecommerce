import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Sparkles, Phone, MessageCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useWhatsAppAuth } from '../contexts/WhatsAppAuthContext.tsx';
import PhoneInput from '../components/PhoneInput.tsx';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [whatsapp, setWhatsapp] = useState('');
  const [name, setName] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const redirectTo = useMemo(() => search.get('redirect') || '/', [search]);
  const { sendMagicLink, user } = useWhatsAppAuth();

  // If user is already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate(redirectTo || '/');
    }
  }, [user, navigate, redirectTo]);

  const validateWhatsApp = (phone: string): boolean => {
    // Indonesian WhatsApp number validation: starts with 62, followed by 8-13 digits
    const whatsappRegex = /^62[0-9]{9,13}$/;
    return whatsappRegex.test(phone);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validation
      if (!whatsapp) {
        throw new Error('Nomor WhatsApp wajib diisi');
      }
      
      if (!validateWhatsApp(whatsapp)) {
        throw new Error('Format nomor WhatsApp tidak valid. Contoh: 6281234567890');
      }
      
      if (mode === 'signup') {
        if (!name || !validateName(name)) {
          throw new Error('Nama lengkap minimal 2 karakter');
        }
      }

      // Send magic link (no email needed)
      const result = await sendMagicLink(whatsapp, mode === 'signup' ? name : undefined);
      
      if (!result.success) {
        throw new Error(result.error || 'Gagal mengirim magic link');
      }
      
      // Success - magic link sent
      setMagicLinkSent(true);
      setSuccess(`🎉 Magic link berhasil dikirim ke WhatsApp ${whatsapp}!\n\nSilakan cek WhatsApp Anda dan klik link untuk ${mode === 'login' ? 'masuk' : 'mengaktifkan akun'}.`);
      
      // Reset form
      setWhatsapp('');
      setName('');
      
    } catch (e: any) {
      console.error('Auth error:', e);
      setError(e?.message || 'Terjadi kesalahan saat memproses permintaan');
    } finally { 
      setLoading(false); 
    }
  };

  const handleResendMagicLink = async () => {
    if (!whatsapp) return;
    
    setLoading(true);
    try {
      const result = await sendMagicLink(whatsapp, mode === 'signup' ? name : undefined);
      if (result.success) {
        setSuccess('🔄 Magic link berhasil dikirim ulang!');
      } else {
        setError(result.error || 'Gagal mengirim ulang magic link');
      }
    } catch (e: any) {
      setError(e?.message || 'Gagal mengirim ulang magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-app-dark">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6">
          <ArrowLeft size={18} />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left: Branding */}
          <div className="hidden md:flex">
            <div className="bg-gradient-to-br from-pink-600/15 to-rose-600/15 border border-pink-500/30 rounded-3xl p-8 backdrop-blur w-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 animate-[spin_12s_linear_infinite]" />
                  <div>
                    <h2 className="text-3xl font-bold text-white">WhatsApp Login</h2>
                    <p className="text-gray-300">Masuk dengan magic link via WhatsApp - tanpa password!</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">🚫</div>
                    <div className="text-xs text-gray-400 mt-1">Tanpa Password</div>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">⚡</div>
                    <div className="text-xs text-gray-400 mt-1">Magic Link Instan</div>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">🔒</div>
                    <div className="text-xs text-gray-400 mt-1">Aman & Mudah</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 text-center">
                <MessageCircle size={14} className="inline mr-1" />
                Powered by WhatsApp Authentication
              </div>
            </div>
          </div>

          {/* Right: Auth Card */}
          <div className="w-full">
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-600 to-rose-600 opacity-40 blur group-hover:opacity-60 transition" />
              <div className="relative bg-black/70 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                      <MessageCircle size={24} className="text-pink-400" />
                      {mode === 'login' ? 'Masuk dengan WhatsApp' : 'Daftar dengan WhatsApp'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                      {mode === 'login' 
                        ? '🔗 Magic link akan dikirim ke WhatsApp Anda' 
                        : '✨ Buat akun baru dengan nomor WhatsApp'}
                    </p>
                  </div>
                  <Sparkles className="text-pink-400" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* WhatsApp Number (Required) */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">
                      <MessageCircle size={12} className="inline mr-1" />
                      Nomor WhatsApp
                    </label>
                    <PhoneInput
                      value={whatsapp}
                      onChange={setWhatsapp}
                      onValidationChange={setIsValidPhone}
                      placeholder="Contoh: 6281234567890"
                      className="bg-black/60 border-white/15 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💬 Magic link dikirim langsung ke WhatsApp - tanpa email!
                    </p>
                  </div>

                  {/* Name (Required for signup) */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-400">
                        Nama Lengkap
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50" 
                          placeholder="Masukkan nama lengkap Anda"
                          minLength={2}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Nama ini akan ditampilkan di profil Anda
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <div>{error}</div>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start gap-2">
                      <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="whitespace-pre-line">{success}</div>
                    </div>
                  )}

                  {/* Submit Button */}
                  {!magicLinkSent ? (
                    <button 
                      type="submit" 
                      disabled={loading || !isValidPhone}
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg py-3 font-semibold hover:shadow-[0_0_25px_rgba(236,72,153,0.35)] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Mengirim Magic Link...
                        </>
                      ) : (
                        <>
                          <MessageCircle size={16} />
                          {mode === 'login' ? 'Kirim Magic Link' : 'Daftar dengan WhatsApp'}
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
                        <p className="text-sm text-green-400 font-medium">Magic Link Terkirim!</p>
                        <p className="text-xs text-gray-400 mt-1">Cek WhatsApp Anda sekarang</p>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={handleResendMagicLink}
                        disabled={loading}
                        className="w-full bg-gray-600 hover:bg-gray-500 text-white rounded-lg py-2.5 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Mengirim Ulang...
                          </>
                        ) : (
                          <>
                            <MessageCircle size={16} />
                            Kirim Ulang Magic Link
                          </>
                        )}
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => {
                          setMagicLinkSent(false);
                          setSuccess(null);
                          setError(null);
                        }}
                        className="w-full text-gray-400 hover:text-white text-sm underline"
                      >
                        Ubah Nomor WhatsApp
                      </button>
                    </div>
                  )}
                </form>

                <div className="text-sm text-gray-300 mt-6 text-center">
                  {!magicLinkSent && (
                    <>
                      {mode === 'login' ? (
                        <span>
                          Belum punya akun?{' '}
                          <button 
                            onClick={() => {
                              setMode('signup');
                              setError(null);
                              setSuccess(null);
                            }} 
                            className="text-pink-400 hover:text-pink-300 font-medium underline"
                          >
                            Daftar dengan WhatsApp
                          </button>
                        </span>
                      ) : (
                        <span>
                          Sudah punya akun?{' '}
                          <button 
                            onClick={() => {
                              setMode('login');
                              setError(null);
                              setSuccess(null);
                            }} 
                            className="text-pink-400 hover:text-pink-300 font-medium underline"
                          >
                            Masuk di sini
                          </button>
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageCircle size={16} className="text-pink-400" />
                    <span className="text-sm font-medium text-white">Autentikasi WhatsApp</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    🚫 Tanpa password • ⚡ WhatsApp-only • 🔒 Tanpa email
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Dengan melanjutkan, Anda menyetujui{' '}
                    <Link to="/terms" className="text-pink-400 hover:text-pink-300 underline">
                      Syarat & Ketentuan
                    </Link>{' '}
                    kami
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

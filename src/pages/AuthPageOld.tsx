import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, ArrowLeft, Sparkles, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import PhoneInput from '../components/PhoneInput.tsx';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const redirectTo = useMemo(() => search.get('redirect') || '/', [search]);
  const [showPass, setShowPass] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (mode === 'signup') {
        if (whatsapp && !isValidPhone) {
          throw new Error('Nomor WhatsApp tidak valid');
        }
        const { error } = await signUp(email, password, whatsapp);
        if (error) throw error;
        
        // Show success message for signup
        alert('Akun berhasil dibuat! Periksa WhatsApp Anda untuk pesan selamat datang.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
      navigate(redirectTo || '/');
    } catch (e: any) {
      setError(e?.message || 'Terjadi kesalahan');
    } finally { 
      setLoading(false); 
    }
  };
    } catch (e: any) {
      setError(e?.message || 'Auth error');
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      {/* Animated blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-80 h-80 rounded-full bg-pink-600/25 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />

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
                    <h2 className="text-3xl font-bold text-white">Selamat Datang</h2>
                    <p className="text-gray-300">Masuk untuk mengelola akun dan pesanan Anda</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">Aman</div>
                    <div className="text-xs text-gray-400">Autentikasi Supabase</div>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">Cepat</div>
                    <div className="text-xs text-gray-400">Proses instan</div>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">Modern</div>
                    <div className="text-xs text-gray-400">UI tematik</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 text-center">Protected by RLS & Supabase Auth</div>
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
                      <Lock size={24} className="text-pink-400" />
                      {mode === 'login' ? 'Masuk' : 'Daftar'}
                    </h1>
                    <p className="text-gray-400 mt-1">Gunakan email dan password</p>
                  </div>
                  <Sparkles className="text-pink-400" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50" placeholder="name@email.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">Password</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type={showPass ? 'text' : 'password'} required value={password} onChange={(e)=>setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 rounded-lg bg-black/60 border border-white/15 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50" placeholder="••••••••" />
                      <button type="button" onClick={()=>setShowPass(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && <div className="text-sm text-red-500">{error}</div>}

                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg py-2.5 font-semibold hover:shadow-[0_0_25px_rgba(236,72,153,0.35)] transition disabled:opacity-60">
                    {loading ? 'Memproses…' : (mode === 'login' ? 'Masuk' : 'Daftar')}
                  </button>
                </form>

                <div className="text-sm text-gray-300 mt-4">
                  {mode === 'login' ? (
                    <span>Belum punya akun? <button onClick={()=>setMode('signup')} className="text-pink-400">Daftar</button></span>
                  ) : (
                    <span>Sudah punya akun? <button onClick={()=>setMode('login')} className="text-pink-400">Masuk</button></span>
                  )}
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

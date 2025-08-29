import React, { useState } from 'react';
import { supabase } from '../services/supabase.ts';
import { Link, useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error('Supabase not configured');
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name: email.split('@')[0] } } });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate('/');
    } catch (e: any) {
      setError(e?.message || 'Auth error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{mode === 'login' ? 'Masuk' : 'Daftar'}</h1>
        <p className="text-gray-600 mb-6">Gunakan email dan password.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white rounded-lg py-2 font-semibold hover:bg-primary-700 disabled:opacity-60">
            {loading ? 'Memproses…' : (mode === 'login' ? 'Masuk' : 'Daftar')}
          </button>
        </form>
        <div className="text-sm text-gray-600 mt-4">
          {mode === 'login' ? (
            <span>Belum punya akun? <button onClick={()=>setMode('signup')} className="text-primary-600">Daftar</button></span>
          ) : (
            <span>Sudah punya akun? <button onClick={()=>setMode('login')} className="text-primary-600">Masuk</button></span>
          )}
        </div>
        <div className="mt-4"><Link to="/" className="text-gray-600">Kembali</Link></div>
      </div>
    </div>
  );
};

export default AuthPage;

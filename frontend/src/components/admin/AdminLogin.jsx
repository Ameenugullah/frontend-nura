import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLogin() {
  const { login, loginError } = useAdmin();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-charcoal-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-4xl text-white font-script">Nura Bahar</span>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-stone-400 mt-2">Admin Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4 bg-white">
          <h2 className="mb-2 text-2xl font-light font-display text-charcoal-800">Sign In</h2>
          <div>
            <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@nurabahar.ng" className="input-field" required autoComplete="username" />
          </div>
          <div>
            <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="input-field" required autoComplete="current-password" />
          </div>
          {loginError && <p className="text-xs font-body text-blush-500">{loginError}</p>}
          <button type="submit" disabled={loading} className="justify-center w-full py-3 btn-primary disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="pt-1 text-xs text-center font-body text-stone-400">Admin credentials set in PocketBase settings.</p>
        </form>
      </div>
    </div>
  );
}

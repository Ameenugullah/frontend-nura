import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]   = useState('login'); // 'login' | 'register'
  const [show, setShow]   = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm]   = useState({ name: '', email: '', password: '' });

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      const res = await login(form.email, form.password);
      if (res.success) navigate('/');
      else setError(res.error);
    } else {
      if (!form.name.trim()) { setError('Please enter your name.'); return; }
      if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      const res = await register(form.email, form.password, form.name);
      if (res.success) navigate('/');
      else setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-script text-4xl text-charcoal-800">Nura Bahar</Link>
          <p className="font-body text-sm text-stone-400 mt-2">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <div className="bg-white border border-stone-200 p-8">
          {/* tabs */}
          <div className="flex border-b border-stone-200 mb-7">
            {[['login','Sign In'],['register','Register']].map(([val, label]) => (
              <button key={val} onClick={() => { setMode(val); setError(''); setSuccess(''); }}
                className={`relative flex-1 pb-3 font-body text-sm font-medium transition-colors ${
                  mode === val ? 'text-charcoal-900' : 'text-stone-400 hover:text-charcoal-700'
                }`}>
                {label}
                {mode === val && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-900" />}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Full Name</label>
                <input value={form.name} onChange={e => update('name', e.target.value)}
                  placeholder="Fatima Abubakar" className="input-field" />
              </div>
            )}
            <div>
              <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                placeholder="you@example.com" className="input-field" autoComplete="email" />
            </div>
            <div>
              <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder={mode === 'register' ? 'Minimum 8 characters' : '••••••••'}
                  className="input-field pr-10"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-charcoal-700">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <Link to="/forgot-password" className="font-body text-xs text-blush-500 hover:text-blush-600 transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            {error && <p className="font-body text-xs text-blush-500">{error}</p>}
            {success && <p className="font-body text-xs text-green-600">{success}</p>}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 mt-2">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading…</span>
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

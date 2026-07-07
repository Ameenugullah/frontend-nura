import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signUp } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [mode,     setMode]     = useState('login'); // 'login' | 'register'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const from = location.state?.from || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, name);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. This email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(''); };

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-script text-charcoal-800">Nura Bahar</Link>
        </div>

        <div className="flex border-b border-stone-200 mb-6">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 pb-3 text-sm font-medium font-body transition-colors relative ${
              mode === 'login' ? 'text-charcoal-900' : 'text-stone-400 hover:text-charcoal-700'
            }`}
          >
            Sign In
            {mode === 'login' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-900" />}
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 pb-3 text-sm font-medium font-body transition-colors relative ${
              mode === 'register' ? 'text-charcoal-900' : 'text-stone-400 hover:text-charcoal-700'
            }`}
          >
            Register
            {mode === 'register' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-900" />}
          </button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="bg-white p-8 border border-stone-200 space-y-4">
          {error && (
            <p className="text-xs font-body text-blush-500 bg-blush-50 border border-blush-200 px-3 py-2">{error}</p>
          )}

          {mode === 'register' && (
            <div>
              <label className="block mb-1.5 font-body text-xs tracking-wider uppercase text-stone-500">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Fatima Abubakar"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="block mb-1.5 font-body text-xs tracking-wider uppercase text-stone-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="block mb-1.5 font-body text-xs tracking-wider uppercase text-stone-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder={mode === 'register' ? 'At least 8 characters' : ''}
              className="input-field"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          {mode === 'login' && (
            <div className="text-center pt-1">
              <Link to="/forgot-password" className="font-body text-xs text-stone-400 hover:text-charcoal-800 transition-colors">
                Forgot password?
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen pt-6 bg-stone-50">
      <div className="px-6 mx-auto max-w-md">
        <h1 className="text-3xl italic font-display mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 border border-stone-100">
          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
          <label className="block mb-2 text-xs text-stone-500">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border border-stone-200 mb-4" />
          <label className="block mb-2 text-xs text-stone-500">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border border-stone-200 mb-4" />

          <div className="flex items-center justify-between gap-4">
            <button type="submit" className="px-4 py-2 bg-charcoal-900 text-white">{loading ? 'Signing in…' : 'Sign in'}</button>
            <Link to="/forgot-password" className="text-sm text-stone-500">Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

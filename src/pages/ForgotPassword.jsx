import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email.'); return; }
    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) setSent(true);
    else setError(res.error || 'Something went wrong.');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-script text-4xl text-charcoal-800">Nura Bahar</Link>
          <p className="font-body text-sm text-stone-400 mt-2">Reset your password</p>
        </div>
        <div className="bg-white border border-stone-200 p-8">
          {sent ? (
            <div className="text-center py-4">
              <p className="font-body text-sm text-green-600 mb-4">
                ✓ If that email exists, a reset link was sent.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com" className="input-field" />
              </div>
              {error && <p className="font-body text-xs text-blush-500">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <div className="text-center">
                <Link to="/login" className="font-body text-xs text-stone-400 hover:text-charcoal-800 transition-colors">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setStatus('If that email exists, a reset link has been sent.');
    } catch (err) {
      setStatus('Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-6 bg-stone-50">
      <div className="px-6 mx-auto max-w-md">
        <h1 className="text-3xl italic font-display mb-4">Forgot password</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 border border-stone-100">
          {status && <div className="mb-3 text-sm text-stone-600">{status}</div>}
          <label className="block mb-2 text-xs text-stone-500">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border border-stone-200 mb-4" />
          <div className="flex items-center justify-between gap-4">
            <button type="submit" className="px-4 py-2 bg-charcoal-900 text-white">{loading ? 'Sending…' : 'Send reset link'}</button>
            <Link to="/login" className="text-sm text-stone-500">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

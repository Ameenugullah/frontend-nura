import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Linkedin, ArrowRight } from 'lucide-react';
import { subscribeNewsletter } from '../lib/api';

const quickLinks1 = [
  { label: 'Home',         to: '/' },
  { label: 'About Us',     to: '/faq' },
  { label: 'Contact Us',   to: '/faq' },
  { label: 'Track Order',  to: '/faq' },
  { label: 'Shipping & Returns', to: '/faq' },
];

const quickLinks2 = [
  { label: 'Women',        to: '/products?gender=women' },
  { label: 'Men',          to: '/products?gender=men' },
  { label: 'Boubous',      to: '/products?category=Boubous' },
  { label: 'Gowns',        to: '/products?category=Gowns' },
  { label: 'Ankara',       to: '/products?category=Ankara' },
  { label: 'Sale',         to: '/products?badge=Sale', className: 'text-blush-500' },
];

export default function Footer() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return;
    setStatus('loading');
    const result = await subscribeNewsletter(email);
    if (result.success) {
      setStatus('success');
      setEmail('');
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <footer className="bg-charcoal-900 text-stone-200">
      {/* newsletter strip */}
      <div className="border-b border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-1">Stay inspired</p>
            <h3 className="font-display text-2xl font-light italic text-white">Join Our Newsletter</h3>
          </div>
          {status === 'success' ? (
            <p className="font-body text-sm text-green-400">✓ You're subscribed!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-0 w-full sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 sm:w-64 bg-white/10 border border-white/20 text-white text-sm font-body px-4 py-3 placeholder-stone-500 focus:outline-none focus:border-white/50 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-blush-500 hover:bg-blush-600 text-white px-5 py-3 font-body text-sm font-medium transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* main footer grid */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* brand */}
        <div>
          <span className="font-script text-3xl text-white block mb-4">Nura Bahar</span>
          <p className="font-body text-sm text-stone-400 leading-relaxed mb-6">
            Born in Kano, Nigeria. Premium Nigerian fashion — boubous, gowns, ankara & menswear — crafted with heritage and love.
          </p>
          <div className="flex gap-3">
            {[
              { icon: Facebook,  href: 'https://facebook.com' },
              { icon: Twitter,   href: 'https://twitter.com' },
              { icon: Instagram, href: 'https://instagram.com' },
              { icon: Linkedin,  href: 'https://linkedin.com' },
            ].map(({ icon: Icon, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-blush-500 flex items-center justify-center transition-colors duration-200">
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* quick links 1 */}
        <div>
          <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-5">Quick Links</h4>
          <ul className="space-y-3">
            {quickLinks1.map(l => (
              <li key={l.label}>
                <Link to={l.to} className="font-body text-sm text-stone-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* quick links 2 / categories */}
        <div>
          <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-5">Categories</h4>
          <ul className="space-y-3">
            {quickLinks2.map(l => (
              <li key={l.label}>
                <Link to={l.to} className={`font-body text-sm hover:text-white transition-colors flex items-center gap-1.5 group ${l.className || 'text-stone-400'}`}>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div>
          <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-5">Contact Us</h4>
          <ul className="space-y-3 font-body text-sm text-stone-400">
            <li>Kano, Nigeria</li>
            <li>
              <a href="tel:+2348000000000" className="hover:text-white transition-colors">+234 800 000 0000</a>
            </li>
            <li>
              <a href="mailto:hello@nurabahar.ng" className="hover:text-white transition-colors">hello@nurabahar.ng</a>
            </li>
            <li className="pt-2">
              <p className="text-stone-500 text-xs">Mon – Sat: 9am – 6pm WAT</p>
            </li>
          </ul>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-stone-500">
            © {new Date().getFullYear()} Nura Bahar Nigeria. All rights reserved.
          </p>
          {/* payment icons */}
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'Paystack', 'Transfer'].map(p => (
              <span key={p} className="font-body text-[10px] font-semibold text-stone-400 border border-white/10 bg-white/5 px-2 py-0.5">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

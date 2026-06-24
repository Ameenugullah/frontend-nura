import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Linkedin, ArrowRight } from 'lucide-react';
import { subscribeNewsletter } from '../lib/api';
import { NAV_SECTIONS } from '../lib/categories';

const quickLinks1 = [
  { label: 'Home',         to: '/' },
  { label: 'About Us',     to: '/faq' },
  { label: 'Contact Us',   to: '/faq' },
  { label: 'Track Order',  to: '/faq' },
  { label: 'Shipping & Returns', to: '/faq' },
];

// FIX: added "Fragrance" so the footer's category list matches the navbar's
// three main sections (Women / Men / Fragrance) exactly.
// FIX: Categories now show ONLY the three parent/root sections — Women,
// Men, Fragrance — generated directly from the shared NAV_SECTIONS taxonomy
// so the footer can never list a stray sub-category (Boubous, Gowns,
// Perfume, etc.) or drift out of sync with the navbar again. Sub-categories
// belong under their parent section's own product page, not flattened here.
// The "Sale" link has been removed site-wide per request.
const categoryLinks = NAV_SECTIONS.map(section => ({
  label: section.label,
  to: `/products?section=${section.key}`,
}));

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
      <div className="py-10 border-b border-white/10">
        <div className="flex flex-col items-center justify-between gap-6 px-6 mx-auto max-w-7xl sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-1">Stay inspired</p>
            <h3 className="text-2xl italic font-light text-white font-display">Join Our Newsletter</h3>
          </div>
          {status === 'success' ? (
            <p className="text-sm text-green-400 font-body">✓ You're subscribed!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full gap-0 sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 text-sm text-white transition-colors border sm:w-64 bg-white/10 border-white/20 font-body placeholder-stone-500 focus:outline-none focus:border-white/50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-5 py-3 text-sm font-medium text-white transition-colors bg-blush-500 hover:bg-blush-600 font-body disabled:opacity-50"
              >
                {status === 'loading' ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* main footer grid */}
      <div className="grid grid-cols-1 gap-10 px-6 mx-auto max-w-7xl py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* brand */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <span className="block mb-4 text-3xl text-white font-script">Nura Bahar</span>
          <p className="mb-6 text-sm leading-relaxed font-body text-stone-400">
            Born in Kano, Nigeria. Premium Nigerian fashion — boubous, gowns, ankara & menswear — crafted with heritage and love.
          </p>
          <div className="flex justify-center gap-3 sm:justify-start">
            {[
              { icon: Facebook,  href: 'https://facebook.com' },
              { icon: Twitter,   href: 'https://twitter.com' },
              { icon: Instagram, href: 'https://instagram.com' },
              { icon: Linkedin,  href: 'https://linkedin.com' },
            ].map(({ icon: Icon, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center transition-colors duration-200 rounded-full w-9 h-9 bg-white/10 hover:bg-blush-500">
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* quick links 1 */}
        <div className="text-center sm:text-left">
          <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-5">Quick Links</h4>
          <ul className="space-y-3">
            {quickLinks1.map(l => (
              <li key={l.label}>
                <Link to={l.to} className="font-body text-sm text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                  <ArrowRight size={12} className="-ml-4 transition-opacity opacity-0 group-hover:opacity-100 group-hover:ml-0 hidden sm:block" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* categories — Women / Men / Fragrance only (parent sections) */}
        <div className="text-center sm:text-left">
          <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-5">Categories</h4>
          <ul className="space-y-3">
            {categoryLinks.map(l => (
              <li key={l.label}>
                <Link to={l.to} className="font-body text-sm text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                  <ArrowRight size={12} className="-ml-4 transition-opacity opacity-0 group-hover:opacity-100 group-hover:ml-0 hidden sm:block" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div className="text-center sm:text-left">
          <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-5">Contact Us</h4>
          <ul className="space-y-3 text-sm font-body text-stone-400">
            <li>Kano, Nigeria</li>
            <li>
              <a href="tel:+2348000000000" className="transition-colors hover:text-white">+234 800 000 0000</a>
            </li>
            <li>
              <a href="mailto:hello@nurabahar.ng" className="transition-colors hover:text-white">hello@nurabahar.ng</a>
            </li>
            <li className="pt-2">
              <p className="text-xs text-stone-500">Mon – Sat: 9am – 6pm WAT</p>
            </li>
          </ul>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-white/10">
        <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 mx-auto max-w-7xl sm:flex-row text-center sm:text-left">
          <p className="text-xs font-body text-stone-500">
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
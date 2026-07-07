import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, ArrowRight } from 'lucide-react';
import { subscribeNewsletter } from '../lib/api';
import { NAV_SECTIONS } from '../lib/categories';

function TikTokIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

const quickLinks = [
  { label: 'Home',              to: '/' },
  { label: 'About Us',          to: '/about' },
  { label: 'Contact Us',        to: '/contact' },
  { label: 'Track Order',       to: '/faq' },
  { label: 'Shipping & Returns',to: '/faq' },
];

const categoryLinks = NAV_SECTIONS.map(s => ({
  label: s.label,
  to:    `/products?section=${s.key}`,
}));

const socials = [
  { icon: Twitter,   href: 'https://twitter.com/nurabaharng',               label: 'Twitter' },
  { icon: Instagram, href: 'https://www.instagram.com/nura_bahar.ng',       label: 'Instagram' },
  { icon: TikTokIcon,href: 'https://www.tiktok.com/@nura_bahar.ng',         label: 'TikTok' },
];

export default function Footer() {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState('idle');

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


      <div className="grid grid-cols-1 gap-10 px-6 mx-auto max-w-7xl py-14 sm:grid-cols-2 lg:grid-cols-4">


        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <span className="block mb-4 text-3xl text-white font-script">Nura Bahar</span>
          <p className="mb-6 text-sm leading-relaxed font-body text-stone-400">
            Born in Kano, Nigeria. Premium Nigerian fashion — boubous, gowns, ankara & menswear — crafted with heritage and love.
          </p>
          <div className="flex justify-center gap-3 sm:justify-start">
            {socials.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center transition-colors duration-200 rounded-full w-9 h-9 bg-white/10 hover:bg-blush-500">
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>


        <div className="text-center sm:text-left">
          <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-5">Quick Links</h4>
          <ul className="space-y-3">
            {quickLinks.map(l => (
              <li key={l.label}>
                <Link to={l.to}
                  className="font-body text-sm text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                  <ArrowRight size={12} className="hidden -ml-4 transition-opacity opacity-0 group-hover:opacity-100 group-hover:ml-0 sm:block" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>


        <div className="text-center sm:text-left">
          <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-5">Categories</h4>
          <ul className="space-y-3">
            {categoryLinks.map(l => (
              <li key={l.label}>
                <Link to={l.to}
                  className="font-body text-sm text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                  <ArrowRight size={12} className="hidden -ml-4 transition-opacity opacity-0 group-hover:opacity-100 group-hover:ml-0 sm:block" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>


        <div className="text-center sm:text-left">
          <h4 className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-5">Contact Us</h4>
          <ul className="space-y-3 text-sm font-body text-stone-400">
            <li className="leading-relaxed">
              Maiduguri Road, Opposite Chicken Flavour,<br />
              Kwanar Maggi, Dangyatin Plaza,<br />
              Shop No. 7, Kano
            </li>
            <li>
              <a href="tel:+2347040212991" className="transition-colors hover:text-white">+234 704 021 2991</a>
            </li>
            <li>
              <a href="mailto:Nuraarabi@yahoo.com" className="transition-colors hover:text-white">Nuraarabi@yahoo.com</a>
            </li>
            <li className="pt-2">
              <p className="text-xs text-stone-500">Mon – Sat: 9am – 6pm WAT</p>
            </li>
          </ul>
        </div>
      </div>


      <div className="border-t border-white/10">
        <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 mx-auto text-center max-w-7xl sm:flex-row sm:text-left">
          <p className="text-xs font-body text-stone-500">
            © {new Date().getFullYear()} Nura Bahar Nigeria. All rights reserved.
          </p>
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

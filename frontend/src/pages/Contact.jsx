import { useState } from 'react';
import { MapPin, Mail, Phone, Clock, MessageCircle, Instagram } from 'lucide-react';

const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP || '2347040212991';

export default function Contact() {
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, subject, message } = form;
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const text = [
      `📩 *New Contact Message — Nura Bahar Website*`,
      ``,
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Subject: ${subject || 'General Enquiry'}`,
      ``,
      `Message:`,
      message,
    ].join('\n');

    const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setStatus('sent');
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Hero */}
      <section className="px-6 py-16 text-center bg-charcoal-900">
        <p className="font-body text-[10px] tracking-[0.3em] uppercase text-blush-400 mb-3">Get In Touch</p>
        <h1 className="text-5xl italic font-light text-white font-display">Contact Us</h1>
        <p className="max-w-md mx-auto mt-4 text-sm font-body text-stone-400">
          We're always happy to help — whether it's a product question, an order enquiry, or just a hello.
        </p>
      </section>

      <section className="grid max-w-6xl gap-12 px-6 py-16 mx-auto lg:grid-cols-2">

        {/* Info */}
        <div className="space-y-8">
          <div>
            <h2 className="mb-6 text-3xl italic font-light font-display text-charcoal-800">Find Us</h2>
            <ul className="space-y-5">
              <li className="flex gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blush-50 shrink-0">
                  <MapPin size={16} className="text-blush-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="mb-1 text-xs tracking-wider uppercase font-body text-stone-400">Store Address</p>
                  <p className="text-sm leading-relaxed font-body text-charcoal-700">
                    Maiduguri Road, Opposite Chicken Flavour,<br />
                    Kwanar Maggi, Dangyatin Plaza,<br />
                    Shop No. 7, Kano, Nigeria
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blush-50 shrink-0">
                  <Mail size={16} className="text-blush-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="mb-1 text-xs tracking-wider uppercase font-body text-stone-400">Email</p>
                  <a href="mailto:Nuraarabi@yahoo.com"
                    className="text-sm transition-colors font-body text-charcoal-700 hover:text-blush-500">
                    Nuraarabi@yahoo.com
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blush-50 shrink-0">
                  <Phone size={16} className="text-blush-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="mb-1 text-xs tracking-wider uppercase font-body text-stone-400">Phone / WhatsApp</p>
                  <a href="tel:+2347040212991"
                    className="text-sm transition-colors font-body text-charcoal-700 hover:text-blush-500">
                    +234 704 021 2991
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blush-50 shrink-0">
                  <Clock size={16} className="text-blush-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="mb-1 text-xs tracking-wider uppercase font-body text-stone-400">Opening Hours</p>
                  <p className="text-sm font-body text-charcoal-700">Mon – Sat: 9:00 AM – 6:00 PM WAT</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick contact buttons */}
          <div className="pt-4 space-y-3 border-t border-stone-200">
            <p className="mb-3 text-xs tracking-wider uppercase font-body text-stone-400">Quick Contact</p>
            <a
              href={`https://wa.me/${ADMIN_WHATSAPP}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 transition-colors border border-green-200 bg-green-50 hover:bg-green-100"
            >
              <MessageCircle size={18} className="text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-700 font-body">Chat on WhatsApp</p>
                <p className="text-xs text-green-600 font-body">Usually replies within minutes</p>
              </div>
            </a>
            <a
              href="https://www.instagram.com/nura_bahar.ng"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 transition-colors border bg-stone-50 border-stone-200 hover:bg-stone-100"
            >
              <Instagram size={18} className="text-charcoal-700" />
              <div>
                <p className="text-sm font-semibold font-body text-charcoal-800">@nura_bahar.ng</p>
                <p className="text-xs font-body text-stone-400">Follow us on Instagram</p>
              </div>
            </a>
          </div>
        </div>

        {/* Contact form */}
        <div className="p-8 bg-white border border-stone-200">
          <h2 className="mb-6 text-2xl font-light font-display text-charcoal-800">Send a Message</h2>
          {status === 'sent' ? (
            <div className="py-12 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-green-50">
                <MessageCircle size={22} className="text-green-600" />
              </div>
              <p className="text-sm font-medium font-body text-charcoal-700">Message sent via WhatsApp!</p>
              <p className="mt-1 text-xs font-body text-stone-400">We'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Name *</label>
                  <input value={form.name} onChange={e => update('name', e.target.value)}
                    placeholder="Fatima Abubakar" className="input-field" required />
                </div>
                <div>
                  <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="fatima@example.com" className="input-field" required />
                </div>
              </div>
              <div>
                <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Subject</label>
                <input value={form.subject} onChange={e => update('subject', e.target.value)}
                  placeholder="Order enquiry, product question…" className="input-field" />
              </div>
              <div>
                <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Message *</label>
                <textarea rows={5} value={form.message} onChange={e => update('message', e.target.value)}
                  placeholder="How can we help you?" className="resize-none input-field" required />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3.5">
                Send via WhatsApp
              </button>
              <p className="font-body text-[10px] text-stone-400 text-center">
                This will open WhatsApp with your message pre-filled.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

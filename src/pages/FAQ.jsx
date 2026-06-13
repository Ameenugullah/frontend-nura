import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  { q: 'How do I place an order?', a: 'Browse our collections, add items to your cart, and proceed to checkout. You can pay via Paystack (card/bank transfer) or send your order directly to our WhatsApp for manual processing.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major debit/credit cards, bank transfers, and USSD via Paystack. You can also order via WhatsApp and pay via bank transfer directly to us.' },
  { q: 'How does WhatsApp payment work?', a: 'Select "Pay via WhatsApp" at checkout. Your order details will be sent to our admin WhatsApp number. We\'ll confirm your order and send you payment details (bank account) within minutes.' },
  { q: 'Do you offer free shipping?', a: 'Yes! All orders over ₦30,000 qualify for free nationwide delivery. Orders below ₦30,000 attract a flat ₦2,500 shipping fee.' },
  { q: 'How long does delivery take?', a: 'Kano deliveries: 1–2 business days. Lagos, Abuja, Port Harcourt: 2–4 business days. Other states: 3–7 business days.' },
  { q: 'Can I return or exchange an item?', a: 'Yes, we accept returns and exchanges within 7 days of delivery. Items must be unworn, unwashed, and in original packaging. Contact us via WhatsApp to initiate a return.' },
  { q: 'How do I know my size?', a: 'We follow standard Nigerian sizing. Our size guide is available on each product page. If you\'re between sizes, we recommend sizing up. For custom sizing, contact us via WhatsApp.' },
  { q: 'Are the fabrics authentic?', a: 'Absolutely. All fabrics are sourced directly from trusted Nigerian fabric markets and artisans. Our embroidery and finishing are done locally in Nigeria.' },
  { q: 'Do you offer custom/bespoke orders?', a: 'Yes! We take custom orders for bulk purchases and bespoke garments. Contact us via WhatsApp with your requirements and we\'ll provide a quote within 24 hours.' },
  { q: 'How do I track my order?', a: 'Once your order ships, we\'ll send your tracking number via email and WhatsApp. You can also contact us anytime for updates.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-stone-50 pt-6">
      <div className="max-w-3xl mx-auto px-6 pb-20">
        {/* header */}
        <div className="text-center mb-14">
          <span className="tag-dark block mb-3">Help & Support</span>
          <h1 className="font-display text-4xl sm:text-5xl text-charcoal-800 font-light italic mb-4">
            Frequently Asked<br />Questions
          </h1>
          <p className="font-body text-sm text-stone-500">
            Can't find an answer?{' '}
            <a
              href={`https://wa.me/${import.meta.env.VITE_ADMIN_WHATSAPP || '2348000000000'}`}
              target="_blank" rel="noopener noreferrer"
              className="text-blush-500 hover:text-blush-600 underline underline-offset-2 transition-colors"
            >
              Chat with us on WhatsApp
            </a>
          </p>
        </div>

        {/* accordion */}
        <div className="space-y-0">
          {faqs.map((item, i) => (
            <div key={i} className="border-b border-stone-200">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4"
              >
                <span className="font-body text-sm font-medium text-charcoal-800 pr-4">{item.q}</span>
                {open === i
                  ? <ChevronUp size={16} className="shrink-0 text-blush-500" />
                  : <ChevronDown size={16} className="shrink-0 text-stone-400" />}
              </button>
              {open === i && (
                <div className="pb-5 animate-fade-in">
                  <p className="font-body text-sm text-stone-500 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-charcoal-900 p-8 text-center">
          <h3 className="font-display text-2xl text-white font-light italic mb-3">Still have questions?</h3>
          <p className="font-body text-sm text-stone-400 mb-6">Our team is available Mon–Sat, 9am–6pm WAT</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/${import.meta.env.VITE_ADMIN_WHATSAPP || '2348000000000'}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-outline-white"
            >
              WhatsApp Us
            </a>
            <Link to="/products" className="btn-outline-white">Browse Products</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

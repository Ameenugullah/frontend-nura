import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Star, Truck, Shield } from 'lucide-react';

const values = [
  { icon: Heart,   title: 'Heritage & Pride',       body: 'Every piece we craft honours the rich textile traditions of Northern Nigeria — from the flowing boubous of Kano to bold Ankara prints that speak across generations.' },
  { icon: Star,    title: 'Uncompromising Quality', body: 'We source only premium fabrics and work with skilled artisans. Each garment is inspected before it leaves our hands, because your satisfaction is non-negotiable.' },
  { icon: Truck,   title: 'Nationwide Reach',       body: 'Born in Kano, loved across Nigeria. We deliver to every state, bringing authentic Nigerian fashion directly to your door.' },
  { icon: Shield,  title: 'Honest Commerce',        body: 'No hidden fees. No inflated prices. Transparent checkout, verified payments, and a 7-day return policy — because trust is the foundation of everything we do.' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-stone-50">

      {/* Hero */}
      <section className="relative py-24 overflow-hidden bg-charcoal-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full w-96 h-96 bg-blush-500" />
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 rounded-full w-96 h-96 bg-gold-400" />
        </div>
        <div className="relative max-w-4xl px-6 mx-auto text-center">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-blush-400 mb-4">Our Story</p>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed font-body text-stone-300">
            A Nigerian fashion brand inspired by the grace of Sudanese heritage.<br />
            Where modesty meets elegance through thoughtfully crafted designs.<br />
            Celebrating timeless beauty, individuality, and refined style since 2017.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl px-6 py-20 mx-auto">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="block mb-4 tag-dark">Who We Are</span>
            <h2 className="mb-6 text-4xl italic font-light leading-snug font-display text-charcoal-800">
              More Than a Fashion Store
            </h2>
            <div className="space-y-4 text-sm leading-relaxed font-body text-charcoal-700/80">
              <p>
                Nura Bahar began in the heart of Kano — Nigeria's fashion and textile capital — with a vision to bring the elegance of traditional Nigerian attire to modern wardrobes across the country and beyond.
              </p>
              <p>
                Our name, <em>Nura Bahar</em>, reflects light and brilliance. It's the feeling we want every customer to carry when they wear our pieces — confident, radiant, and rooted in culture.
              </p>
              <p>
                From luxurious satin boubous and tailored kaftans to bold Ankara two-pieces and signature fragrances, every product in our collection is chosen or crafted with intention. We don't stock what is merely trendy — we curate what is timeless.
              </p>
            </div>
          </div>
          <div className="bg-stone-200 aspect-[4/5] flex items-center justify-center">
            <span className="font-script text-8xl text-stone-400">NB</span>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="grid max-w-5xl gap-8 px-6 mx-auto md:grid-cols-2">
          <div className="p-8 border border-stone-200">
            <p className="block mb-3 tag">Our Mission</p>
            <h3 className="mb-4 text-2xl font-light font-display text-charcoal-800">To dress Nigeria in its own identity.</h3>
            <p className="text-sm leading-relaxed font-body text-charcoal-700/70">
              We exist to make authentic Nigerian fashion accessible, beautiful, and aspirational. Through curated collections, fair prices, and reliable nationwide delivery, we help every Nigerian express who they are through what they wear.
            </p>
          </div>
          <div className="p-8 border border-stone-200 bg-stone-50">
            <p className="block mb-3 tag">Our Vision</p>
            <h3 className="mb-4 text-2xl font-light font-display text-charcoal-800">The first name in Nigerian fashion commerce.</h3>
            <p className="text-sm leading-relaxed font-body text-charcoal-700/70">
              We envision Nura Bahar as the most trusted and celebrated Nigerian fashion brand — a name synonymous with quality, authenticity, and pride. A brand our grandchildren will still wear.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl px-6 py-20 mx-auto">
        <div className="mb-12 text-center">
          <span className="block mb-2 tag-dark">What Drives Us</span>
          <h2 className="text-4xl italic font-light font-display text-charcoal-800">Our Core Values</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, body }) => (
            <div key={title} className="p-6 transition-colors bg-white border border-stone-200 hover:border-blush-300">
              <div className="flex items-center justify-center w-10 h-10 mb-4 bg-blush-50">
                <Icon size={18} className="text-blush-500" strokeWidth={1.5} />
              </div>
              <h4 className="mb-2 text-sm font-semibold font-body text-charcoal-800">{title}</h4>
              <p className="text-xs leading-relaxed font-body text-stone-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-6 py-16 bg-charcoal-900">
        <div className="max-w-4xl mx-auto text-center">
          <span className="block mb-4 tag-gold">Why Nura Bahar</span>
          <h2 className="mb-10 text-4xl italic font-light text-white font-display">The Nura Bahar Difference</h2>
          <div className="grid gap-6 text-left sm:grid-cols-3">
            {[
              { n: '01', t: 'Authentic Craft', b: 'Every boubou, every dress, every fragrance is chosen for its cultural authenticity and quality — not just its popularity.' },
              { n: '02', t: 'Verified Payments', b: 'All online transactions are verified server-side via Paystack and Moniepoint. Your money is safe with us.' },
              { n: '03', t: 'Real Customer Care', b: 'Our WhatsApp line is staffed by humans, not bots. We respond personally to every message, every query, every concern.' },
            ].map(({ n, t, b }) => (
              <div key={n} className="p-6 border border-white/10 bg-white/5">
                <span className="text-3xl font-light font-display text-blush-400/40">{n}</span>
                <h4 className="mt-2 mb-2 text-sm font-semibold text-white font-body">{t}</h4>
                <p className="text-xs leading-relaxed font-body text-stone-400">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="mb-4 text-4xl italic font-light font-display text-charcoal-800">Ready to Explore?</h2>
        <p className="max-w-md mx-auto mb-8 text-sm font-body text-stone-500">
          Browse our latest collections and find a piece that speaks to you.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/products" className="inline-flex items-center gap-2 btn-primary">
            Shop Now <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-outline">Contact Us</Link>
        </div>
      </section>
    </div>
  );
}

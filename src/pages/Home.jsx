import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, RotateCcw, Lock, Star, Sparkles } from 'lucide-react';
import { featuredProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import MensCollection from '../components/MensCollection';
import Ticker from '../components/Ticker';

// ── hero slides ──────────────────────────────────────────────────────────────
const heroSlides = [
  {
    image: '/images/teal-satin-boubou-2.jpg',
    fallback: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    tag:     'New Collection — 2026',
    heading: 'MEGA\nCOLLECTION',
    sub:     'New Arrivals Summer 2026',
    cta:     'Shop Now',
  },
  {
    image: '/images/coral-cape-dress-1.jpg',
    fallback: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1400&q=80',
    tag:     'Nura Bahar Nigeria',
    heading: 'WEAR YOUR\nHERITAGE',
    sub:     'From Kano to the world — with love.',
    cta:     'Explore Now',
  },
];

const perks = [
  { icon: Truck,     label: 'Free Shipping & Returns',  sub: 'On orders over ₦30,000' },
  { icon: Lock,      label: 'Money Back Guarantee',     sub: 'Within 7 days' },
  { icon: Star,      label: 'Online Support 24/7',      sub: 'We reply on WhatsApp' },
  { icon: RotateCcw, label: 'Secure Payment',           sub: 'Paystack & bank transfer' },
];

const categoryBanners = [
  { label: 'WOMEN', letter: 'W', image: '/images/luna-dress-1.jpg',    fallback: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', href: '/products?gender=women' },
  { label: 'MEN',   letter: 'M', image: '/images/agbada-1.jpg',        fallback: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', href: '/products?gender=men' },
  { label: 'NEW',   letter: 'N', image: '/images/ankara-dress-1.jpg',  fallback: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80', href: '/products?badge=New' },
];

const testimonials = [
  { quote: 'The teal satin boubou is absolutely stunning. Everyone kept asking where I got it!', name: 'Aisha M.', location: 'Kano', stars: 5 },
  { quote: 'My Luna Dress fits like a dream. Quality beyond what I expected at this price.', name: 'Fatima A.', location: 'Lagos', stars: 5 },
  { quote: 'The Ankara bell-sleeve is a masterpiece. Fast delivery to Abuja too!', name: 'Zainab K.', location: 'Abuja', stars: 5 },
];

// scroll reveal hook
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.08 }
    );
    const el = ref.current;
    if (el) el.querySelectorAll('.animate-on-scroll').forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);
  const revealRef  = useScrollReveal();
  const scrollRef  = useRef(null);
  const slide      = heroSlides[heroIdx];

  // hero auto-advance
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  // featured carousel scroll state
  const onCarouselScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    onCarouselScroll();
    el.addEventListener('scroll', onCarouselScroll, { passive: true });
    return () => el.removeEventListener('scroll', onCarouselScroll);
  }, []);

  const scrollCarousel = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 300) + 20), behavior: 'smooth' });
  };

  return (
    <div ref={revealRef}>

      {/* ── HERO (Figma: full bleed, MEGA COLLECTION large type center-left) ── */}
      <section className="relative h-screen min-h-[560px] max-h-[900px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={slide.image}
            alt="Hero"
            className="w-full h-full object-cover transition-opacity duration-1000"
            onError={e => { e.target.onerror = null; e.target.src = slide.fallback; }}
          />
          {/* Figma: light vignette, type readable on left */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 via-stone-900/20 to-transparent" />
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
            <p className="font-body text-[11px] tracking-[0.3em] uppercase text-stone-300 mb-4 animate-fade-in">
              {slide.tag}
            </p>
            {/* Figma: giant display headline split across lines */}
            <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] text-white font-light leading-[0.95] whitespace-pre-line mb-6 animate-fade-up">
              {slide.heading}
            </h1>
            <p className="font-body text-base text-white/80 mb-10 max-w-xs animate-fade-up" style={{ animationDelay: '0.15s' }}>
              {slide.sub}
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/products" className="btn-outline-white">{slide.cta}</Link>
              <Link to="/products?badge=Sale" className="font-body text-sm text-white/70 hover:text-white underline underline-offset-4 self-center transition-colors">
                View Sale
              </Link>
            </div>
          </div>
        </div>

        {/* slide dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)}
              className={`transition-all duration-300 rounded-full ${i === heroIdx ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </section>

      {/* ── PERKS BAR (Figma: 4 icons inline) ── */}
      <section className="bg-white border-y border-stone-200 py-5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
            {perks.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-1 w-full sm:w-auto justify-center">
                <Icon size={20} className="text-charcoal-800 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="font-body text-xs font-semibold text-charcoal-800 tracking-wide">{label}</p>
                  <p className="font-body text-xs text-stone-400 hidden sm:block">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GENDER CATEGORY BANNERS (Figma: WOMEN / MEN / NEW 3-col) ── */}
      <section className="py-8 px-6 max-w-7xl mx-auto animate-on-scroll">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categoryBanners.map((cat) => (
            <Link key={cat.label} to={cat.href}
              className="relative overflow-hidden aspect-[3/4] group bg-stone-200">
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover product-card-image"
                onError={e => { e.target.onerror = null; e.target.src = cat.fallback; }}
                loading="lazy"
              />
              {/* Figma: big transparent letter behind the label */}
              <span className="absolute inset-0 flex items-center justify-center font-display text-[10rem] font-bold text-white/10 select-none pointer-events-none">
                {cat.letter}
              </span>
              <div className="absolute inset-0 bg-charcoal-900/20 group-hover:bg-charcoal-900/35 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-2xl text-white font-light tracking-widest mb-2">{cat.label}</h3>
                <span className="font-body text-xs text-white tracking-[0.2em] uppercase border-b border-white/60 pb-0.5">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── EDITORIAL SPLIT — "New Season Collection" (Figma layout) ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-0 items-stretch min-h-[480px]">
            {/* left: stacked images with circle badge */}
            <div className="relative animate-on-scroll">
              <div className="relative h-full min-h-[360px]">
                {/* rotating badge */}
                <div className="absolute top-6 left-6 w-20 h-20 z-10">
                  <div className="w-full h-full rounded-full border border-charcoal-800 flex items-center justify-center animate-spin-slow">
                    <svg viewBox="0 0 80 80" className="w-full h-full absolute">
                      <path id="circle-path" d="M40,40 m-30,0 a30,30 0 1,1 60,0 a30,30 0 1,1 -60,0" fill="none"/>
                      <text className="fill-charcoal-800" fontSize="8" fontFamily="DM Sans">
                        <textPath href="#circle-path" startOffset="0%">NEW ARRIVALS · REFRESH YOUR WARDROBE · </textPath>
                      </text>
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 h-full">
                  <img src="/images/luna-dress-1.jpg" alt="Collection"
                    className="w-full h-full object-cover col-span-1"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80'; }}
                  />
                  <img src="/images/coral-cape-dress-2.jpg" alt="Collection"
                    className="w-full h-full object-cover col-span-1"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80'; }}
                  />
                </div>
                {/* vertical label (Figma) */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-px hidden md:flex items-center">
                  <span className="font-body text-[9px] tracking-[0.4em] uppercase text-charcoal-700/40 rotate-90 origin-center whitespace-nowrap -translate-x-1/2">
                    Elevate Your Fashion Game
                  </span>
                </div>
              </div>
            </div>

            {/* right: text */}
            <div className="animate-on-scroll flex flex-col justify-center bg-stone-100 px-10 py-14 md:pl-14">
              <span className="tag block mb-4">New Season</span>
              <h2 className="font-display text-4xl sm:text-5xl text-charcoal-800 font-light italic leading-tight mb-6">
                New Season<br />Collection
              </h2>
              <div className="w-10 h-px bg-blush-500 mb-6" />
              <p className="font-body text-sm text-charcoal-700/70 leading-relaxed mb-8">
                Handcrafted Nigerian fashion for the modern woman and man. From luxurious satin boubous
                to bold Ankara prints — each piece celebrates heritage with contemporary elegance.
              </p>
              <Link to="/products" className="btn-primary self-start">Shop Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPRING COLLECTION banner (Figma: olive/taupe full-width) ── */}
      <section className="relative overflow-hidden">
        <div className="bg-taupe-700 py-14 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-6xl sm:text-8xl md:text-[10rem] text-white/30 font-bold leading-none mb-4 select-none">
              Spring Collection
            </h2>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS SECTION ── */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 animate-on-scroll">
            <span className="tag-dark block mb-2">New Items Added Every Week</span>
            <h2 className="font-display text-4xl sm:text-5xl text-charcoal-800 font-light italic">New Arrivals</h2>
          </div>

          {/* Women / Men tab */}
          <FeaturedTabCarousel />
        </div>
      </section>

      {/* ── TICKER 2 ── */}
      <Ticker
        items={['Pay with Paystack', 'WhatsApp ordering available', '30% off sale items', 'New arrivals weekly', 'Nationwide delivery', 'Trusted by 3,000+ customers']}
        bgClass="bg-charcoal-900"
        textClass="text-white/50"
      />

      {/* ── CASUAL / WOMEN COLLECTION ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 animate-on-scroll">
            <span className="tag-dark block mb-2">New Items Added Every Week</span>
            <h2 className="font-display text-4xl sm:text-5xl text-charcoal-800 font-light italic">Women's Picks</h2>
          </div>
          <WomensCarousel scrollRef={scrollRef} atStart={atStart} atEnd={atEnd} onScroll={scrollCarousel} />
          <div className="text-center mt-10">
            <Link to="/products?gender=women" className="btn-outline inline-flex items-center gap-2">
              Shop Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── MEN'S COLLECTION ── */}
      <MensCollection />

      {/* ── FULL BLEED BANNER (Figma: "SUMMER COLLECTION") ── */}
      <section className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src="/images/teal-satin-boubou-1.jpg"
          alt="Summer Collection"
          className="w-full h-full object-cover"
          onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=80'; }}
        />
        <div className="absolute inset-0 bg-charcoal-900/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-white/60 mb-3">Selected Just For You</p>
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl text-white font-light tracking-widest mb-4">
            SUMMER COLLECTION
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 font-body text-xs tracking-[0.2em] uppercase text-white/70 mb-6">
            {['Boubous', 'Gowns', 'Ankara', 'Perfumes', 'And Much More...'].map(c => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <Link to="/products" className="btn-outline-white">Shop Now</Link>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 bg-charcoal-900">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={14} className="text-gold-400" />
            <span className="tag-gold">What our customers say</span>
            <Sparkles size={14} className="text-gold-400" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-stone-50 font-light italic mb-12">
            Loved Across Nigeria
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="glass p-6 text-left animate-on-scroll">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-sm ${s <= t.stars ? 'text-amber-400' : 'text-stone-700'}`}>★</span>
                  ))}
                </div>
                <p className="font-body text-sm text-stone-300 leading-relaxed mb-4 italic">"{t.quote}"</p>
                <p className="font-body text-xs text-blush-400 font-medium">{t.name} · {t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM GRID (Figma) ── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-body text-xs tracking-[0.25em] uppercase text-stone-400 mb-8">Follow Us</p>
          <h3 className="font-display text-3xl text-charcoal-800 font-light italic mb-8">@NuraBaharNigeria</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
            {[
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
              'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80',
              'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=400&q=80',
              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
            ].map((src, i) => (
              <a key={i} href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="aspect-square overflow-hidden group bg-stone-100">
                <img src={src} alt={`Style ${i+1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function FeaturedTabCarousel() {
  const [tab, setTab] = useState('women');
  const products = featuredProducts.filter(p => p.gender === tab || tab === 'all');
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 280) + 20), behavior: 'smooth' });
  };

  return (
    <>
      {/* Women / Men tabs (Figma) */}
      <div className="flex items-center border-b border-stone-200 mb-8">
        {[['women','WOMEN'],['men','MEN']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`relative px-6 py-3 font-body text-sm font-medium tracking-wider transition-colors ${
              tab === val ? 'text-charcoal-900' : 'text-stone-400 hover:text-charcoal-700'
            }`}
          >
            {label}
            {tab === val && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-900" />}
          </button>
        ))}
        <div className="ml-auto flex gap-2 mb-1">
          <button onClick={() => scroll(-1)} className="w-8 h-8 border border-stone-200 flex items-center justify-center hover:border-charcoal-800 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => scroll(1)} className="w-8 h-8 border border-stone-200 flex items-center justify-center hover:border-charcoal-800 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div ref={scrollRef}
        className="flex gap-5 overflow-x-auto no-scrollbar pb-2"
        style={{ scrollSnapType: 'x mandatory' }}>
        {products.map(product => (
          <div key={product.id}
            className="flex-shrink-0 w-[80vw] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
            style={{ scrollSnapAlign: 'start' }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </>
  );
}

function WomensCarousel({ scrollRef, atStart, atEnd, onScroll }) {
  const womenProducts = featuredProducts.filter(p => p.gender === 'women');
  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-6">
        <button onClick={() => onScroll(-1)} disabled={atStart}
          className="w-8 h-8 border border-stone-200 flex items-center justify-center disabled:opacity-30 hover:border-charcoal-800 transition-colors">
          <ChevronLeft size={14} />
        </button>
        <button onClick={() => onScroll(1)} disabled={atEnd}
          className="w-8 h-8 border border-stone-200 flex items-center justify-center disabled:opacity-30 hover:border-charcoal-800 transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>
      <div ref={scrollRef}
        className="flex gap-5 overflow-x-auto no-scrollbar pb-2"
        style={{ scrollSnapType: 'x mandatory' }}>
        {womenProducts.map(product => (
          <div key={product.id}
            className="flex-shrink-0 w-[80vw] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
            style={{ scrollSnapAlign: 'start' }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </>
  );
}

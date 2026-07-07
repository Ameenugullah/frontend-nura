import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, RotateCcw, Lock, Star, Sparkles } from 'lucide-react';
import { getProducts } from '../lib/api';
import { matchesGender, isFragrance } from '../lib/categories';
import ProductCard from '../components/ProductCard';
import MensCollection from '../components/MensCollection';
import FragrancesCollection from '../components/FragrancesCollection';
import Ticker from '../components/Ticker';
import PromoVideoShowcase from '../components/PromoVideoShowcase';

const heroSlides = [
  {
    image:    '/images/IMG.png',
    fallback: '/images/placeholder-product.svg',
    tag:      'New Collection — 2026',
    heading:  'MEGA\nCOLLECTION',
    sub:      'New Arrivals Summer 2026',
    cta:      'Shop Now',
  },
  {
    image:    '/images/IMG_1753.jpeg',
    fallback: '/images/placeholder-product.svg',
    tag:      'Nura Bahar Nigeria',
    heading:  'WEAR YOUR\nHERITAGE',
    sub:      'From Kano to the world — with love.',
    cta:      'Explore Now',
  },
];

const perks = [
  { icon: Truck,     label: 'Free Shipping',         sub: 'Kano ₦200k · Nationwide ₦300k' },
  { icon: Lock,      label: 'Money Back Guarantee',  sub: 'Within 7 days' },
  { icon: Star,      label: 'Online Support 24/7',   sub: 'We reply on WhatsApp' },
  { icon: RotateCcw, label: 'Secure Payment',        sub: 'Paystack & bank transfer' },
];

const categoryBannersMeta = [
  { label: 'WOMEN',     letter: 'W', href: '/products?section=women',     sectionKey: 'women' },
  { label: 'MEN',       letter: 'M', href: '/products?section=men',       sectionKey: 'men' },
  { label: 'Fragrance', letter: 'F', href: '/products?section=fragrance', sectionKey: 'fragrance' },
];

const testimonials = [
  { quote: 'The teal satin boubou is absolutely stunning. Everyone kept asking where I got it!', name: 'Aisha M.', location: 'Kano', stars: 5 },
  { quote: 'My Luna Dress fits like a dream. Quality beyond what I expected at this price.', name: 'Fatima A.', location: 'Lagos', stars: 5 },
  { quote: 'The Ankara bell-sleeve is a masterpiece. Fast delivery to Abuja too!', name: 'Zainab K.', location: 'Abuja', stars: 5 },
];

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

function useAllProducts() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    let mounted = true;
    getProducts().then(items => {
      if (mounted) setProducts(items || []);
    }).catch(() => {
      if (mounted) setProducts([]);
    });
    return () => { mounted = false; };
  }, []);

  const bannerImages = useMemo(() => ({
    women:     products.find(p => matchesGender(p, 'women'))?.images?.[0]  || null,
    men:       products.find(p => matchesGender(p, 'men'))?.images?.[0]    || null,
    fragrance: products.find(p => isFragrance(p))?.images?.[0]            || null,
  }), [products]);

  const featuredImages = useMemo(() =>
    products
      .filter(p => p.featured && p.images?.[0])
      .slice(0, 2)
      .map(p => p.images[0]),
  [products]);

  return { products, bannerImages, featuredImages };
}

export default function Home() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);
  const revealRef = useScrollReveal();
  const scrollRef = useRef(null);
  const { products: allProducts, bannerImages, featuredImages } = useAllProducts();
  const slide = heroSlides[heroIdx];

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

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

      <section className="relative h-screen min-h-[560px] max-h-[900px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={slide.image}
            alt="Hero"
            className="object-cover w-full h-full transition-opacity duration-1000"
            onError={e => { e.target.onerror = null; e.target.src = slide.fallback; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 via-stone-900/20 to-transparent" />
        </div>
        <div className="relative z-10 flex items-center h-full">
          <div className="w-full px-6 mx-auto max-w-7xl sm:px-10">
            <p className="font-body text-[11px] tracking-[0.3em] uppercase text-stone-300 mb-4 animate-fade-in">{slide.tag}</p>
            <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] text-white font-light leading-[0.95] whitespace-pre-line mb-6 animate-fade-up">{slide.heading}</h1>
            <p className="max-w-xs mb-10 text-base font-body text-white/80 animate-fade-up" style={{ animationDelay: '0.15s' }}>{slide.sub}</p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/products" className="btn-outline-white">{slide.cta}</Link>
            </div>
          </div>
        </div>
        <div className="absolute z-10 flex gap-3 -translate-x-1/2 bottom-8 left-1/2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)}
              className={'transition-all duration-300 rounded-full ' + (i === heroIdx ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70')} />
          ))}
        </div>
      </section>

      <section className="py-5 bg-white border-y border-stone-200">
        <div className="px-6 mx-auto max-w-7xl">
          <PerksSlider />
          <div className="hidden sm:flex items-center justify-between gap-4 divide-x divide-stone-100">
            {perks.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center justify-center w-full gap-3 px-4 py-1">
                <Icon size={20} className="text-charcoal-800 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-semibold tracking-wide font-body text-charcoal-800">{label}</p>
                  <p className="text-xs font-body text-stone-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-8 mx-auto max-w-7xl animate-on-scroll">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {categoryBannersMeta.map((cat) => {
            const img = bannerImages[cat.sectionKey];
            return (
              <Link key={cat.label} to={cat.href} className="relative overflow-hidden aspect-[3/4] group bg-stone-200">
                {img ? (
                  <img src={img} alt={cat.label}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-300 animate-pulse" />
                )}
                <span className="absolute inset-0 flex items-center justify-center font-display text-[10rem] font-bold text-white/10 select-none pointer-events-none">{cat.letter}</span>
                <div className="absolute inset-0 transition-colors duration-300 bg-charcoal-900/20 group-hover:bg-charcoal-900/35" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="mb-2 text-2xl font-light tracking-widest text-white font-display">{cat.label}</h3>
                  <span className="font-body text-xs text-white tracking-[0.2em] uppercase border-b border-white/60 pb-0.5">Shop Now</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Ticker />

      <section className="px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-0 items-stretch min-h-[480px]">
            <div className="relative animate-on-scroll">
              <div className="relative h-full min-h-[360px]">
                <div className="absolute z-10 w-20 h-20 top-6 left-6">
                  <div className="flex items-center justify-center w-full h-full border rounded-full border-charcoal-800 animate-spin-slow">
                    <svg viewBox="0 0 80 80" className="absolute w-full h-full">
                      <path id="circle-path" d="M40,40 m-30,0 a30,30 0 1,1 60,0 a30,30 0 1,1 -60,0" fill="none"/>
                      <text className="fill-charcoal-800" fontSize="8" fontFamily="DM Sans">
                        <textPath href="#circle-path" startOffset="0%">NEW ARRIVALS · REFRESH YOUR WARDROBE · </textPath>
                      </text>
                    </svg>
                  </div>
                </div>
                <div className="grid h-full grid-cols-2 gap-2">
                  {featuredImages[0] ? (
                    <img src={featuredImages[0]} alt="Featured" className="object-cover w-full h-full col-span-1" loading="lazy" />
                  ) : (
                    <div className="w-full h-full col-span-1 bg-stone-200 animate-pulse" />
                  )}
                  {featuredImages[1] ? (
                    <img src={featuredImages[1]} alt="Featured" className="object-cover w-full h-full col-span-1" loading="lazy" />
                  ) : (
                    <div className="w-full h-full col-span-1 bg-stone-300 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center px-10 py-12 animate-on-scroll bg-stone-100 md:pl-14">
              <span className="block mb-4 tag">New Season</span>
              <h2 className="mb-6 text-4xl italic font-light leading-tight font-display sm:text-5xl text-charcoal-800">New Season<br />Collection</h2>
              <div className="w-10 h-px mb-6 bg-blush-500" />
              <p className="mb-8 text-sm leading-relaxed font-body text-charcoal-700/70">
                Handcrafted Nigerian fashion for the modern woman and man. From luxurious satin boubous to bold Ankara prints — each piece celebrates heritage with contemporary elegance.
              </p>
              <Link to="/products" className="self-start btn-primary">Shop Now</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-stone-50">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="mb-8 text-center animate-on-scroll">
            <span className="block mb-2 tag-dark">New Items Added Every Week</span>
            <h2 className="text-4xl italic font-light font-display sm:text-5xl text-charcoal-800">New Arrivals</h2>
          </div>
          <FeaturedTabCarousel allProducts={allProducts} />
        </div>
      </section>

      <Ticker
        items={['Secure payment via Paystack', 'New arrivals weekly', 'Nationwide delivery', 'Trusted by 3,000+ customers']}
        bgClass="bg-charcoal-900"
        textClass="text-white/50"
      />

      <section className="py-16 bg-white">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="mb-10 text-center animate-on-scroll">
            <span className="block mb-2 tag-dark">New Items Added Every Week</span>
            <h2 className="text-4xl italic font-light font-display sm:text-5xl text-charcoal-800">Women's Picks</h2>
          </div>
          <WomensCarousel allProducts={allProducts} scrollRef={scrollRef} atStart={atStart} atEnd={atEnd} onScroll={scrollCarousel} />
          <div className="mt-10 text-center">
            <Link to="/products?section=women" className="inline-flex items-center gap-2 btn-outline">Shop Now <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <MensCollection allProducts={allProducts} />
      <FragrancesCollection allProducts={allProducts} />

      <section className="py-16 bg-charcoal-900">
        <div className="max-w-5xl px-6 mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={14} className="text-gold-400" />
            <span className="tag-gold">What our customers say</span>
            <Sparkles size={14} className="text-gold-400" />
          </div>
          <h2 className="mb-12 text-3xl italic font-light font-display md:text-4xl text-stone-50">Loved Across Nigeria</h2>
          <div className="hidden gap-6 sm:grid sm:grid-cols-3">
            {testimonials.map(t => (
              <div key={t.name} className="p-6 text-left glass animate-on-scroll">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(s => <span key={s} className={'text-sm ' + (s <= t.stars ? 'text-amber-400' : 'text-stone-700')}>★</span>)}
                </div>
                <p className="mb-4 text-sm italic leading-relaxed font-body text-stone-300">"{t.quote}"</p>
                <p className="text-xs font-medium font-body text-blush-400">{t.name} · {t.location}</p>
              </div>
            ))}
          </div>
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      <PromoVideoShowcase />
    </div>
  );
}

function PerksSlider() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => (i + 1) % perks.length);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="sm:hidden overflow-hidden h-10">
      <div
        className="flex will-change-transform"
        style={{
          transform: `translateX(-${idx * 100}%)`,
          transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        {perks.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="min-w-full flex items-center justify-center gap-3">
            <Icon size={20} className="text-charcoal-800 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-semibold tracking-wide font-body text-charcoal-800">{label}</p>
              <p className="text-xs font-body text-stone-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialCarousel({ testimonials }) {
  const [idx, setIdx]    = useState(0);
  const startX           = useRef(null);
  const timerRef         = useRef(null);
  const count            = testimonials.length;

  const goTo = useCallback((i) => {
    setIdx(((i % count) + count) % count);
  }, [count]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIdx(prev => (prev + 1) % count);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [count]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx(prev => (prev + 1) % count);
    }, 4000);
  };

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(idx + (diff > 0 ? 1 : -1)); resetTimer(); }
    startX.current = null;
  };

  return (
    <div className="sm:hidden">
      <div className="overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div
          className="flex will-change-transform"
          style={{
            transform:  `translateX(-${idx * 100}%)`,
            transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        >
          {testimonials.map(t => (
            <div key={t.name} className="min-w-full px-1">
              <div className="p-6 text-left glass">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={'text-sm ' + (s <= t.stars ? 'text-amber-400' : 'text-stone-700')}>★</span>
                  ))}
                </div>
                <p className="mb-4 text-sm italic leading-relaxed font-body text-stone-300">"{t.quote}"</p>
                <p className="text-xs font-medium font-body text-blush-400">{t.name} · {t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetTimer(); }}
            aria-label={`Testimonial ${i + 1}`}
            className={`transition-all duration-200 rounded-full ${
              i === idx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function FeaturedTabCarousel({ allProducts }) {
  const [tab, setTab] = useState('women');
  const scrollRef = useRef(null);

  const products = useMemo(() =>
    tab === 'fragrance'
      ? allProducts.filter(isFragrance)
      : allProducts.filter(p => matchesGender(p, tab)),
  [tab, allProducts]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * ((el.firstElementChild?.offsetWidth ?? 280) + 20), behavior: 'smooth' });
  };

  return (
    <>
      <div className="flex items-center mb-8 border-b border-stone-200">
        {[['women','WOMEN'],['men','MEN'],['fragrance','FRAGRANCE']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={'relative px-6 py-3 font-body text-sm font-medium tracking-wider transition-colors ' + (
              tab === val ? 'text-charcoal-900' : 'text-stone-400 hover:text-charcoal-700'
            )}>
            {label}
            {tab === val && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-900" />}
          </button>
        ))}
        <div className="flex gap-2 mb-1 ml-auto">
          <button onClick={() => scroll(-1)} className="flex items-center justify-center w-8 h-8 transition-colors border border-stone-200 hover:border-charcoal-800"><ChevronLeft size={14} /></button>
          <button onClick={() => scroll(1)}  className="flex items-center justify-center w-8 h-8 transition-colors border border-stone-200 hover:border-charcoal-800"><ChevronRight size={14} /></button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-10 text-center">
          <p className="mb-3 text-xs font-body text-stone-400">No {tab} products yet.</p>
          <Link to={`/products?section=${tab}`} className="text-xs underline transition-colors font-body text-blush-500 hover:text-blush-600 underline-offset-2">Browse {tab}</Link>
        </div>
      ) : (
        <div ref={scrollRef} className="flex gap-5 pb-2 overflow-x-auto no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
          {products.map(product => (
            <div key={product.id} className="flex-shrink-0 w-[80vw] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]" style={{ scrollSnapAlign: 'start' }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function WomensCarousel({ allProducts, scrollRef, atStart, atEnd, onScroll }) {
  const women = useMemo(() => allProducts.filter(p => matchesGender(p, 'women')), [allProducts]);

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-6">
        <button onClick={() => onScroll(-1)} disabled={atStart}
          className="flex items-center justify-center w-8 h-8 transition-colors border border-stone-200 disabled:opacity-30 hover:border-charcoal-800"><ChevronLeft size={14} /></button>
        <button onClick={() => onScroll(1)} disabled={atEnd}
          className="flex items-center justify-center w-8 h-8 transition-colors border border-stone-200 disabled:opacity-30 hover:border-charcoal-800"><ChevronRight size={14} /></button>
      </div>
      {women.length === 0 ? (
        <p className="py-10 text-xs text-center font-body text-stone-400">No women's products yet.</p>
      ) : (
        <div ref={scrollRef} className="flex gap-5 pb-2 overflow-x-auto no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
          {women.map(product => (
            <div key={product.id} className="flex-shrink-0 w-[80vw] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]" style={{ scrollSnapAlign: 'start' }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

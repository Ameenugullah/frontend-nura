import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { featuredMensProducts } from '../data/products';
import ProductCard from './ProductCard';

export default function MensCollection() {
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 280) + 20), behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-stone-100/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="tag block mb-2">Men's Collection</span>
            <h2 className="section-heading font-light italic">For the Modern Man</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-2">
              <button onClick={() => scroll(-1)} disabled={atStart}
                className="w-9 h-9 border border-charcoal-800 flex items-center justify-center disabled:opacity-30 hover:bg-charcoal-800 hover:text-white transition-all duration-200">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => scroll(1)} disabled={atEnd}
                className="w-9 h-9 border border-charcoal-800 flex items-center justify-center disabled:opacity-30 hover:bg-charcoal-800 hover:text-white transition-all duration-200">
                <ChevronRight size={16} />
              </button>
            </div>
            <Link to="/products?gender=men"
              className="hidden sm:flex items-center gap-2 font-body text-sm text-charcoal-700 hover:text-blush-500 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto no-scrollbar pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {featuredMensProducts.map(product => (
            <div key={product.id}
              className="flex-shrink-0 w-[80vw] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
              style={{ scrollSnapAlign: 'start' }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/products?gender=men" className="btn-outline inline-flex items-center gap-2">
            Shop All Men's <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { isFragrance } from '../lib/categories';

// Fragrance is the 3rd main nav section (alongside Women / Men). It is not
// gender-scoped — any product tagged Perfume or Incense shows here,
// regardless of the "gender" field on the record. isFragrance() is the
// single source of truth for which categories count as Fragrance.
export default function FragrancesCollection({ allProducts = [] }) {
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);

  const fragranceProducts = allProducts.filter(isFragrance);

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
  }, [fragranceProducts.length]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 280) + 20), behavior: 'smooth' });
  };

  if (fragranceProducts.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="block mb-2 tag">Fragrance</span>
            <h2 className="italic font-light section-heading">Signature Scents</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden gap-2 sm:flex">
              <button onClick={() => scroll(-1)} disabled={atStart}
                className="flex items-center justify-center transition-all duration-200 border w-9 h-9 border-charcoal-800 disabled:opacity-30 hover:bg-charcoal-800 hover:text-white">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => scroll(1)} disabled={atEnd}
                className="flex items-center justify-center transition-all duration-200 border w-9 h-9 border-charcoal-800 disabled:opacity-30 hover:bg-charcoal-800 hover:text-white">
                <ChevronRight size={16} />
              </button>
            </div>
            <Link to="/products?section=fragrance"
              className="items-center hidden gap-2 text-sm transition-colors sm:flex font-body text-charcoal-700 hover:text-blush-500">
              View all <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-5 pb-2 overflow-x-auto no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
          {fragranceProducts.map(product => (
            <div key={product.id} className="flex-shrink-0 w-[80vw] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]" style={{ scrollSnapAlign: 'start' }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/products?section=fragrance" className="inline-flex items-center gap-2 btn-outline">
            Shop Fragrance <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
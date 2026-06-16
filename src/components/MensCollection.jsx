import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

const PB_BASE = 'http://localhost:8090';

function normalizeProduct(record) {
  return {
    id:            record.id,
    name:          record.name,
    category:      record.category,
    gender:        record.gender || 'men',
    price:         Number(record.price),
    originalPrice: record.originalPrice ? Number(record.originalPrice) : null,
    description:   record.description || '',
    colors: typeof record.colors === 'string' ? JSON.parse(record.colors) : (record.colors || []),
    sizes:  typeof record.sizes  === 'string' ? JSON.parse(record.sizes)  : (record.sizes  || []),
    images: (record.images || []).map(img =>
      PB_BASE + '/api/files/' + record.collectionId + '/' + record.id + '/' + img
    ),
    badge:    record.badge    || null,
    featured: record.featured || false,
    rating:   Number(record.rating) || 5,
    stock:    Number(record.stock)  || 0,
  };
}

export default function MensCollection({ allProducts = [] }) {
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

  const mensProducts = allProducts
    .filter(p => p.gender === 'men')
    .map(normalizeProduct);

  return (
    <section className="py-16 bg-stone-100/60">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="block mb-2 tag">Men's Collection</span>
            <h2 className="italic font-light section-heading">For the Modern Man</h2>
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
            <Link to="/products?gender=men"
              className="items-center hidden gap-2 text-sm transition-colors sm:flex font-body text-charcoal-700 hover:text-blush-500">
              View all <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div ref={scrollRef}
          className="flex gap-5 pb-2 overflow-x-auto no-scrollbar"
          style={{ scrollSnapType: 'x mandatory' }}>
          {mensProducts.length === 0 ? (
            <div className="w-full py-10 text-center">
              <p className="text-sm text-stone-500">No men's products yet. Add products via the Admin Dashboard.</p>
            </div>
          ) : (
            mensProducts.map(product => (
              <div key={product.id}
                className="flex-shrink-0 w-[80vw] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
                style={{ scrollSnapAlign: 'start' }}>
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>

        <div className="mt-10 text-center">
          <Link to="/products?gender=men" className="inline-flex items-center gap-2 btn-outline">
            Shop All Men's <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
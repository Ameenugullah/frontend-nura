import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import ProductCard  from '../components/ProductCard';
import { categories, mensCategories } from '../data/products';

const sortOptions = [
  { value: 'default',   label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc','label': 'Price: High to Low' },
  { value: 'rating',    label: 'Top Rated' },
  { value: 'new',       label: 'Newest' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { allProducts } = useAdmin();

  const paramCategory = searchParams.get('category') || 'All';
  const paramGender   = searchParams.get('gender')   || 'all';
  const paramBadge    = searchParams.get('badge')    || '';
  const paramQ        = searchParams.get('q')        || '';

  const [category, setCategory] = useState(paramCategory);
  const [gender,   setGender]   = useState(paramGender);
  const [sort,     setSort]     = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMax,  setPriceMax] = useState(200000);

  // sync URL → state
  useEffect(() => {
    setCategory(searchParams.get('category') || 'All');
    setGender(searchParams.get('gender') || 'all');
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // search query
    if (paramQ) {
      const q = paramQ.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // badge filter from URL
    if (paramBadge) list = list.filter(p => p.badge === paramBadge);

    // gender
    if (gender !== 'all') list = list.filter(p => p.gender === gender);

    // category
    if (category !== 'All') list = list.filter(p => p.category === category);

    // price
    list = list.filter(p => p.price <= priceMax);

    // sort
    if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'rating')     list.sort((a, b) => b.rating - a.rating);
    if (sort === 'new')        list.sort((a, b) => b.id - a.id);

    return list;
  }, [allProducts, paramQ, paramBadge, gender, category, sort, priceMax]);

  const activeCats = gender === 'men' ? mensCategories : categories;

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val && val !== 'all' && val !== 'All') next.set(key, val);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearAll = () => {
    setCategory('All');
    setGender('all');
    setSort('default');
    setPriceMax(200000);
    setSearchParams({});
  };

  const hasActiveFilters = category !== 'All' || gender !== 'all' || paramBadge || paramQ || sort !== 'default';

  const pageTitle = paramQ
    ? `Search: "${paramQ}"`
    : paramBadge === 'Sale' ? 'Sale'
    : gender === 'men' ? "Men's Collection"
    : gender === 'women' ? "Women's Collection"
    : category !== 'All' ? category
    : 'All Products';

  return (
    <div className="min-h-screen bg-stone-50 pt-6">
      {/* breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 mb-4">
        <div className="flex items-center gap-2 font-body text-xs text-stone-400">
          <Link to="/" className="hover:text-charcoal-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal-800">{pageTitle}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* header row */}
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-charcoal-800 font-light italic">{pageTitle}</h1>
            <p className="font-body text-xs text-stone-400 mt-1">{filteredProducts.length} products</p>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button onClick={clearAll}
                className="flex items-center gap-1.5 font-body text-xs text-blush-500 hover:text-blush-600 transition-colors">
                <X size={12} /> Clear filters
              </button>
            )}
            {/* sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="appearance-none border border-stone-200 bg-white font-body text-xs text-charcoal-800 pl-3 pr-8 py-2 focus:outline-none focus:border-charcoal-700 cursor-pointer"
              >
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" />
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-2 border border-stone-200 bg-white px-3 py-2 font-body text-xs text-charcoal-800 hover:border-charcoal-700 transition-colors"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>
        </div>

        {/* gender tabs */}
        <div className="flex border-b border-stone-200 mb-6">
          {[['all','All'],['women','Women'],['men','Men']].map(([val, label]) => (
            <button key={val}
              onClick={() => { setGender(val); setCategory('All'); setParam('gender', val); }}
              className={`relative px-5 py-3 font-body text-sm font-medium tracking-wide transition-colors ${
                gender === val ? 'text-charcoal-900' : 'text-stone-400 hover:text-charcoal-700'
              }`}>
              {label}
              {gender === val && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-900" />}
            </button>
          ))}
        </div>

        {/* category pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {activeCats.map(cat => (
            <button key={cat}
              onClick={() => { setCategory(cat); setParam('category', cat); }}
              className={`font-body text-xs px-4 py-1.5 border transition-all duration-150 ${
                category === cat
                  ? 'bg-charcoal-900 text-white border-charcoal-900'
                  : 'border-stone-200 text-charcoal-700 hover:border-charcoal-700 bg-white'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* collapsible filters panel */}
        {showFilters && (
          <div className="bg-white border border-stone-200 p-5 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-body text-sm font-semibold text-charcoal-800">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X size={15} className="text-stone-400" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="font-body text-xs text-stone-500 tracking-wider uppercase block mb-2">
                  Max Price: ₦{priceMax.toLocaleString('en-NG')}
                </label>
                <input
                  type="range"
                  min={5000}
                  max={200000}
                  step={5000}
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  className="w-full accent-blush-500"
                />
                <div className="flex justify-between font-body text-[10px] text-stone-400 mt-1">
                  <span>₦5,000</span><span>₦200,000</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* product grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {filteredProducts.map((product, i) => (
              <div key={product.id} className="animate-on-scroll" style={{ transitionDelay: `${(i % 8) * 40}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-body text-sm text-stone-400 mb-4">No products found.</p>
            <button onClick={clearAll} className="btn-outline">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

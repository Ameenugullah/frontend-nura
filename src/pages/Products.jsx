import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { getProducts } from '../lib/api';
import ProductCard from '../components/ProductCard';
import { NAV_SECTIONS, normalize, matchesGender, isFragrance } from '../lib/categories';

const sortOptions = [
  { value: 'default',    label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
];

// "All" is a synthetic pseudo-section — not in NAV_SECTIONS but always
// shown first in the tab row.
const SECTION_TABS = [{ key: 'all', label: 'All' }, ...NAV_SECTIONS.map(s => ({ key: s.key, label: s.label }))];

function sectionByKey(key) {
  return NAV_SECTIONS.find(s => s.key === key) || null;
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URLs look like:
  //   /products?section=women
  //   /products?section=men&category=Kaftan
  //   /products?section=fragrance&category=Perfume
  // "section" is the canonical param — replaces old ?gender= / ?category=Fragrance.
  let paramSection    = searchParams.get('section')  || 'all';
  const paramCategory = searchParams.get('category') || 'All';
  const paramQ        = searchParams.get('q')        || '';

  // Backward compat: old links used ?gender= or ?category=Fragrance.
  const legacyGender = searchParams.get('gender');
  if (paramSection === 'all' && legacyGender) {
    paramSection = normalize(legacyGender) === 'men' ? 'men' : 'women';
  }
  if (paramSection === 'all' && normalize(paramCategory) === 'fragrance') {
    paramSection = 'fragrance';
  }

  // Rewrite legacy URLs to the canonical ?section= form.
  useEffect(() => {
    const hasLegacyGender    = searchParams.has('gender');
    const hasLegacyFragrance = normalize(searchParams.get('category')) === 'fragrance';
    if (hasLegacyGender || hasLegacyFragrance) {
      const next = new URLSearchParams(searchParams);
      next.delete('gender');
      if (hasLegacyFragrance) next.delete('category');
      if (paramSection !== 'all') next.set('section', paramSection);
      setSearchParams(next, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [allProducts,      setAllProducts]      = useState([]);
  const [loadingProducts,  setLoadingProducts]  = useState(true);
  const [loadError,        setLoadError]        = useState(false);
  const [sort,             setSort]             = useState('default');
  const [showFilters,      setShowFilters]      = useState(false);
  const [priceMax,         setPriceMax]         = useState(200000);

  // Fetch all products once; filter client-side so casing mismatches never matter.
  useEffect(() => {
    let cancelled = false;
    setLoadingProducts(true);
    setLoadError(false);
    getProducts()
      .then(data => { if (!cancelled) setAllProducts(data); })
      .catch(() => { if (!cancelled) setLoadError(true); })
      .finally(() => { if (!cancelled) setLoadingProducts(false); });
    return () => { cancelled = true; };
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // 1. Search
    if (paramQ.trim()) {
      const q = normalize(paramQ);
      list = list.filter(p =>
        normalize(p.name).includes(q) ||
        normalize(p.category).includes(q) ||
        normalize(p.description).includes(q)
      );
    }

    // 2. Section filter
    const section = sectionByKey(paramSection);
    if (section) {
      if (section.type === 'gender') {
        list = list.filter(p => matchesGender(p, section.value));
      } else if (section.type === 'fragrance') {
        list = list.filter(isFragrance);
      }
    }

    // 3. Sub-category filter within section
    if (normalize(paramCategory) !== 'all') {
      list = list.filter(p => normalize(p.category) === normalize(paramCategory));
    }

    // 4. Price cap
    list = list.filter(p => p.price <= priceMax);

    // 5. Sort
    if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'rating')     list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [allProducts, paramQ, paramSection, paramCategory, sort, priceMax]);

  // Category pills for the active section.
  const activeSection = sectionByKey(paramSection);
  const activeCats    = activeSection ? activeSection.categories : (NAV_SECTIONS[0]?.categories || []);

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val && normalize(val) !== 'all') next.set(key, val);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleSectionChange = (selectedKey) => {
    const next = new URLSearchParams(searchParams);
    next.delete('gender');
    if (selectedKey !== 'all') next.set('section', selectedKey);
    else next.delete('section');
    next.delete('category'); // reset sub-category when section changes
    setSearchParams(next);
  };

  const clearAll = () => {
    setSort('default');
    setPriceMax(200000);
    setSearchParams({});
  };

  const hasActiveFilters = normalize(paramCategory) !== 'all' || paramSection !== 'all' || paramQ || sort !== 'default';

  const pageTitle = paramQ
    ? `Search: "${paramQ}"`
    : paramSection === 'men'       ? "Men's Collection"
    : paramSection === 'women'     ? "Women's Collection"
    : paramSection === 'fragrance' ? 'Fragrance'
    : paramCategory !== 'All'      ? paramCategory
    : 'All Products';

  return (
    <div className="min-h-screen pt-6 bg-stone-50">
      {/* breadcrumb */}
      <div className="px-6 mx-auto mb-4 max-w-7xl">
        <div className="flex items-center gap-2 text-xs font-body text-stone-400">
          <Link to="/" className="transition-colors hover:text-charcoal-800">Home</Link>
          <span>/</span>
          <span className="text-charcoal-800">{pageTitle}</span>
        </div>
      </div>

      <div className="px-6 pb-20 mx-auto max-w-7xl">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl italic font-light font-display sm:text-4xl text-charcoal-800">{pageTitle}</h1>
            <p className="mt-1 text-xs font-body text-stone-400">
              {loadingProducts ? 'Loading…' : `${filteredProducts.length} products`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button onClick={clearAll}
                className="flex items-center gap-1.5 font-body text-xs text-blush-500 hover:text-blush-600 transition-colors">
                <X size={12} /> Clear filters
              </button>
            )}
            <div className="relative">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="py-2 pl-3 pr-8 text-xs bg-white border appearance-none cursor-pointer border-stone-200 font-body text-charcoal-800 focus:outline-none focus:border-charcoal-700">
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" />
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-2 px-3 py-2 text-xs transition-colors bg-white border border-stone-200 font-body text-charcoal-800 hover:border-charcoal-700">
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        {/* section tabs — All / Women / Men / Fragrance */}
        <div className="flex mb-6 border-b border-stone-200">
          {SECTION_TABS.map(({ key, label }) => (
            <button key={key}
              onClick={() => handleSectionChange(key)}
              className={'relative px-5 py-3 font-body text-sm font-medium tracking-wide transition-colors ' + (
                paramSection === key ? 'text-charcoal-900' : 'text-stone-400 hover:text-charcoal-700'
              )}>
              {label}
              {paramSection === key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-900" />}
            </button>
          ))}
        </div>

        {/* sub-category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {activeCats.map(cat => (
            <button key={cat}
              onClick={() => setParam('category', cat)}
              className={'font-body text-xs px-4 py-1.5 border transition-all duration-150 ' + (
                normalize(paramCategory) === normalize(cat)
                  ? 'bg-charcoal-900 text-white border-charcoal-900'
                  : 'border-stone-200 text-charcoal-700 hover:border-charcoal-700 bg-white'
              )}>
              {cat}
            </button>
          ))}
        </div>

        {/* filters panel */}
        {showFilters && (
          <div className="p-5 mb-8 bg-white border border-stone-200 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold font-body text-charcoal-800">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X size={15} className="text-stone-400" /></button>
            </div>
            <div>
              <label className="block mb-2 text-xs tracking-wider uppercase font-body text-stone-500">
                Max Price: ₦{priceMax.toLocaleString('en-NG')}
              </label>
              <input type="range" min={5000} max={200000} step={5000} value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value))}
                className="w-full accent-blush-500" />
              <div className="flex justify-between font-body text-[10px] text-stone-400 mt-1">
                <span>₦5,000</span><span>₦200,000</span>
              </div>
            </div>
          </div>
        )}

        {/* product grid */}
        {loadingProducts ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-2 rounded-full border-stone-200 border-t-charcoal-800 animate-spin" />
            <p className="text-sm font-body text-stone-400">Loading products…</p>
          </div>
        ) : loadError ? (
          <div className="py-20 text-center">
            <p className="mb-4 text-sm font-body text-stone-400">
              Couldn't reach the store. Check your connection and try again.
            </p>
            <button onClick={() => window.location.reload()} className="btn-outline">Retry</button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="mb-4 text-sm font-body text-stone-400">
              {allProducts.length === 0 ? 'No products have been added yet.' : 'No products match your filters.'}
            </p>
            {allProducts.length > 0 && (
              <button onClick={clearAll} className="btn-outline">Clear Filters</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
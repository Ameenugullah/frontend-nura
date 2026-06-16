import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { getProducts } from '../lib/api';
import ProductCard from '../components/ProductCard';

const sortOptions = [
  { value: 'default',    label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
];

const womenCats = ['All', 'Boubous', 'Gowns', 'Ankara', 'Perfumes'];
const menCats   = ['All', 'Agbada', 'Kaftan', 'Babariga', 'Senator'];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Always read parameters directly from URL search parameters to maintain single source of truth
  const paramCategory = searchParams.get('category') || 'All';
  const paramGender   = searchParams.get('gender')   || 'all';
  const paramQ        = searchParams.get('q')        || '';

  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [sort,        setSort]        = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMax,    setPriceMax]    = useState(200000);

  // Fetch all products once on mount
  useEffect(() => {
    setLoadingProducts(true);
    getProducts()
      .then(data => setAllProducts(data))
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Compute filtered items reactively from state and URL params
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // 1. Filter by Search Query
    if (paramQ.trim()) {
      const q = paramQ.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    // 2. Filter by Gender (Normalized to lower-case)
    if (paramGender !== 'all') {
      list = list.filter(p => 
        p.gender && p.gender.toLowerCase() === paramGender.toLowerCase()
      );
    }

    // 3. Filter by Category (Normalized to lower-case to avoid case-mismatches with DB)
    if (paramCategory !== 'All') {
      list = list.filter(p => 
        p.category && p.category.toLowerCase().trim() === paramCategory.toLowerCase().trim()
      );
    }

    // 4. Filter by Max Price
    list = list.filter(p => p.price <= priceMax);

    // 5. Apply Sorting
    if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'rating')     list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [allProducts, paramQ, paramGender, paramCategory, sort, priceMax]);

  // Determine active category list based on gender URL param
  const activeCats = paramGender === 'men' ? menCats : womenCats;

  // URL Mutation Engine helper
  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val && val !== 'all' && val !== 'All') {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleGenderChange = (selectedGender) => {
    const next = new URLSearchParams(searchParams);
    if (selectedGender !== 'all') {
      next.set('gender', selectedGender);
    } else {
      next.delete('gender');
    }
    // Always clear out active single-category when jumping between global gender scopes
    next.delete('category'); 
    setSearchParams(next);
  };

  const clearAll = () => {
    setSort('default');
    setPriceMax(200000);
    setSearchParams({});
  };

  const hasActiveFilters = paramCategory !== 'All' || paramGender !== 'all' || paramQ || sort !== 'default';

  const pageTitle = paramQ
    ? 'Search: "' + paramQ + '"'
    : paramGender === 'men'   ? "Men's Collection"
    : paramGender === 'women' ? "Women's Collection"
    : paramCategory !== 'All' ? paramCategory
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
        {/* header row */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl italic font-light font-display sm:text-4xl text-charcoal-800">{pageTitle}</h1>
            <p className="mt-1 text-xs font-body text-stone-400">
              {loadingProducts ? 'Loading…' : filteredProducts.length + ' products'}
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

        {/* gender tabs */}
        <div className="flex mb-6 border-b border-stone-200">
          {[['all','All'],['women','Women'],['men','Men']].map(([val, label]) => (
            <button key={val}
              onClick={() => handleGenderChange(val)}
              className={'relative px-5 py-3 font-body text-sm font-medium tracking-wide transition-colors ' + (
                paramGender === val ? 'text-charcoal-900' : 'text-stone-400 hover:text-charcoal-700'
              )}>
              {label}
              {paramGender === val && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-900" />}
            </button>
          ))}
        </div>

        {/* category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {activeCats.map(cat => (
            <button key={cat}
              onClick={() => setParam('category', cat)}
              className={'font-body text-xs px-4 py-1.5 border transition-all duration-150 ' + (
                paramCategory === cat
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
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {filteredProducts.map((product, i) => (
              <div key={product.id} className="animate-on-scroll" style={{ transitionDelay: (i % 8) * 40 + 'ms' }}>
                <ProductCard product={product} />
              </div>
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
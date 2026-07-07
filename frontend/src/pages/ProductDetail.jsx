import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Star, Truck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart }      from '../context/CartContext';
import { useWishlist }  from '../context/WishlistContext';
import ProductCard      from '../components/ProductCard';
import { getProducts, getProductById } from '../lib/api';

const FALLBACK = '/images/placeholder-product.svg';

export default function ProductDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { addToCart }  = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();

  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [imgIdx, setImgIdx] = useState(0);
  const [size,   setSize]   = useState('');
  const [color,  setColor]  = useState('');
  const [qty,    setQty]    = useState(1);
  const [added,  setAdded]  = useState(false);
  const [error,  setError]  = useState('');

  // Fetch the product directly from PocketBase — no admin login required.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setProduct(null);
    setRelated([]);
    setImgIdx(0);

    async function load() {
      const p = await getProductById(id);
      if (cancelled) return;
      if (!p) { setLoading(false); return; }
      setProduct(p);
      setSize(p.sizes?.[0] || 'One Size');
      setColor(p.colors?.[0] || '');

      // Fetch same-category products for "Related" section
      const all = await getProducts();
      if (!cancelled) {
        setRelated(all.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4));
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 rounded-full border-stone-200 border-t-charcoal-800 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4 font-body text-stone-400">Product not found.</p>
          <Link to="/products" className="btn-primary">Back to Products</Link>
        </div>
      </div>
    );
  }

  const images   = product.images?.length ? product.images : [FALLBACK];
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  const inStock  = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (product.sizes?.length && product.sizes[0] !== 'One Size' && !size) {
      setError('Please select a size'); return false;
    }
    if (product.colors?.length && !color) {
      setError('Please select a color'); return false;
    }
    setError('');
    addToCart(product, size || 'One Size', color || '', qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    return true;
  };

  return (
    <div className="min-h-screen pt-4 bg-stone-50">
      <div className="px-6 pb-20 mx-auto max-w-7xl">
        {/* breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs font-body text-stone-400">
          <Link to="/" className="transition-colors hover:text-charcoal-800">Home</Link>
          <span>/</span>
          <Link to="/products" className="transition-colors hover:text-charcoal-800">Products</Link>
          <span>/</span>
          <span className="text-charcoal-800">{product.name}</span>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* image gallery */}
          <div className="flex gap-4">
            {images.length > 1 && (
              <div className="flex flex-col w-16 gap-2 shrink-0">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`aspect-square overflow-hidden border-2 transition-colors ${imgIdx === i ? 'border-charcoal-900' : 'border-transparent'}`}>
                    <img src={img} alt={`View ${i+1}`} className="object-cover w-full h-full"
                      onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }} />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 relative bg-stone-100 aspect-[3/4] overflow-hidden">
              <img src={images[imgIdx]} alt={product.name}
                className="object-cover w-full h-full"
                onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }} />
              {product.badge && (
                <span className="badge bg-charcoal-900 text-white">{product.badge}</span>
              )}
              {discount && (
                <span className="left-auto text-white badge right-3 bg-blush-500">-{discount}%</span>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute flex items-center justify-center w-8 h-8 transition-colors -translate-y-1/2 left-2 top-1/2 bg-white/80 hover:bg-white">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute flex items-center justify-center w-8 h-8 transition-colors -translate-y-1/2 right-2 top-1/2 bg-white/80 hover:bg-white">
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* product info */}
          <div className="lg:sticky lg:top-28">
            <p className="mb-2 tag-dark">{product.category}</p>
            <h1 className="mb-3 text-3xl font-light leading-tight font-display sm:text-4xl text-charcoal-800">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14}
                    fill={s <= Math.round(product.rating) ? '#f59e0b' : 'none'}
                    stroke={s <= Math.round(product.rating) ? '#f59e0b' : '#d1d5db'} />
                ))}
              </div>
              <span className="text-xs font-body text-stone-400">{product.rating}</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-light font-display text-charcoal-900">
                ₦{product.price.toLocaleString('en-NG')}
              </span>
              {product.originalPrice && (
                <span className="text-base line-through font-body text-stone-400">
                  ₦{product.originalPrice.toLocaleString('en-NG')}
                </span>
              )}
              {discount && (
                <span className="text-sm font-medium font-body text-blush-500">{discount}% off</span>
              )}
            </div>

            <div className="w-10 h-px mb-6 bg-stone-200" />

            {/* colors */}
            {product.colors?.length > 0 && product.colors[0] !== 'One Size' && (
              <div className="mb-5">
                <p className="font-body text-xs tracking-wider uppercase text-stone-500 mb-2.5">
                  Color: <span className="tracking-normal normal-case text-charcoal-800">{color}</span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map(c => (
                    <button key={c} onClick={() => { setColor(c); setError(''); }}
                      title={c}
                      className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${color === c ? 'border-charcoal-900 scale-110 ring-2 ring-offset-1 ring-charcoal-400' : 'border-stone-200'}`}
                      style={{ backgroundColor: colorToHex(c) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* sizes */}
            {product.sizes?.length > 0 && product.sizes[0] !== 'One Size' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs tracking-wider uppercase font-body text-stone-500">Size</p>
                  <Link to="/faq" className="text-xs underline font-body text-blush-500 hover:text-blush-600">Size Guide</Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => { setSize(s); setError(''); }}
                      className={`px-3.5 py-2 font-body text-sm border transition-all ${
                        size === s
                          ? 'bg-charcoal-900 text-white border-charcoal-900'
                          : 'border-stone-200 text-charcoal-700 hover:border-charcoal-700 bg-white'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* qty */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-stone-200">
                <button onClick={() => setQty(q => Math.max(1, q-1))}
                  className="flex items-center justify-center transition-colors w-9 h-9 text-charcoal-700 hover:bg-stone-50 font-body">–</button>
                <span className="w-10 text-sm text-center font-body">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q+1))}
                  className="flex items-center justify-center transition-colors w-9 h-9 text-charcoal-700 hover:bg-stone-50 font-body">+</button>
              </div>
              <span className={`font-body text-xs ${lowStock ? 'text-blush-500' : inStock ? 'text-green-600' : 'text-red-500'}`}>
                {!inStock ? 'Out of stock' : lowStock ? `Only ${product.stock} left` : 'In stock'}
              </span>
            </div>

            {error && <p className="mb-3 text-xs font-body text-blush-500">{error}</p>}

            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} disabled={!inStock}
                className={`flex-1 py-3.5 font-body text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  !inStock ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : added ? 'bg-green-600 text-white'
                  : 'bg-charcoal-900 text-white hover:bg-charcoal-700'
                }`}>
                {added ? '✓ Added to Cart' : <><ShoppingBag size={16} /> Add to Cart</>}
              </button>
              <button onClick={() => toggleWishlist(product)}
                className="flex items-center justify-center w-12 h-12 transition-colors border border-stone-200 hover:border-blush-500">
                <Heart size={18}
                  fill={isWishlisted(product.id) ? '#d97070' : 'none'}
                  stroke={isWishlisted(product.id) ? '#d97070' : 'currentColor'} />
              </button>
            </div>

            <button onClick={() => { if (handleAddToCart()) navigate('/cart'); }}
              disabled={!inStock}
              className="w-full py-3 mb-8 text-sm font-medium transition-all border font-body border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white disabled:opacity-40">
              Buy Now
            </button>

            <div className="pt-5 space-y-3 border-t border-stone-200">
              {[
                { icon: Truck,     text: 'Free delivery in Kano over ₦200,000 · Nationwide over ₦300,000' },
                { icon: RotateCcw, text: 'Returns accepted within 7 days' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon size={16} className="text-stone-400 shrink-0" strokeWidth={1.5} />
                  <span className="text-xs font-body text-stone-500">{text}</span>
                </div>
              ))}
            </div>

            {product.description && (
              <div className="pt-5 mt-6 border-t border-stone-200">
                <p className="text-sm leading-relaxed font-body text-charcoal-700/80">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <div className="mb-10 text-center">
              <span className="block mb-2 tag-dark">You may also like</span>
              <h2 className="text-3xl italic font-light font-display text-charcoal-800">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function colorToHex(name) {
  const map = {
    Blush: '#f5c0c0', Ivory: '#fffff0', Champagne: '#f7e7ce', White: '#ffffff',
    Black: '#1a1a1a', Navy: '#1a2744', Teal: '#2a9d8f', Coral: '#ff6b6b',
    Orange: '#f4a261', Mustard: '#e9c46a', Blue: '#457b9d', Indigo: '#3d405b',
    'Rose Gold': '#b76e79', Multicolor: '#ccc', Cream: '#f5f0e8',
    'Gold/White': '#d4a843', 'Sky Blue': '#90e0ef', Charcoal: '#4a4a4a',
    Brown: '#8b5e3c', Olive: '#6b705c',
  };
  return map[name] || '#ccc';
}

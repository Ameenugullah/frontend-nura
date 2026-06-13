import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Share2, Star, Truck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useCart }  from '../context/CartContext';
import ProductCard  from '../components/ProductCard';

const FALLBACK = 'https://images.unsplash.com/photo-1558171813-5e3d4e0c64ae?w=600&q=60';

export default function ProductDetail() {
  const { id }          = useParams();
  const { allProducts } = useAdmin();
  const { addToCart }   = useCart();
  const navigate        = useNavigate();

  const product = allProducts.find(p => String(p.id) === String(id));

  const [imgIdx,   setImgIdx]   = useState(0);
  const [size,     setSize]     = useState('');
  const [color,    setColor]    = useState('');
  const [qty,      setQty]      = useState(1);
  const [liked,    setLiked]    = useState(false);
  const [added,    setAdded]    = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (product) {
      setSize(product.sizes?.[0] || 'One Size');
      setColor(product.colors?.[0] || '');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-stone-400 mb-4">Product not found.</p>
          <Link to="/products" className="btn-primary">Back to Products</Link>
        </div>
      </div>
    );
  }

  const images      = product.images?.length ? product.images : [FALLBACK];
  const related     = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount    = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  const inStock     = product.stock > 0;
  const lowStock    = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (!size) { setError('Please select a size'); return; }
    if (!color) { setError('Please select a color'); return; }
    setError('');
    addToCart(product, size, color, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-4">
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* breadcrumb */}
        <div className="flex items-center gap-2 font-body text-xs text-stone-400 mb-6">
          <Link to="/" className="hover:text-charcoal-800 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-charcoal-800 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-charcoal-800">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* ── image gallery ── */}
          <div className="flex gap-4">
            {/* thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-16 shrink-0">
                {images.map((img, i) => (
                  <button key={i}
                    onClick={() => setImgIdx(i)}
                    className={`aspect-square overflow-hidden border-2 transition-colors ${imgIdx === i ? 'border-charcoal-900' : 'border-transparent'}`}>
                    <img src={img} alt={`View ${i+1}`} className="w-full h-full object-cover"
                      onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }} />
                  </button>
                ))}
              </div>
            )}
            {/* main image */}
            <div className="flex-1 relative bg-stone-100 aspect-[3/4] overflow-hidden">
              <img
                src={images[imgIdx]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }}
              />
              {product.badge && (
                <span className={`badge bg-charcoal-900 text-white`}>{product.badge}</span>
              )}
              {discount && (
                <span className="badge left-auto right-3 bg-blush-500 text-white">-{discount}%</span>
              )}
              {/* prev/next arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── product info ── */}
          <div className="lg:sticky lg:top-28">
            <p className="tag-dark mb-2">{product.category}</p>
            <h1 className="font-display text-3xl sm:text-4xl text-charcoal-800 font-light leading-tight mb-3">{product.name}</h1>

            {/* rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} fill={s <= Math.round(product.rating) ? '#f59e0b' : 'none'} stroke={s <= Math.round(product.rating) ? '#f59e0b' : '#d1d5db'} />
                ))}
              </div>
              <span className="font-body text-xs text-stone-400">{product.rating} · {product.reviews || 0} reviews</span>
            </div>

            {/* price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-3xl text-charcoal-900 font-light">
                ₦{product.price.toLocaleString('en-NG')}
              </span>
              {product.originalPrice && (
                <span className="font-body text-base text-stone-400 line-through">
                  ₦{product.originalPrice.toLocaleString('en-NG')}
                </span>
              )}
              {discount && (
                <span className="font-body text-sm text-blush-500 font-medium">{discount}% off</span>
              )}
            </div>

            <div className="w-10 h-px bg-stone-200 mb-6" />

            {/* colors */}
            {product.colors && product.colors[0] !== 'One Size' && (
              <div className="mb-5">
                <p className="font-body text-xs tracking-wider uppercase text-stone-500 mb-2.5">
                  Color: <span className="text-charcoal-800 normal-case tracking-normal">{color}</span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map(c => (
                    <button key={c}
                      onClick={() => { setColor(c); setError(''); }}
                      title={c}
                      className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${color === c ? 'border-charcoal-900 scale-110 ring-2 ring-offset-1 ring-charcoal-400' : 'border-stone-200'}`}
                      style={{ backgroundColor: colorToHex(c) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* sizes */}
            {product.sizes && product.sizes[0] !== 'One Size' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="font-body text-xs tracking-wider uppercase text-stone-500">Size</p>
                  <Link to="/faq" className="font-body text-xs text-blush-500 hover:text-blush-600 underline">Size Guide</Link>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(s => (
                    <button key={s}
                      onClick={() => { setSize(s); setError(''); }}
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
                  className="w-9 h-9 flex items-center justify-center text-charcoal-700 hover:bg-stone-50 transition-colors font-body">–</button>
                <span className="w-10 text-center font-body text-sm">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q+1))}
                  className="w-9 h-9 flex items-center justify-center text-charcoal-700 hover:bg-stone-50 transition-colors font-body">+</button>
              </div>
              <span className={`font-body text-xs ${lowStock ? 'text-blush-500' : inStock ? 'text-green-600' : 'text-red-500'}`}>
                {!inStock ? 'Out of stock' : lowStock ? `Only ${product.stock} left` : 'In stock'}
              </span>
            </div>

            {error && <p className="font-body text-xs text-blush-500 mb-3">{error}</p>}

            {/* CTA buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 py-3.5 font-body text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  !inStock ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : added ? 'bg-green-600 text-white'
                  : 'bg-charcoal-900 text-white hover:bg-charcoal-700'
                }`}
              >
                {added ? '✓ Added to Cart' : <><ShoppingBag size={16} /> Add to Cart</>}
              </button>
              <button
                onClick={() => setLiked(l => !l)}
                className="w-12 h-12 border border-stone-200 flex items-center justify-center hover:border-blush-500 transition-colors"
              >
                <Heart size={18} fill={liked ? '#d97070' : 'none'} stroke={liked ? '#d97070' : 'currentColor'} />
              </button>
            </div>

            <button
              onClick={() => { handleAddToCart(); navigate('/cart'); }}
              disabled={!inStock}
              className="w-full py-3 font-body text-sm font-medium border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white transition-all disabled:opacity-40 mb-8"
            >
              Buy Now
            </button>

            {/* perks */}
            <div className="border-t border-stone-200 pt-5 space-y-3">
              {[
                { icon: Truck,     text: 'Free delivery on orders over ₦30,000' },
                { icon: RotateCcw, text: 'Returns accepted within 7 days' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon size={16} className="text-stone-400 shrink-0" strokeWidth={1.5} />
                  <span className="font-body text-xs text-stone-500">{text}</span>
                </div>
              ))}
            </div>

            {/* description */}
            {product.description && (
              <div className="border-t border-stone-200 mt-6 pt-5">
                <p className="font-body text-sm text-charcoal-700/80 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* related products */}
        {related.length > 0 && (
          <section className="mt-20">
            <div className="text-center mb-10">
              <span className="tag-dark block mb-2">You may also like</span>
              <h2 className="font-display text-3xl text-charcoal-800 font-light italic">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
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

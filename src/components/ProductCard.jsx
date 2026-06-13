import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BADGE_COLORS = {
  Bestseller: 'bg-charcoal-900 text-white',
  New:        'bg-blush-500 text-white',
  Sale:       'bg-blush-600 text-white',
  Luxury:     'bg-gold-500 text-white',
  Bridal:     'bg-blush-100 text-blush-600',
  Premium:    'bg-navy-900 text-white',
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [liked, setLiked]               = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize]   = useState(null);
  const [imgIdx, setImgIdx]             = useState(0);
  const [added, setAdded]               = useState(false);

  const fallbackImg = 'https://images.unsplash.com/photo-1558171813-5e3d4e0c64ae?w=400&q=60';
  const img = product.images?.[imgIdx] || product.images?.[0] || fallbackImg;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const size  = selectedSize  || product.sizes?.[0]  || 'One Size';
    const color = selectedColor || product.colors?.[0] || '';
    addToCart(product, size, color);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative bg-white">
      {/* image wrapper */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden aspect-[3/4] bg-stone-100">
        <img
          src={img}
          alt={product.name}
          className="w-full h-full object-cover product-card-image"
          loading="lazy"
          onError={e => { e.target.onerror = null; e.target.src = fallbackImg; }}
        />
        {/* second image on hover */}
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
            onError={e => { e.target.onerror = null; e.target.src = fallbackImg; }}
          />
        )}

        {/* badge */}
        {product.badge && (
          <span className={`badge ${BADGE_COLORS[product.badge] || 'bg-charcoal-900 text-white'}`}>
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="badge left-auto right-3 bg-blush-500 text-white">-{discount}%</span>
        )}

        {/* wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(l => !l); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center shadow-soft hover:scale-110 transition-transform z-10"
          aria-label="Wishlist"
        >
          <Heart size={14} fill={liked ? '#d97070' : 'none'} stroke={liked ? '#d97070' : 'currentColor'} />
        </button>

        {/* Figma hover overlay — color/size select + CTA */}
        <div className="product-options-overlay absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 border-t border-stone-100">
          {/* colors */}
          {product.colors && product.colors[0] !== 'One Size' && (
            <div className="flex gap-1.5 mb-2">
              {product.colors.slice(0, 5).map(c => (
                <button
                  key={c}
                  onClick={(e) => { e.preventDefault(); setSelectedColor(c); }}
                  title={c}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    selectedColor === c ? 'border-charcoal-800 scale-110' : 'border-stone-200'
                  }`}
                  style={{ backgroundColor: colorToHex(c) }}
                />
              ))}
            </div>
          )}
          {/* sizes */}
          {product.sizes && product.sizes[0] !== 'One Size' && (
            <div className="flex gap-1 mb-2.5 flex-wrap">
              {product.sizes.slice(0, 5).map(s => (
                <button
                  key={s}
                  onClick={(e) => { e.preventDefault(); setSelectedSize(s); }}
                  className={`px-2 py-0.5 font-body text-[10px] border transition-colors ${
                    selectedSize === s
                      ? 'border-charcoal-900 bg-charcoal-900 text-white'
                      : 'border-stone-200 text-charcoal-700 hover:border-charcoal-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleQuickAdd}
            className={`w-full py-2 font-body text-xs tracking-widest uppercase font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              added
                ? 'bg-green-600 text-white'
                : 'bg-charcoal-900 text-white hover:bg-charcoal-700'
            }`}
          >
            {added ? '✓ Added' : <><ShoppingBag size={12} /> Add to Cart</>}
          </button>
        </div>
      </Link>

      {/* product info */}
      <div className="pt-3 pb-1 px-0.5">
        <p className="font-body text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-0.5">{product.category}</p>
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${product.id}`} className="font-body text-sm text-charcoal-800 hover:text-blush-500 transition-colors leading-snug line-clamp-2 flex-1">
            {product.name}
          </Link>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          {/* stars */}
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`text-[11px] ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-stone-200'}`}>★</span>
            ))}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-body text-sm font-semibold text-charcoal-900">
              ₦{product.price.toLocaleString('en-NG')}
            </span>
            {product.originalPrice && (
              <span className="font-body text-xs text-stone-400 line-through">
                ₦{product.originalPrice.toLocaleString('en-NG')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// naive color name → hex mapping
function colorToHex(name) {
  const map = {
    Blush: '#f5c0c0', Ivory: '#fffff0', Champagne: '#f7e7ce', White: '#ffffff',
    Black: '#1a1a1a', Navy: '#1a2744', Teal: '#2a9d8f', Coral: '#ff6b6b',
    Orange: '#f4a261', Mustard: '#e9c46a', Blue: '#457b9d', Indigo: '#3d405b',
    'Rose Gold': '#b76e79', Multicolor: 'linear-gradient(135deg,#f4a261,#2a9d8f,#e76f51)',
    'Gold/White': '#d4a843', 'Blue/Silver': '#457b9d', 'Green/Gold': '#52b788',
    Cream: '#f5f0e8', 'Sky Blue': '#90e0ef', Charcoal: '#4a4a4a',
    Brown: '#8b5e3c', Olive: '#6b705c',
  };
  return map[name] || '#ccc';
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart }     from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const cart = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [imgIdx, setImgIdx] = useState(0);
  const [added,  setAdded]  = useState(false);
  const wishlisted = isWishlisted(product.id);

  const images      = product.images || [];
  const mainImg     = images[imgIdx] || null;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const fn = cart.addToCart || cart.add;
    if (typeof fn === 'function') {
      fn(product, product.sizes?.[0] || 'One Size', product.colors?.[0] || '', 1);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      {/* image */}
      <div className="relative overflow-hidden aspect-[3/4] bg-stone-100">
        {mainImg ? (
          <img
            src={mainImg}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder-product.svg'; }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span className="font-body text-[10px] tracking-widest uppercase text-stone-300">No image</span>
          </div>
        )}

        {product.badge && (
          <span className="absolute top-2 left-2 bg-blush-500 text-white font-body text-[9px] tracking-widest uppercase px-2 py-1">
            {product.badge}
          </span>
        )}

        {images.length > 1 && (
          <div className="absolute flex gap-1 -translate-x-1/2 bottom-2 left-1/2">
            {images.map((_, i) => (
              <button key={i}
                onClick={e => { e.preventDefault(); e.stopPropagation(); setImgIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}

        <button onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
          aria-label="Wishlist">
          <Heart size={14} className={wishlisted ? 'text-blush-500 fill-blush-500' : 'text-charcoal-700'} />
        </button>

        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleAddToCart}
            className={`w-full py-3 flex items-center justify-center gap-2 font-body text-xs tracking-widest uppercase transition-colors duration-200 ${
              added ? 'bg-charcoal-800 text-white' : 'bg-white/95 text-charcoal-900 hover:bg-charcoal-900 hover:text-white'
            }`}>
            <ShoppingBag size={13} />
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* info */}
      <div className="pt-3">
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-0.5">
          {product.category}
        </p>
        <h3 className="font-body text-sm text-charcoal-800 leading-snug line-clamp-2 group-hover:text-blush-500 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-body text-sm font-medium text-charcoal-900">
            ₦{product.price.toLocaleString('en-NG')}
          </span>
          {hasDiscount && (
            <span className="font-body text-xs text-stone-400 line-through">
              ₦{product.originalPrice.toLocaleString('en-NG')}
            </span>
          )}
        </div>
        {product.stock > 0 && product.stock <= 3 && (
          <p className="mt-1 font-body text-[10px] text-blush-500">Only {product.stock} left</p>
        )}
        {product.stock === 0 && (
          <p className="mt-1 font-body text-[10px] text-stone-400 uppercase tracking-wider">Out of stock</p>
        )}
      </div>
    </Link>
  );
}
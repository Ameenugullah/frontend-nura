import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart }     from '../context/CartContext';

export default function Wishlist() {
  const { items, toggle } = useWishlist();
  const { addToCart }     = useCart();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl px-6 py-16 mx-auto">
        <div className="mb-10">
          <p className="tag mb-2">Saved Items</p>
          <h1 className="section-heading">My Wishlist</h1>
          <p className="mt-2 text-sm font-body text-stone-400">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <Heart size={40} className="mx-auto mb-4 text-stone-300" />
            <p className="mb-2 text-lg font-light font-display text-charcoal-800">Your wishlist is empty</p>
            <p className="mb-8 text-sm font-body text-stone-400">Save items you love and find them here later.</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map(product => (
                <div key={product.id} className="flex gap-4 p-4 bg-white border border-stone-200">
                  <Link to={`/products/${product.id}`} className="shrink-0">
                    <div className="w-20 h-20 overflow-hidden bg-stone-100">
                      <img
                        src={product.images?.[0] || '/images/placeholder-product.svg'}
                        alt={product.name}
                        className="object-cover w-full h-full"
                        loading="lazy"
                        onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder-product.svg'; }}
                      />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product.id}`}>
                      <p className="text-sm font-medium font-body text-charcoal-800 hover:text-blush-500 transition-colors line-clamp-2">
                        {product.name}
                      </p>
                    </Link>
                    <p className="mt-1 text-sm font-semibold font-body text-charcoal-800">
                      ₦{Number(product.price).toLocaleString('en-NG')}
                    </p>
                    {product.stock === 0 && (
                      <p className="font-body text-[10px] text-blush-500 mt-1">Out of stock</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => toggle(product)}
                      className="text-stone-400 hover:text-blush-500 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <X size={16} />
                    </button>
                    {product.stock !== 0 && (
                      <button
                        onClick={() => addToCart(product, product.sizes?.[0] || 'One Size', product.colors?.[0] || '', 1)}
                        className="flex items-center gap-1.5 btn-primary py-2 px-4 text-xs mt-auto"
                      >
                        <ShoppingBag size={13} /> Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link to="/products" className="btn-outline">Continue Shopping</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

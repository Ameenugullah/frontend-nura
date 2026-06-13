import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const FALLBACK = 'https://images.unsplash.com/photo-1558171813-5e3d4e0c64ae?w=200&q=60';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, cartCount } = useCart();

  const shipping = subtotal > 30000 ? 0 : 2500;
  const total    = subtotal + shipping;

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 flex items-center justify-center">
        <div className="text-center px-6">
          <ShoppingBag size={48} className="text-stone-300 mx-auto mb-4" strokeWidth={1} />
          <h2 className="font-display text-3xl text-charcoal-800 font-light italic mb-3">Your cart is empty</h2>
          <p className="font-body text-sm text-stone-400 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-6">
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <h1 className="font-display text-3xl sm:text-4xl text-charcoal-800 font-light italic mb-8">
          Shopping Cart <span className="font-body text-sm font-normal text-stone-400">({cartCount} items)</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* cart items */}
          <div className="lg:col-span-2 space-y-0">
            <div className="hidden sm:grid grid-cols-12 gap-4 font-body text-[10px] tracking-[0.15em] uppercase text-stone-400 pb-3 border-b border-stone-200 mb-2">
              <span className="col-span-6">Product</span>
              <span className="col-span-2 text-center">Price</span>
              <span className="col-span-2 text-center">Quantity</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {cartItems.map(item => (
              <div key={item.key} className="grid sm:grid-cols-12 gap-4 items-center border-b border-stone-100 py-5">
                {/* product */}
                <div className="sm:col-span-6 flex items-center gap-4">
                  <Link to={`/products/${item.id}`} className="shrink-0 w-20 h-24 bg-stone-100 overflow-hidden">
                    <img
                      src={item.images?.[0] || FALLBACK}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }}
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link to={`/products/${item.id}`}
                      className="font-body text-sm font-medium text-charcoal-800 hover:text-blush-500 transition-colors line-clamp-2 block">
                      {item.name}
                    </Link>
                    <p className="font-body text-xs text-stone-400 mt-1">
                      {item.color}{item.size !== 'One Size' ? ` / ${item.size}` : ''}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="flex items-center gap-1 font-body text-xs text-stone-400 hover:text-blush-500 mt-2 transition-colors">
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                </div>

                {/* price (desktop) */}
                <div className="hidden sm:block sm:col-span-2 text-center font-body text-sm text-charcoal-800">
                  ₦{item.price.toLocaleString('en-NG')}
                </div>

                {/* quantity */}
                <div className="sm:col-span-2 flex items-center justify-center">
                  <div className="flex items-center border border-stone-200">
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-body text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* total */}
                <div className="sm:col-span-2 text-right font-body text-sm font-semibold text-charcoal-900">
                  ₦{(item.price * item.quantity).toLocaleString('en-NG')}
                </div>
              </div>
            ))}
          </div>

          {/* order summary */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-white border border-stone-200 p-6">
              <h3 className="font-display text-xl text-charcoal-800 font-light mb-5">Order Summary</h3>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-stone-500">Subtotal ({cartCount} items)</span>
                  <span>₦{subtotal.toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-stone-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString('en-NG')}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="font-body text-[10px] text-stone-400">
                    Add ₦{(30000 - subtotal).toLocaleString('en-NG')} more for free shipping
                  </p>
                )}
              </div>
              <div className="border-t border-stone-200 pt-4 mb-6">
                <div className="flex justify-between font-body font-semibold">
                  <span>Total</span>
                  <span className="text-blush-500 text-lg">₦{total.toLocaleString('en-NG')}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full justify-center py-3.5 text-base flex items-center gap-2">
                Proceed to Checkout <ArrowRight size={17} />
              </Link>
              <Link to="/products" className="block text-center font-body text-sm text-stone-400 hover:text-charcoal-800 mt-4 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

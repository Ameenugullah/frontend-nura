import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const FALLBACK = '/images/placeholder-product.svg';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, cartCount } = useCart();

  // Nationwide free-shipping threshold (Kano threshold is lower — exact calc happens at checkout)
  const FREE_SHIPPING_THRESHOLD = 300_000;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 2500;
  const total    = subtotal + shipping;

  if (!cartItems.length) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-24 bg-stone-50">
        <div className="px-6 text-center">
          <ShoppingBag size={48} className="mx-auto mb-4 text-stone-300" strokeWidth={1} />
          <h2 className="mb-3 text-3xl italic font-light font-display text-charcoal-800">Your cart is empty</h2>
          <p className="mb-8 text-sm font-body text-stone-400">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 bg-stone-50">
      <div className="px-6 pb-20 mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl italic font-light font-display sm:text-4xl text-charcoal-800">
          Shopping Cart <span className="text-sm font-normal font-body text-stone-400">({cartCount} items)</span>
        </h1>

        <div className="grid items-start gap-8 lg:grid-cols-3">
          {/* cart items */}
          <div className="space-y-0 lg:col-span-2">
            <div className="hidden sm:grid grid-cols-12 gap-4 font-body text-[10px] tracking-[0.15em] uppercase text-stone-400 pb-3 border-b border-stone-200 mb-2">
              <span className="col-span-6">Product</span>
              <span className="col-span-2 text-center">Price</span>
              <span className="col-span-2 text-center">Quantity</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {cartItems.map(item => (
              <div key={item.key} className="grid items-center gap-4 py-5 border-b sm:grid-cols-12 border-stone-100">
                {/* product */}
                <div className="flex items-center gap-4 sm:col-span-6">
                  <Link to={`/products/${item.id}`} className="w-20 h-24 overflow-hidden shrink-0 bg-stone-100">
                    <img
                      src={item.images?.[0] || FALLBACK}
                      alt={item.name}
                      className="object-cover w-full h-full"
                      onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }}
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link to={`/products/${item.id}`}
                      className="block text-sm font-medium transition-colors font-body text-charcoal-800 hover:text-blush-500 line-clamp-2">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs font-body text-stone-400">
                      {item.color}{item.size !== 'One Size' ? ` / ${item.size}` : ''}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="flex items-center gap-1 mt-2 text-xs transition-colors font-body text-stone-400 hover:text-blush-500">
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                </div>

                {/* price (desktop) */}
                <div className="hidden text-sm text-center sm:block sm:col-span-2 font-body text-charcoal-800">
                  ₦{item.price.toLocaleString('en-NG')}
                </div>

                {/* quantity */}
                <div className="flex items-center justify-center sm:col-span-2">
                  <div className="flex items-center border border-stone-200">
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-stone-50">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-sm text-center font-body">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-stone-50">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* total */}
                <div className="text-sm font-semibold text-right sm:col-span-2 font-body text-charcoal-900">
                  ₦{(item.price * item.quantity).toLocaleString('en-NG')}
                </div>
              </div>
            ))}
          </div>

          {/* order summary */}
          <div className="lg:sticky lg:top-28">
            <div className="p-6 bg-white border border-stone-200">
              <h3 className="mb-5 text-xl font-light font-display text-charcoal-800">Order Summary</h3>
              <div className="mb-5 space-y-3">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-stone-500">Subtotal ({cartCount} items)</span>
                  <span>₦{subtotal.toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-stone-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString('en-NG')}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="font-body text-[10px] text-stone-400">
                    Add ₦{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('en-NG')} more for free shipping (final rate set at checkout)
                  </p>
                )}
              </div>
              <div className="pt-4 mb-6 border-t border-stone-200">
                <div className="flex justify-between font-semibold font-body">
                  <span>Total</span>
                  <span className="text-lg text-blush-500">₦{total.toLocaleString('en-NG')}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full justify-center py-3.5 text-base flex items-center gap-2">
                Proceed to Checkout <ArrowRight size={17} />
              </Link>
              <Link to="/products" className="block mt-4 text-sm text-center transition-colors font-body text-stone-400 hover:text-charcoal-800">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
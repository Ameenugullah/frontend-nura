import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, CreditCard, ChevronRight, Lock, CheckCircle, Truck, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../lib/api';
import {
  initializePaystackPayment,
  initializeMoniepointPayment,
  sendWhatsAppOrder,
} from '../lib/paystack';

const STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River',
  'Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano',
  'Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun',
  'Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

const STEPS = ['Delivery', 'Payment', 'Confirm'];

// ── Shipping logic ────────────────────────────────────────────────────────────
// Store Pickup  → always ₦0
// Kano state    → free if subtotal ≥ ₦200,000  else ₦2,500
// Rest of Nigeria → free if subtotal ≥ ₦300,000 else ₦2,500
const FLAT_RATE              = 2_500;
const KANO_FREE_THRESHOLD    = 200_000;
const NIGERIA_FREE_THRESHOLD = 300_000;

function calcShipping(deliveryMethod, state, subtotal) {
  if (deliveryMethod === 'pickup') return 0;
  const isKano = state?.toLowerCase() === 'kano';
  const threshold = isKano ? KANO_FREE_THRESHOLD : NIGERIA_FREE_THRESHOLD;
  return subtotal >= threshold ? 0 : FLAT_RATE;
}

function shippingLabel(deliveryMethod, state, subtotal) {
  if (deliveryMethod === 'pickup') return 'Store Pickup — Free';
  const isKano    = state?.toLowerCase() === 'kano';
  const threshold = isKano ? KANO_FREE_THRESHOLD : NIGERIA_FREE_THRESHOLD;
  const isFree    = subtotal >= threshold;
  if (isFree) return `Free delivery (orders ≥ ₦${threshold.toLocaleString('en-NG')})`;
  return `₦${FLAT_RATE.toLocaleString('en-NG')} — Free over ₦${threshold.toLocaleString('en-NG')}`;
}

export default function Checkout() {
  const { cartItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState('home');
  const [step,           setStep]           = useState(0);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [orderId,        setOrderId]        = useState('');
  const [method,         setMethod]         = useState('online');   // 'online' | 'moniepoint' | 'whatsapp'
  const [whatsappDone,   setWhatsappDone]   = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Kano',
    notes: '',
  });

  const shipping = useMemo(
    () => calcShipping(deliveryMethod, form.state, subtotal),
    [deliveryMethod, form.state, subtotal],
  );
  const total = subtotal + shipping;

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setError('');
  };

  const validate = () => {
    const { customerName, email, phone, address, city } = form;
    if (!customerName.trim()) return 'Please enter your full name.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email.';
    if (!phone.trim()) return 'Please enter your phone number.';
    if (deliveryMethod === 'home') {
      if (!address.trim()) return 'Please enter your delivery address.';
      if (!city.trim()) return 'Please enter your city.';
    }
    return '';
  };

  const goToPayment = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep(1);
  };

  const placeOrder = async () => {
    if (!cartItems.length) return;
    setLoading(true);
    setError('');

    let newOrderId = '';
    try {
      const record = await createOrder({
        ...form,
        deliveryMethod,
        items: cartItems.map(i => ({
          id: i.id, name: i.name, price: i.price,
          color: i.color, size: i.size, quantity: i.quantity,
        })),
        subtotal,
        shipping,
        total,
        paymentMethod: method,
      });
      newOrderId = record.id;
    } catch {
      setLoading(false);
      setError('Could not create your order. Please check your connection and try again.');
      return;
    }

    setOrderId(newOrderId);

    if (method === 'online') {
      initializePaystackPayment({
        email:   form.email,
        amount:  total,
        orderId: newOrderId,
        name:    form.customerName,
        phone:   form.phone,
        onPopupClosed: ({ cancelled }) => {
          setLoading(false);
          if (cancelled) {
            setError("Payment was cancelled. You can try again whenever you're ready.");
          } else {
            navigate(`/order/${newOrderId}/verifying`);
          }
        },
      });

    } else if (method === 'moniepoint') {
      initializeMoniepointPayment({
        email:   form.email,
        amount:  total,
        orderId: newOrderId,
        name:    form.customerName,
        phone:   form.phone,
        onDone: ({ cancelled }) => {
          setLoading(false);
          if (cancelled) {
            setError("Payment was cancelled. You can try again whenever you're ready.");
          } else {
            navigate(`/order/${newOrderId}/verifying`);
          }
        },
      });

    } else {
      // WhatsApp
      sendWhatsAppOrder({
        customerName:   form.customerName,
        phone:          form.phone,
        address:        deliveryMethod === 'pickup' ? 'STORE PICKUP' : form.address,
        city:           deliveryMethod === 'pickup' ? 'Kano (Store)' : form.city,
        state:          form.state,
        deliveryMethod,
        items:          cartItems,
        subtotal,
        shipping,
        total,
        orderId:        newOrderId,
      });
      setLoading(false);
      clearCart();
      setWhatsappDone(true);
      setStep(2);
    }
  };

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (!cartItems.length && step < 2) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="px-6 text-center">
          <h2 className="mb-4 text-3xl italic font-light font-display text-charcoal-800">Your cart is empty</h2>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  // ── WhatsApp success screen ─────────────────────────────────────────────────
  if (step === 2 && whatsappDone) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6 bg-stone-50">
        <div className="w-full max-w-md text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-green-50">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="mb-3 text-4xl italic font-light font-display text-charcoal-800">Order Sent!</h1>
          <p className="mb-2 text-sm font-body text-stone-500">
            Your order has been sent to our WhatsApp. We'll confirm shortly and provide payment details.
          </p>
          {orderId && (
            <p className="mb-8 text-xs font-body text-stone-400">
              Order ref: <span className="font-semibold text-charcoal-800">NB-{orderId.slice(-6)}</span>
            </p>
          )}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/products" className="btn-primary">Continue Shopping</Link>
            <Link to="/" className="btn-outline">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-6 bg-stone-50">
      <div className="max-w-6xl px-6 pb-20 mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-2xl font-script text-charcoal-800">Nura Bahar</Link>
          <div className="flex items-center gap-1 text-stone-400">
            <Lock size={12} />
            <span className="text-xs font-body">Secure Checkout</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 font-body text-xs font-medium ${i <= step ? 'text-charcoal-900' : 'text-stone-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 transition-colors ${
                  i < step    ? 'bg-charcoal-900 border-charcoal-900 text-white'
                  : i === step ? 'border-charcoal-900 text-charcoal-900'
                  : 'border-stone-300 text-stone-400'
                }`}>{i < step ? '✓' : i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 sm:w-24 h-px mx-2 transition-colors ${i < step ? 'bg-charcoal-900' : 'bg-stone-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-5">

          {/* ── Left: forms ── */}
          <div className="space-y-6 lg:col-span-3">

            {/* STEP 0: Delivery */}
            {step === 0 && (
              <div className="p-6 bg-white border border-stone-200 sm:p-8">
                <h2 className="mb-6 text-2xl font-light font-display text-charcoal-800">Delivery Information</h2>

                {/* Delivery method */}
                <div className="mb-6">
                  <p className="block mb-3 text-xs tracking-wider uppercase font-body text-stone-500">Delivery Method *</p>
                  <div className="grid grid-cols-2 gap-3">

                    <label className={`flex items-start gap-3 p-3 border-2 cursor-pointer transition-colors ${
                      deliveryMethod === 'home' ? 'border-charcoal-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
                    }`}>
                      <input type="radio" name="delivery" value="home"
                        checked={deliveryMethod === 'home'}
                        onChange={() => setDeliveryMethod('home')}
                        className="mt-0.5 accent-charcoal-900" />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Truck size={13} className="text-charcoal-700 shrink-0" />
                          <span className="text-sm font-medium font-body text-charcoal-800">Home Delivery</span>
                        </div>
                        <p className="font-body text-[10px] text-stone-400 leading-snug">
                          {form.state.toLowerCase() === 'kano'
                            ? `Free over ₦${KANO_FREE_THRESHOLD.toLocaleString('en-NG')}`
                            : `Free over ₦${NIGERIA_FREE_THRESHOLD.toLocaleString('en-NG')}`}
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 border-2 cursor-pointer transition-colors ${
                      deliveryMethod === 'pickup' ? 'border-charcoal-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
                    }`}>
                      <input type="radio" name="delivery" value="pickup"
                        checked={deliveryMethod === 'pickup'}
                        onChange={() => setDeliveryMethod('pickup')}
                        className="mt-0.5 accent-charcoal-900" />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Store size={13} className="text-charcoal-700 shrink-0" />
                          <span className="text-sm font-medium font-body text-charcoal-800">Store Pickup</span>
                        </div>
                        <p className="font-body text-[10px] text-green-600 font-medium">Always Free — ₦0</p>
                      </div>
                    </label>
                  </div>

                  {deliveryMethod === 'pickup' && (
                    <p className="pl-1 mt-2 text-xs font-body text-stone-500">
                      📍 Pick up at our Kano store. We'll send the exact address via WhatsApp after you order.
                    </p>
                  )}
                </div>

                {/* Customer fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Full Name *</label>
                    <input value={form.customerName} onChange={e => update('customerName', e.target.value)}
                      placeholder="Fatima Abubakar" className="input-field" />
                  </div>
                  <div>
                    <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                      placeholder="fatima@example.com" className="input-field" />
                  </div>
                  <div>
                    <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Phone *</label>
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                      placeholder="+234 800 000 0000" className="input-field" />
                  </div>

                  {deliveryMethod === 'home' && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Street Address *</label>
                        <input value={form.address} onChange={e => update('address', e.target.value)}
                          placeholder="12 Ahmadu Bello Way" className="input-field" />
                      </div>
                      <div>
                        <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">City *</label>
                        <input value={form.city} onChange={e => update('city', e.target.value)}
                          placeholder="Kano" className="input-field" />
                      </div>
                      <div>
                        <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">State</label>
                        <select value={form.state} onChange={e => update('state', e.target.value)} className="input-field">
                          {STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Order Notes (optional)</label>
                    <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)}
                      placeholder="Any special instructions…" className="resize-none input-field" />
                  </div>
                </div>

                {error && <p className="mt-4 text-xs font-body text-blush-500">{error}</p>}

                <button onClick={goToPayment}
                  className="btn-primary w-full justify-center mt-6 py-3.5 flex items-center gap-2">
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <div className="p-6 bg-white border border-stone-200 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(0)}
                    className="text-xs transition-colors font-body text-stone-400 hover:text-charcoal-800">← Back</button>
                  <h2 className="text-2xl font-light font-display text-charcoal-800">Payment Method</h2>
                </div>

                <div className="mb-8 space-y-3">

                  {/* Paystack */}
                  <label className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-colors ${
                    method === 'online' ? 'border-charcoal-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input type="radio" name="payment" value="online" checked={method === 'online'}
                      onChange={() => setMethod('online')} className="mt-1 accent-charcoal-900" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={16} className="text-blush-500" />
                        <span className="text-sm font-semibold font-body text-charcoal-800">Pay with Paystack</span>
                        <span className="font-body text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5">Secure</span>
                      </div>
                      <p className="text-xs leading-relaxed font-body text-stone-500">
                        Debit/credit card, bank transfer, or USSD. Verified server-side automatically.
                      </p>
                    </div>
                  </label>

                  {/* Moniepoint */}
                  <label className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-colors ${
                    method === 'moniepoint' ? 'border-charcoal-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input type="radio" name="payment" value="moniepoint" checked={method === 'moniepoint'}
                      onChange={() => setMethod('moniepoint')} className="mt-1 accent-charcoal-900" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={16} className="text-blue-500" />
                        <span className="text-sm font-semibold font-body text-charcoal-800">Pay with Moniepoint</span>
                        <span className="font-body text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5">Bank Transfer</span>
                      </div>
                      <p className="text-xs leading-relaxed font-body text-stone-500">
                        Pay via Moniepoint — instant bank transfer or card payment.
                      </p>
                    </div>
                  </label>

                  {/* WhatsApp */}
                  <label className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-colors ${
                    method === 'whatsapp' ? 'border-charcoal-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input type="radio" name="payment" value="whatsapp" checked={method === 'whatsapp'}
                      onChange={() => setMethod('whatsapp')} className="mt-1 accent-charcoal-900" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle size={16} className="text-green-500" />
                        <span className="text-sm font-semibold font-body text-charcoal-800">Pay via WhatsApp</span>
                        <span className="font-body text-[10px] text-green-600 bg-green-50 px-2 py-0.5">Popular</span>
                      </div>
                      <p className="text-xs leading-relaxed font-body text-stone-500">
                        Order sent to admin WhatsApp. They'll confirm and provide bank transfer details.
                      </p>
                    </div>
                  </label>
                </div>

                {error && <p className="mb-4 text-xs font-body text-blush-500">{error}</p>}

                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 flex items-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                      Processing…
                    </span>
                  ) : method === 'whatsapp' ? (
                    <><MessageCircle size={16} /> Send Order to WhatsApp</>
                  ) : (
                    <><CreditCard size={16} /> Pay ₦{total.toLocaleString('en-NG')}</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <Lock size={11} className="text-stone-400" />
                  <span className="font-body text-[10px] text-stone-400">Secured · Payments verified server-side</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: order summary ── */}
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <div className="p-6 bg-white border border-stone-200">
              <h3 className="mb-5 text-xl font-light font-display text-charcoal-800">Order Summary</h3>

              <div className="mb-5 space-y-3 overflow-y-auto max-h-64 no-scrollbar">
                {cartItems.map(item => (
                  <div key={item.key} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="h-16 overflow-hidden w-14 bg-stone-100">
                        <img
                          src={item.images?.[0] || '/images/placeholder-product.svg'}
                          alt={item.name}
                          className="object-cover w-full h-full"
                          onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder-product.svg'; }}
                        />
                      </div>
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-charcoal-800 text-white text-[9px] font-body font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium font-body text-charcoal-800 line-clamp-1">{item.name}</p>
                      <p className="font-body text-[10px] text-stone-400">
                        {item.color}{item.size !== 'One Size' ? ` / ${item.size}` : ''}
                      </p>
                    </div>
                    <p className="text-xs font-semibold font-body text-charcoal-800 shrink-0">
                      ₦{(item.price * item.quantity).toLocaleString('en-NG')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm font-body text-stone-500">
                  <span>Subtotal</span>
                  <span className="text-charcoal-800">₦{subtotal.toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between text-sm font-body text-stone-500">
                  <span>{deliveryMethod === 'pickup' ? 'Store Pickup' : 'Delivery'}</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-charcoal-800'}>
                    {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString('en-NG')}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="font-body text-[10px] text-stone-400 text-right leading-snug">
                    {shippingLabel(deliveryMethod, form.state, subtotal)}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-stone-200">
                <div className="flex justify-between font-semibold font-body">
                  <span>Total</span>
                  <span className="text-lg text-blush-500">₦{total.toLocaleString('en-NG')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
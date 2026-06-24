import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, CreditCard, ChevronRight, Lock, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../lib/api';
import { initializePaystackPayment, sendWhatsAppOrder } from '../lib/paystack';

const STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River',
  'Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano',
  'Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun',
  'Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

const STEPS = ['Delivery', 'Payment', 'Confirm'];

export default function Checkout() {
  const { cartItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const shipping = subtotal > 30000 ? 0 : 2500;
  const total    = subtotal + shipping;

  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [orderId, setOrderId]   = useState('');
  const [method, setMethod]     = useState('online'); // 'online' | 'whatsapp'
  const [whatsappDone, setWhatsappDone] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Kano',
    notes: '',
  });

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setError('');
  };

  const validateDelivery = () => {
    const { customerName, email, phone, address, city } = form;
    if (!customerName.trim()) return 'Please enter your full name.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email.';
    if (!phone.trim()) return 'Please enter your phone number.';
    if (!address.trim()) return 'Please enter your delivery address.';
    if (!city.trim()) return 'Please enter your city.';
    return '';
  };

  const goToPayment = () => {
    const err = validateDelivery();
    if (err) { setError(err); return; }
    setError('');
    setStep(1);
  };

  // ── place order, then either open Paystack or send to WhatsApp ───────────
  const placeOrder = async () => {
    if (!cartItems.length) return;
    setLoading(true);
    setError('');

    let newOrderId = '';
    try {
      const record = await createOrder({
        ...form,
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
    } catch (err) {
      setLoading(false);
      setError('Could not create your order. Please check your connection and try again.');
      console.error('createOrder failed:', err);
      return;
    }

    setOrderId(newOrderId);

    if (method === 'online') {
      // IMPORTANT: we do NOT clear the cart or show success here. The
      // Paystack popup's callback only tells us the customer finished the
      // card flow — it is not proof of payment. We hand off to
      // /order/:id/verifying, which polls PocketBase for the server-verified
      // result (see backend/pb_hooks/payments.pb.js).
      initializePaystackPayment({
        email:   form.email,
        amount:  total,
        orderId: newOrderId,
        name:    form.customerName,
        phone:   form.phone,
        onPopupClosed: ({ cancelled }) => {
          setLoading(false);
          if (cancelled) {
            setError('Payment was cancelled. You can try again whenever you’re ready.');
          } else {
            navigate(`/order/${newOrderId}/verifying`);
          }
        },
      });
    } else {
      // WhatsApp orders stay "pending" until the admin manually confirms
      // payment in chat and updates the order status in the dashboard.
      sendWhatsAppOrder({
        customerName: form.customerName,
        phone:        form.phone,
        address:      form.address,
        city:         form.city,
        state:        form.state,
        items:        cartItems,
        subtotal,
        shipping,
        total,
        orderId:      newOrderId,
      });
      setLoading(false);
      clearCart();
      setWhatsappDone(true);
      setStep(2);
    }
  };

  if (!cartItems.length && step < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center px-6">
          <h2 className="font-display text-3xl text-charcoal-800 font-light italic mb-4">Your cart is empty</h2>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  // ── WhatsApp confirmation screen (Paystack flow redirects away instead) ──
  if (step === 2 && whatsappDone) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="font-display text-4xl text-charcoal-800 font-light italic mb-3">Order Sent!</h1>
          <p className="font-body text-sm text-stone-500 mb-2">
            Your order has been sent to our WhatsApp. The admin will confirm and send payment details shortly.
            Your order will remain "Pending" until payment is confirmed.
          </p>
          {orderId && (
            <p className="font-body text-xs text-stone-400 mb-6">
              Order ref: <span className="font-semibold text-charcoal-800">NB-{orderId.slice(-6)}</span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="btn-primary">Continue Shopping</Link>
            <Link to="/" className="btn-outline">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-6">
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="font-script text-2xl text-charcoal-800">Nura Bahar</Link>
          <div className="flex items-center gap-1 text-stone-400">
            <Lock size={12} />
            <span className="font-body text-xs">Secure Checkout</span>
          </div>
        </div>

        {/* step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 font-body text-xs font-medium ${i <= step ? 'text-charcoal-900' : 'text-stone-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 transition-colors ${
                  i < step ? 'bg-charcoal-900 border-charcoal-900 text-white'
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

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* ── left form ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* STEP 0: Delivery */}
            {step === 0 && (
              <div className="bg-white border border-stone-200 p-6 sm:p-8">
                <h2 className="font-display text-2xl text-charcoal-800 font-light mb-6">Delivery Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
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
                  <div className="sm:col-span-2">
                    <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Order Notes (optional)</label>
                    <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)}
                      placeholder="Any special instructions…" className="input-field resize-none" />
                  </div>
                </div>

                {error && <p className="font-body text-xs text-blush-500 mt-4">{error}</p>}

                <button onClick={goToPayment}
                  className="btn-primary w-full justify-center mt-6 py-3.5 flex items-center gap-2">
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 1: Payment Method */}
            {step === 1 && (
              <div className="bg-white border border-stone-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(0)}
                    className="font-body text-xs text-stone-400 hover:text-charcoal-800 transition-colors">← Back</button>
                  <h2 className="font-display text-2xl text-charcoal-800 font-light">Payment Method</h2>
                </div>

                <div className="space-y-4 mb-8">
                  {/* Paystack */}
                  <label className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-colors ${
                    method === 'online' ? 'border-charcoal-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input type="radio" name="payment" value="online" checked={method === 'online'}
                      onChange={() => setMethod('online')} className="mt-1 accent-charcoal-900" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={16} className="text-blush-500" />
                        <span className="font-body text-sm font-semibold text-charcoal-800">Pay Online — Paystack</span>
                        <span className="font-body text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5">Secure</span>
                      </div>
                      <p className="font-body text-xs text-stone-500 leading-relaxed">
                        Pay instantly with your debit/credit card, bank transfer, or USSD via Paystack.
                        Your order is confirmed only after we verify the payment on our server.
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
                        <span className="font-body text-sm font-semibold text-charcoal-800">Pay via WhatsApp</span>
                        <span className="font-body text-[10px] text-green-600 bg-green-50 px-2 py-0.5">Popular</span>
                      </div>
                      <p className="font-body text-xs text-stone-500 leading-relaxed">
                        Your order details will be sent to our WhatsApp. The admin will confirm your order
                        and provide bank transfer or other payment details in chat.
                      </p>
                    </div>
                  </label>
                </div>

                {error && <p className="font-body text-xs text-blush-500 mb-4">{error}</p>}

                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 flex items-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : method === 'online' ? (
                    <><CreditCard size={16} /> Pay ₦{total.toLocaleString('en-NG')}</>
                  ) : (
                    <><MessageCircle size={16} /> Send Order to WhatsApp</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <Lock size={11} className="text-stone-400" />
                  <span className="font-body text-[10px] text-stone-400">Payments verified server-side via Paystack</span>
                </div>
              </div>
            )}
          </div>

          {/* ── right summary ── */}
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <div className="bg-white border border-stone-200 p-6">
              <h3 className="font-display text-xl text-charcoal-800 font-light mb-5">Order Summary</h3>
              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto no-scrollbar">
                {cartItems.map(item => (
                  <div key={item.key} className="flex gap-3 items-center">
                    <div className="relative shrink-0">
                      <div className="w-14 h-16 bg-stone-100 overflow-hidden">
                        <img src={item.images?.[0] || '/images/placeholder-product.svg'} alt={item.name}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder-product.svg'; }}
                        />
                      </div>
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-charcoal-800 text-white text-[9px] font-body font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs font-medium text-charcoal-800 line-clamp-1">{item.name}</p>
                      <p className="font-body text-[10px] text-stone-400">{item.color}{item.size !== 'One Size' ? ` / ${item.size}` : ''}</p>
                    </div>
                    <p className="font-body text-xs font-semibold text-charcoal-800 shrink-0">
                      ₦{(item.price * item.quantity).toLocaleString('en-NG')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-200 pt-4 space-y-2.5">
                <div className="flex justify-between font-body text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span className="text-charcoal-800">₦{subtotal.toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between font-body text-sm text-stone-500">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium text-sm' : 'text-charcoal-800'}>
                    {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString('en-NG')}`}
                  </span>
                </div>
              </div>
              <div className="border-t border-stone-200 mt-4 pt-4">
                <div className="flex justify-between font-body font-semibold">
                  <span>Total</span>
                  <span className="text-blush-500 text-lg">₦{total.toLocaleString('en-NG')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

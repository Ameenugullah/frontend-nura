import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getOrderById, pollOrderPaymentStatus } from '../lib/api';
import { useCart } from '../context/CartContext';

export default function OrderVerifying() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [state, setState] = useState('verifying');
  const [order, setOrder] = useState(null);
  const cartClearedRef = useRef(false);

  useEffect(() => {
    // Reset to verifying state whenever the order ID changes (e.g. after a retry
    // creates a new order). This also ensures the displayed order ref updates.
    setState('verifying');
    setOrder(null);

    const controller = new AbortController();

    async function run() {
      try {
        const result = await pollOrderPaymentStatus(id, {
          intervalMs: 2000,
          timeoutMs: 90000,
          signal: controller.signal,
        });
        if (controller.signal.aborted || !result) return;
        setOrder(result);
        if (result.paymentStatus === 'paid') {
          setState('paid');
          if (!cartClearedRef.current) {
            clearCart();
            cartClearedRef.current = true;
          }
        } else {
          setState('failed');
        }
      } catch {
        if (controller.signal.aborted) return;
        setState('timeout');
        try {
          const fallback = await getOrderById(id);
          if (!controller.signal.aborted) setOrder(fallback);
        } catch { /* ignore */ }
      }
    }

    run();
    // Aborting the controller stops the poll loop immediately — no zombie requests
    // for stale order IDs after a retry navigates to a new /order/:id/verifying URL.
    return () => { controller.abort(); };
  }, [id, clearCart]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">

        {state === 'verifying' && (
          <>
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={28} className="text-charcoal-800 animate-spin" />
            </div>
            <h1 className="font-display text-3xl text-charcoal-800 font-light italic mb-3">Verifying your payment…</h1>
            <p className="font-body text-sm text-stone-500 mb-2">
              We're confirming your payment. This usually takes a few seconds — please don't close this page.
            </p>
            {order && (
              <p className="font-body text-xs text-stone-400 mt-4">
                Order ref: <span className="font-semibold text-charcoal-800">NB-{id.slice(-6)}</span>
              </p>
            )}
          </>
        )}

        {state === 'paid' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="font-display text-4xl text-charcoal-800 font-light italic mb-3">Payment Confirmed!</h1>
            <p className="font-body text-sm text-stone-500 mb-2">
              Your payment was verified and your order is now being processed.
            </p>
            <p className="font-body text-xs text-stone-400 mb-6">
              Order ref: <span className="font-semibold text-charcoal-800">NB-{id.slice(-6)}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/products" className="btn-primary">Continue Shopping</Link>
              <Link to="/" className="btn-outline">Back to Home</Link>
            </div>
          </>
        )}

        {(state === 'failed' || state === 'timeout') && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="font-display text-3xl text-charcoal-800 font-light italic mb-3">
              {state === 'timeout' ? "We couldn't confirm this in time" : 'Payment not confirmed'}
            </h1>
            <p className="font-body text-sm text-stone-500 mb-2">
              {state === 'timeout'
                ? 'Verification is taking longer than expected. If your card was charged, please contact us with your order reference — do not pay again until you hear from us.'
                : "We weren't able to verify this payment. No charge should have gone through. You can try again."}
            </p>
            <p className="font-body text-xs text-stone-400 mb-6">
              Order ref: <span className="font-semibold text-charcoal-800">NB-{id.slice(-6)}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/checkout')} className="btn-primary">Try Again</button>
              <Link to="/faq" className="btn-outline">Contact Support</Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

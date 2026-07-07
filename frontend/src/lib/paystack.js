// ─────────────────────────────────────────────────────────────────────────────
// lib/paystack.js  —  Paystack payment integration
//
// ENV VARIABLE (set in Railway → frontend-nura → Variables):
//   VITE_PAYSTACK_PUBLIC_KEY   — from dashboard.paystack.com/#/settings/developer
//                                Use pk_test_... for testing, pk_live_... for production
// ─────────────────────────────────────────────────────────────────────────────

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve();
    const script   = document.createElement('script');
    script.src     = 'https://js.paystack.co/v1/inline.js';
    script.onload  = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Opens the Paystack inline payment popup.
 *
 * Security model:
 *   - The frontend NEVER marks an order as paid.
 *   - After popup closes (success or cancel), the user is redirected to the
 *     polling screen (/order/:id/verifying).
 *   - PocketBase only marks paymentStatus = "paid" after the server-side
 *     Paystack webhook independently verifies the transaction signature.
 *
 * @param {object} opts
 * @param {string}   opts.email
 * @param {number}   opts.amount       — Naira (converted to kobo internally)
 * @param {string}   opts.orderId      — PocketBase order ID
 * @param {string}   [opts.name]
 * @param {string}   [opts.phone]
 * @param {function} opts.onPopupClosed — Called with { reference, cancelled: boolean }
 */
export async function initializePaystackPayment({
  email, amount, orderId, name, phone, onPopupClosed,
}) {
  if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.includes('REPLACE')) {
    alert('Online payment is not yet configured. Please contact us directly to place your order.');
    onPopupClosed?.({ reference: '', cancelled: true });
    return;
  }

  await loadPaystackScript();

  const reference = `NB_${orderId}`;

  const handler = window.PaystackPop.setup({
    key:      PAYSTACK_PUBLIC_KEY,
    email,
    amount:   Math.round(amount * 100), // convert Naira → kobo
    currency: 'NGN',
    ref:      reference,
    metadata: {
      order_id: orderId,
      custom_fields: [
        { display_name: 'Order ID',       variable_name: 'order_id',       value: orderId    },
        { display_name: 'Customer Name',  variable_name: 'customer_name',  value: name  || '' },
        { display_name: 'Customer Phone', variable_name: 'customer_phone', value: phone || '' },
      ],
    },
    callback: () => {
      // Paystack calls this on successful charge — do NOT trust it as proof.
      // Redirect to the polling screen; the backend webhook is the source of truth.
      onPopupClosed?.({ reference, cancelled: false });
    },
    onClose: () => {
      onPopupClosed?.({ reference, cancelled: true });
    },
  });

  handler.openIframe();
}

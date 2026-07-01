// ─────────────────────────────────────────────────────────────────────────────
// lib/paystack.js  —  Payment integrations: Paystack + Moniepoint
//
// ENV VARIABLES (set in Railway → frontend-nura → Variables):
//   VITE_PAYSTACK_PUBLIC_KEY   — from dashboard.paystack.com/#/settings/developer
//   VITE_MONIEPOINT_API_KEY    — from your Moniepoint merchant dashboard
//   VITE_ADMIN_WHATSAPP        — digits only, e.g. 2347040212991
// ─────────────────────────────────────────────────────────────────────────────

const PAYSTACK_PUBLIC_KEY  = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const MONIEPOINT_API_KEY   = import.meta.env.VITE_MONIEPOINT_API_KEY;
const ADMIN_WHATSAPP       = import.meta.env.VITE_ADMIN_WHATSAPP;

// ── Paystack ──────────────────────────────────────────────────────────────────

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve();
    const script  = document.createElement('script');
    script.src    = 'https://js.paystack.co/v1/inline.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Opens the Paystack payment popup.
 * On popup close (success OR cancel), calls onPopupClosed({ reference, cancelled }).
 * NEVER marks an order as paid — that happens server-side via webhook.
 */
export async function initializePaystackPayment({
  email, amount, orderId, name, phone, onPopupClosed,
}) {
  if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.includes('REPLACE')) {
    alert('Online payment is not yet configured. Please use WhatsApp checkout or contact us directly.');
    onPopupClosed?.({ reference: '', cancelled: true });
    return;
  }

  await loadPaystackScript();

  const reference = `NB_${orderId}`;

  const handler = window.PaystackPop.setup({
    key:      PAYSTACK_PUBLIC_KEY,
    email,
    amount:   Math.round(amount * 100), // kobo
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
      // Do NOT trust this as payment proof — redirect to polling screen.
      onPopupClosed?.({ reference, cancelled: false });
    },
    onClose: () => {
      onPopupClosed?.({ reference, cancelled: true });
    },
  });

  handler.openIframe();
}

// ── Moniepoint ────────────────────────────────────────────────────────────────
//
// Moniepoint's web checkout works via a redirect or an inline iframe depending
// on your merchant account type. This implementation uses the standard
// Moniepoint Inline JS SDK (similar to Paystack's approach).
//
// SDK docs: https://developer.moniepoint.com/docs/web-checkout
//
// To activate:
//   1. Set VITE_MONIEPOINT_API_KEY in Railway environment variables
//   2. Confirm with Moniepoint support whether your account uses
//      inline checkout or redirect checkout — update the SDK URL below if needed.

function loadMoniepointScript() {
  return new Promise((resolve, reject) => {
    if (window.MoniepointCheckout) return resolve();
    const script   = document.createElement('script');
    // Replace this URL with the correct SDK URL from your Moniepoint dashboard
    script.src     = 'https://sdk.moniepoint.com/checkout/v1/inline.js';
    script.onload  = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Opens the Moniepoint payment checkout.
 * Behaviour mirrors the Paystack integration — server-side webhook verifies.
 *
 * @param {object} opts
 * @param {string}   opts.email
 * @param {number}   opts.amount       — Naira (converted to kobo internally)
 * @param {string}   opts.orderId      — PocketBase order ID
 * @param {string}   [opts.name]
 * @param {string}   [opts.phone]
 * @param {function} opts.onDone       — Called with { reference, cancelled }
 */
export async function initializeMoniepointPayment({
  email, amount, orderId, name, phone, onDone,
}) {
  if (!MONIEPOINT_API_KEY || MONIEPOINT_API_KEY.includes('REPLACE')) {
    alert('Moniepoint payment is not yet configured. Please use Paystack or WhatsApp checkout.');
    onDone?.({ reference: '', cancelled: true });
    return;
  }

  try {
    await loadMoniepointScript();
  } catch {
    alert('Could not load Moniepoint payment SDK. Please check your internet connection.');
    onDone?.({ reference: '', cancelled: true });
    return;
  }

  const reference = `MP_NB_${orderId}`;

  // Moniepoint Inline SDK call — adjust property names to match your
  // Moniepoint dashboard documentation exactly.
  const checkout = window.MoniepointCheckout.setup({
    key:       MONIEPOINT_API_KEY,
    email,
    amount:    Math.round(amount * 100),  // kobo
    currency:  'NGN',
    reference,
    metadata: {
      order_id:       orderId,
      customer_name:  name  || '',
      customer_phone: phone || '',
    },
    onSuccess: () => {
      onDone?.({ reference, cancelled: false });
    },
    onClose: () => {
      onDone?.({ reference, cancelled: true });
    },
    onError: (err) => {
      console.error('Moniepoint error:', err);
      onDone?.({ reference, cancelled: true });
    },
  });

  checkout.openCheckout();
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

export function sendWhatsAppOrder({
  customerName, phone, address, city, state,
  deliveryMethod, items, subtotal, shipping, total, orderId,
}) {
  if (!ADMIN_WHATSAPP || ADMIN_WHATSAPP === '2348000000000') {
    alert('WhatsApp ordering is temporarily unavailable. Please call us directly.');
    return;
  }

  const itemLines = items
    .map(i =>
      `  • ${i.name} (${i.color}${i.size !== 'One Size' ? ` / ${i.size}` : ''}) x${i.quantity} — ₦${(i.price * i.quantity).toLocaleString('en-NG')}`
    )
    .join('\n');

  const deliveryLine = deliveryMethod === 'pickup'
    ? 'Delivery: *Store Pickup (Kano)*'
    : `Delivery: *Home Delivery*\nAddress: ${address}, ${city}${state ? `, ${state}` : ''}`;

  const message = [
    `🛍️ *New Order from Nura Bahar Store*`,
    `Order Ref: *NB-${orderId}*`,
    ``,
    `👤 *Customer Details*`,
    `Name: ${customerName}`,
    `Phone: ${phone || 'N/A'}`,
    deliveryLine,
    ``,
    `🧺 *Items Ordered*`,
    itemLines,
    ``,
    `💰 *Order Summary*`,
    `Subtotal:  ₦${subtotal.toLocaleString('en-NG')}`,
    `Shipping:  ${shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString('en-NG')}`}`,
    `*Total:    ₦${total.toLocaleString('en-NG')}*`,
    ``,
    `📦 Please confirm this order and send payment details. Thank you!`,
  ].join('\n');

  const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
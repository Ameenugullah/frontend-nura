/**
 * Paystack Integration — client-side initializer ONLY.
 * ---------------------------------------------------------------
 * This file never marks an order as paid. It only:
 *   1. Opens the Paystack popup with the order's PocketBase ID embedded
 *      as the payment reference.
 *   2. On the popup's "callback" (which fires the instant the customer
 *      finishes the card flow — NOT proof of payment), redirects to
 *      /order/:id/verifying, which polls PocketBase until the SERVER-SIDE
 *      webhook hook (pb_hooks/payments.pb.js) has independently verified
 *      the transaction with Paystack's API and flipped paymentStatus.
 *
 * Replace VITE_PAYSTACK_PUBLIC_KEY in your .env file with your real key:
 * https://dashboard.paystack.com/#/settings/developer
 */

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY';

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve();
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Initialize a Paystack payment popup.
 *
 * @param {object} opts
 * @param {string} opts.email        - Customer email
 * @param {number} opts.amount       - Amount in NAIRA (converted to kobo internally)
 * @param {string} opts.orderId      - PocketBase order record ID (used as the reference)
 * @param {string} [opts.name]
 * @param {string} [opts.phone]
 * @param {function} opts.onPopupClosed - Called the instant the popup flow finishes
 *                                         (success OR user closed it). This is NOT
 *                                         payment confirmation — the caller must still
 *                                         poll PocketBase / redirect to a verifying screen.
 */
export async function initializePaystackPayment({ email, amount, orderId, name, phone, onPopupClosed }) {
  await loadPaystackScript();

  // Use the PocketBase order ID directly as part of the reference so the
  // webhook handler can look the order up unambiguously server-side.
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
        { display_name: 'Order ID',       variable_name: 'order_id',       value: orderId },
        { display_name: 'Customer Name',  variable_name: 'customer_name',  value: name || '' },
        { display_name: 'Customer Phone', variable_name: 'customer_phone', value: phone || '' },
      ],
    },
    callback: () => {
      // Do NOT trust this as payment proof. Just hand control back to the
      // caller so it can navigate to the verification/polling screen.
      onPopupClosed && onPopupClosed({ reference, cancelled: false });
    },
    onClose: () => {
      onPopupClosed && onPopupClosed({ reference, cancelled: true });
    },
  });

  handler.openIframe();
}

/**
 * Build a WhatsApp order message and open it in a new tab.
 * WhatsApp orders remain "pending" until the admin manually marks them as
 * processing/paid in the dashboard after confirming payment in chat.
 */
export function sendWhatsAppOrder({ customerName, phone, address, city, state, items, subtotal, shipping, total, orderId }) {
  const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP || '2348000000000';

  const itemLines = items
    .map(i => `  • ${i.name} (${i.color}${i.size !== 'One Size' ? ` / ${i.size}` : ''}) x${i.quantity} — ₦${(i.price * i.quantity).toLocaleString('en-NG')}`)
    .join('\n');

  const message = [
    `🛍️ *New Order from Nura Bahar Store*`,
    `Order Ref: *NB-${orderId}*`,
    ``,
    `👤 *Customer Details*`,
    `Name: ${customerName}`,
    `Phone: ${phone || 'N/A'}`,
    `Address: ${address}, ${city}${state ? `, ${state}` : ''}`,
    ``,
    `🧺 *Items Ordered*`,
    itemLines,
    ``,
    `💰 *Order Summary*`,
    `Subtotal: ₦${subtotal.toLocaleString('en-NG')}`,
    `Shipping: ${shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString('en-NG')}`}`,
    `*Total: ₦${total.toLocaleString('en-NG')}*`,
    ``,
    `📦 Please confirm this order and send payment details. Thank you!`,
  ].join('\n');

  const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

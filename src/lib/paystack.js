/**
 * Paystack Integration
 * ---------------------
 * Replace VITE_PAYSTACK_PUBLIC_KEY in your .env file with your actual key.
 * Get it from: https://dashboard.paystack.com/#/settings/developer
 *
 * Usage:
 *   import { initializePaystackPayment } from '../lib/paystack';
 *   initializePaystackPayment({ email, amount, orderId, onSuccess, onClose });
 */

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY';

/**
 * Dynamically load Paystack inline JS (only once)
 */
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
 * @param {string} opts.email       - Customer email
 * @param {number} opts.amount      - Amount in NAIRA (will be converted to kobo)
 * @param {string} opts.orderId     - Your internal order reference
 * @param {string} [opts.name]      - Customer name (optional)
 * @param {string} [opts.phone]     - Customer phone (optional)
 * @param {function} opts.onSuccess - Called with Paystack transaction reference on success
 * @param {function} opts.onClose   - Called when popup is dismissed without paying
 */
export async function initializePaystackPayment({ email, amount, orderId, name, phone, onSuccess, onClose }) {
  await loadPaystackScript();

  const handler = window.PaystackPop.setup({
    key:       PAYSTACK_PUBLIC_KEY,
    email,
    amount:    Math.round(amount * 100), // kobo
    currency:  'NGN',
    ref:       `NB-${orderId}-${Date.now()}`,
    metadata: {
      custom_fields: [
        { display_name: 'Order ID',        variable_name: 'order_id',      value: orderId },
        { display_name: 'Customer Name',   variable_name: 'customer_name', value: name || '' },
        { display_name: 'Customer Phone',  variable_name: 'customer_phone',value: phone || '' },
      ],
    },
    callback: (response) => {
      // response.reference is the Paystack transaction reference
      onSuccess && onSuccess(response);
    },
    onClose: () => {
      onClose && onClose();
    },
  });

  handler.openIframe();
}

/**
 * Build a WhatsApp order message and open it in a new tab.
 * Admin WhatsApp number is pulled from env.
 *
 * @param {object} opts
 * @param {string} opts.customerName
 * @param {string} opts.phone
 * @param {string} opts.address
 * @param {string} opts.city
 * @param {string} opts.state
 * @param {Array}  opts.items
 * @param {number} opts.subtotal
 * @param {number} opts.shipping
 * @param {number} opts.total
 * @param {string} opts.orderId
 */
export function sendWhatsAppOrder({ customerName, phone, address, city, state, items, subtotal, shipping, total, orderId }) {
  const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP || '2348000000000'; // replace in .env

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

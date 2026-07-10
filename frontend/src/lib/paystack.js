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
    amount:   Math.round(amount * 100),
    currency: 'NGN',
    ref:      reference,
    channels: ['card', 'bank', 'ussd', 'bank_transfer', 'mobile_money', 'qr'],
    metadata: {
      order_id: orderId,
      custom_fields: [
        { display_name: 'Order ID',       variable_name: 'order_id',       value: orderId    },
        { display_name: 'Customer Name',  variable_name: 'customer_name',  value: name  || '' },
        { display_name: 'Customer Phone', variable_name: 'customer_phone', value: phone || '' },
      ],
    },
    callback: () => {
      onPopupClosed?.({ reference, cancelled: false });
    },
    onClose: () => {
      onPopupClosed?.({ reference, cancelled: true });
    },
  });

  handler.openIframe();
}

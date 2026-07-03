/// <reference path="../pb_data/types.d.ts" />

// ─────────────────────────────────────────────────────────────────────────────
// pb_hooks/emails.pb.js — Email notifications for paid orders
//
// PocketBase sends email via its built-in SMTP mailer.
// Configure SMTP in PocketBase Admin UI → Settings → Mail Settings:
//   Host:     smtp.mail.yahoo.com  (or your SMTP provider)
//   Port:     587
//   Username: Nuraarabi@yahoo.com
//   Password: <your Yahoo app password>
//   From:     Nuraarabi@yahoo.com
//
// This hook fires whenever an order's paymentStatus is set to "paid"
// (triggered by the Paystack or Moniepoint webhook in payments.pb.js).
// ─────────────────────────────────────────────────────────────────────────────

onRecordAfterUpdateSuccess((e) => {
  const record = e.record;
  if (!record) return;

  const paymentStatus = record.getString('paymentStatus');
  const prevStatus    = e.app?.dao?.findRecordById?.('orders', record.id)?.getString('paymentStatus') || '';

  // Only fire when transitioning TO "paid" — not on every update
  if (paymentStatus !== 'paid') return;

  const BUSINESS_EMAIL = 'Nuraarabi@yahoo.com';

  // Parse items safely
  let items = [];
  try {
    const raw = record.getString('items');
    items = JSON.parse(raw || '[]');
  } catch (_) {}

  const itemLines = items.map(i =>
    `• ${i.name} (${i.color || ''}${i.size && i.size !== 'One Size' ? ' / ' + i.size : ''}) × ${i.quantity} — ₦${(i.price * i.quantity).toLocaleString('en-NG')}`
  ).join('\n');

  const deliveryMethod = record.getString('deliveryMethod') || 'home';
  const isPickup = deliveryMethod === 'pickup' || record.getString('address') === 'STORE PICKUP';

  const deliveryLine = isPickup
    ? 'Delivery: Store Pickup (Customer will collect from Kano store)'
    : `Delivery: Home Delivery\nAddress:  ${record.getString('address')}, ${record.getString('city')}${record.getString('state') ? ', ' + record.getString('state') : ''}`;

  const shipping  = Number(record.getFloat('shipping') || 0);
  const total     = Number(record.getFloat('total') || 0);
  const subtotal  = Number(record.getFloat('subtotal') || 0);
  const orderId   = record.id;
  const orderRef  = `NB-${orderId.slice(-6).toUpperCase()}`;
  const createdAt = new Date().toLocaleString('en-NG', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Lagos',
  });

  const subject = `✅ New Paid Order ${orderRef} — ₦${total.toLocaleString('en-NG')}`;

  const body = `
NEW PAID ORDER — NURA BAHAR NIGERIA
${'─'.repeat(48)}

Order Reference:  ${orderRef}
Order ID:         ${orderId}
Date & Time:      ${createdAt}
Payment Status:   PAID ✅
Payment Method:   ${record.getString('paymentMethod') || 'online'}
Payment Ref:      ${record.getString('paymentRef') || 'N/A'}

${'─'.repeat(48)}
CUSTOMER DETAILS
${'─'.repeat(48)}
Name:   ${record.getString('customerName')}
Email:  ${record.getString('email')}
Phone:  ${record.getString('phone') || 'N/A'}

${'─'.repeat(48)}
DELIVERY
${'─'.repeat(48)}
${deliveryLine}

${'─'.repeat(48)}
ITEMS ORDERED
${'─'.repeat(48)}
${itemLines || 'No items recorded'}

${'─'.repeat(48)}
ORDER TOTALS
${'─'.repeat(48)}
Subtotal: ₦${subtotal.toLocaleString('en-NG')}
Shipping: ${shipping === 0 ? 'FREE' : '₦' + shipping.toLocaleString('en-NG')}
TOTAL:    ₦${total.toLocaleString('en-NG')}

${'─'.repeat(48)}
View full order in dashboard:
${$os.getenv('VITE_SITE_URL') || 'https://frontend-nura-production.up.railway.app'}/admin/orders

Nura Bahar Nigeria
Maiduguri Road, Opposite Chicken Flavour
Kwanar Maggi, Dangyatin Plaza, Shop No. 7
Kano, Nigeria
`.trim();

  try {
    $app.newMailClient().send({
      from: {
        name:    'Nura Bahar Nigeria',
        address: BUSINESS_EMAIL,
      },
      to: [{ address: BUSINESS_EMAIL }],
      subject,
      text: body,
    });
    $app.logger().info('Order email sent', 'orderId', orderId, 'ref', orderRef);
  } catch (err) {
    $app.logger().error('Order email failed', 'orderId', orderId, 'error', String(err));
  }
}, 'orders');

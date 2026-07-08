export const PAYMENT_METHODS = {
  PAYSTACK: 'paystack',
};

export const ORDER_STATUSES = {
  PENDING:    'pending',
  PROCESSING: 'processing',
  PAID:       'paid',
  SHIPPED:    'shipped',
  DELIVERED:  'delivered',
  CANCELLED:  'cancelled',
  FAILED:     'failed',
  REFUNDED:   'refunded',
};

export const ALL_ORDER_STATUSES = Object.values(ORDER_STATUSES);

export const PAYMENT_STATUSES = {
  UNPAID: 'unpaid',
  PAID:   'paid',
  FAILED: 'failed',
};

export const DELIVERY_METHODS = {
  HOME:   'home',
  PICKUP: 'pickup',
};

export const SHIPPING = {
  FLAT_RATE:              2_500,
  KANO_FREE_THRESHOLD:    200_000,
  NIGERIA_FREE_THRESHOLD: 300_000,
};

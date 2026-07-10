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
  UNPAID:     'unpaid',
  VERIFYING:  'verifying',
  PAID:       'paid',
  FAILED:     'failed',
};

export const DELIVERY_METHODS = {
  DELIVERY: 'delivery',
  PICKUP:   'pickup',
};

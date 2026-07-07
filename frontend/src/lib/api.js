import pb from './pocketbase';
import { normalize } from './categories';

let _productsCache    = null;
let _productsCacheTs  = 0;
const CACHE_TTL_MS    = 60_000; // 1 minute

export async function checkPBHealth() {
  try {
    const res = await fetch(`${pb.baseUrl}/api/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function signUp(email, password, name) {
  const record = await pb.collection('users').create({
    email, password, passwordConfirm: password, name,
  });
  await pb.collection('users').authWithPassword(email, password);
  return record;
}

export async function signIn(email, password) {
  return pb.collection('users').authWithPassword(email, password);
}

export async function signOut() {
  pb.authStore.clear();
}

export function getCurrentUser() {
  return pb.authStore.isValid ? pb.authStore.model : null;
}

export async function requestPasswordReset(email) {
  await pb.collection('users').requestPasswordReset(email);
}

export async function confirmPasswordReset(token, password) {
  await pb.collection('users').confirmPasswordReset(token, password, password);
}

export async function adminLogin(email, password) {
  try {
    await pb.collection('_superusers').authWithPassword(email, password);
    return { success: true };
  } catch {
    return { success: false, error: 'Invalid email or password.' };
  }
}

export function adminLogout() {
  pb.authStore.clear();
}

export function isAdminLoggedIn() {
  return pb.authStore.isValid && pb.authStore.record?.collectionName === '_superusers';
}

export async function getProducts(category, gender) {
  // Return cached result if fresh (and no specific filter is requested)
  const noFilter = (!category || normalize(category) === 'all') &&
                   (!gender   || normalize(gender)   === 'all');

  if (noFilter && _productsCache && Date.now() - _productsCacheTs < CACHE_TTL_MS) {
    return _productsCache;
  }

  try {
    const filters = [];
    if (category && normalize(category) !== 'all') {
      filters.push('category = "' + category.replace(/"/g, '\\"') + '"');
    }
    if (gender && normalize(gender) !== 'all') {
      filters.push('gender = "' + gender.replace(/"/g, '\\"') + '"');
    }

    const params = new URLSearchParams();
    if (filters.length) params.set('filter', filters.join(' && '));
    params.set('perPage', '200');

    const url = pb.baseUrl + '/api/collections/products/records?' + params.toString();
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const items = (data.items || []).map(normalizeProduct);

    if (noFilter) {
      _productsCache   = items;
      _productsCacheTs = Date.now();
    }

    return items;
  } catch (err) {
    console.warn('getProducts failed:', err.message);
    throw err;
  }
}

export function invalidateProductsCache() {
  _productsCache   = null;
  _productsCacheTs = 0;
}

export async function getProductById(id) {
  try {
    const url = pb.baseUrl + '/api/collections/products/records/' + id;
    const res = await fetch(url);
    if (!res.ok) return null;
    return normalizeProduct(await res.json());
  } catch {
    return null;
  }
}

export async function createProduct(data) {
  try {
    const formData = buildProductFormData(data);
    formData.append('rating', data.rating ?? 5);
    const record = await pb.collection('products').create(formData);
    invalidateProductsCache();
    return normalizeProduct(record);
  } catch (err) {
    let details = '';
    try { details = err?.data ? JSON.stringify(err.data) : String(err); } catch { details = String(err); }
    throw new Error('Failed to create product: ' + (details || err.message));
  }
}

export async function updateProduct(id, data) {
  const formData = buildProductFormData(data);
  const record = await pb.collection('products').update(id, formData);
  invalidateProductsCache();
  return normalizeProduct(record);
}

export async function deleteProduct(id) {
  await pb.collection('products').delete(id);
  invalidateProductsCache();
}

export async function updateStock(id, stock) {
  await pb.collection('products').update(id, { stock: Number(stock) });
  invalidateProductsCache();
}

export async function createOrder(data) {
  const record = await pb.collection('orders').create({
    customerName:   data.customerName,
    email:          data.email,
    phone:          data.phone          || '',
    address:        data.deliveryMethod === 'pickup' ? 'STORE PICKUP' : (data.address || ''),
    city:           data.deliveryMethod === 'pickup' ? 'Kano (Store)' : (data.city || ''),
    state:          data.state          || '',
    country:        data.country        || 'NG',
    items:          JSON.stringify(data.items),
    subtotal:       data.subtotal,
    shipping:       data.shipping,
    tax:            data.tax            || 0,
    total:          data.total,
    paymentMethod:  data.paymentMethod  || 'online',
    paymentRef:     data.paymentRef     || '',
    paymentStatus:  'unpaid',
    status:         'pending',
    notes:          data.notes          || '',
  });
  return record;
}

const VALID_ORDER_STATUSES = new Set([
  'pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'failed', 'refunded',
]);

export async function getOrders(status) {
  try {
    const params = new URLSearchParams();
    if (status && VALID_ORDER_STATUSES.has(status)) {
      params.set('filter', `status = "${status}"`);
    }
    params.set('perPage', '200');

    const headers = { 'Content-Type': 'application/json' };
    if (pb.authStore.token) headers['Authorization'] = 'Bearer ' + pb.authStore.token;

    const url = pb.baseUrl + '/api/collections/orders/records?' + params.toString();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return (data.items || []).map(normalizeOrder);
  } catch (err) {
    console.warn('getOrders failed:', err.message);
    return [];
  }
}

export async function getOrderById(id) {
  const headers = { 'Content-Type': 'application/json' };
  if (pb.authStore.token) headers['Authorization'] = 'Bearer ' + pb.authStore.token;
  const url = pb.baseUrl + '/api/collections/orders/records/' + id;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return normalizeOrder(await res.json());
}

export async function updateOrderStatus(id, status) {
  return pb.collection('orders').update(id, { status });
}

export async function deleteOrder(id) {
  await pb.collection('orders').delete(id);
}

export async function pollOrderPaymentStatus(orderId, { intervalMs = 2000, timeoutMs = 60000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const order = await getOrderById(orderId);
      if (order.paymentStatus === 'paid' || order.paymentStatus === 'failed') return order;
    } catch {
      // keep polling
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('Payment verification timed out. Please contact support with your order reference.');
}

export async function getOrdersByEmail(email) {
  try {
    const params = new URLSearchParams();
    params.set('filter', `email = "${email.replace(/"/g, '\\"')}"`);
    params.set('perPage', '200');
    params.set('sort', '-created');

    const headers = { 'Content-Type': 'application/json' };
    if (pb.authStore.token) headers['Authorization'] = 'Bearer ' + pb.authStore.token;

    const url = pb.baseUrl + '/api/collections/orders/records?' + params.toString();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return (data.items || []).map(normalizeOrder);
  } catch (err) {
    console.warn('getOrdersByEmail failed:', err.message);
    return [];
  }
}

export async function decrementStock(id, quantity) {
  try {
    const url = pb.baseUrl + '/api/collections/products/records/' + id;
    const res = await fetch(url);
    if (!res.ok) return;
    const product = await res.json();
    const newStock = Math.max(0, Number(product.stock || 0) - Number(quantity));
    await pb.collection('products').update(id, { stock: newStock });
    invalidateProductsCache();
  } catch { /* best-effort */ }
}

export async function getUsers() {
  try {
    return await pb.collection('users').getFullList({ });
  } catch {
    return [];
  }
}

export async function subscribeNewsletter(email) {
  try {
    await pb.collection('newsletter').create({ email });
    return { success: true };
  } catch (err) {
    if (err.status === 400) return { success: true, message: 'Already subscribed!' };
    return { success: false, error: err.message };
  }
}

export async function getNotifications() {
  try {
    const result = await pb.collection('notifications').getList(1, 50, { sort: '-created' });
    return result.items;
  } catch {
    return [];
  }
}

export async function markNotificationRead(id) {
  return pb.collection('notifications').update(id, { read: true });
}

export async function deleteNotification(id) {
  return pb.collection('notifications').delete(id);
}

export async function getPromoVideos() {
  try {
    const records = await pb.collection('promo_videos').getFullList({ sort: 'slot' });
    return records.map(r => ({
      id:    r.id,
      slot:  r.slot,
      title: r.title || '',
      video: r.video ? pb.baseUrl + '/api/files/' + r.collectionId + '/' + r.id + '/' + r.video : null,
    }));
  } catch (err) {
    console.warn('getPromoVideos failed:', err.message);
    return [];
  }
}

export async function savePromoVideo(id, slot, file, title) {
  const fd = new FormData();
  fd.append('slot', String(slot));
  if (title) fd.append('title', title);
  if (file)  fd.append('video', file);
  if (id) return pb.collection('promo_videos').update(id, fd);
  return pb.collection('promo_videos').create(fd);
}

export async function deletePromoVideo(id) {
  await pb.collection('promo_videos').delete(id);
}

function buildProductFormData(data) {
  const fd = new FormData();
  fd.append('name',        data.name);
  fd.append('category',    data.category);
  fd.append('gender',      data.gender === undefined || data.gender === null ? 'women' : data.gender);
  fd.append('price',       data.price);
  fd.append('description', data.description || '');
  fd.append('badge',       data.badge       || '');
  fd.append('featured',    data.featured ? 'true' : 'false');
  fd.append('stock',       data.stock ?? 10);
  fd.append('colors',      JSON.stringify(data.colors || []));
  fd.append('sizes',       JSON.stringify(data.sizes  || []));
  if (data.originalPrice)  fd.append('originalPrice', data.originalPrice);
  if (data.imageFiles?.length) data.imageFiles.forEach(f => fd.append('images', f));
  return fd;
}

function getImageUrl(record, filename) {
  if (!filename) return '';
  return pb.baseUrl + '/api/files/' + record.collectionId + '/' + record.id + '/' + filename;
}

function normalizeProduct(record) {
  return {
    id:            record.id,
    name:          record.name,
    category:      record.category,
    gender:        record.gender       || '',
    price:         Number(record.price),
    originalPrice: record.originalPrice ? Number(record.originalPrice) : null,
    description:   record.description  || '',
    colors: typeof record.colors === 'string' ? JSON.parse(record.colors) : (record.colors || []),
    sizes:  typeof record.sizes  === 'string' ? JSON.parse(record.sizes)  : (record.sizes  || []),
    images: (record.images || []).map(img => getImageUrl(record, img)),
    badge:    record.badge    || null,
    featured: record.featured || false,
    rating:   Number(record.rating)    || 5,
    stock:    Number(record.stock)     || 0,
  };
}

function normalizeOrder(record) {
  let items = record.items || [];
  if (typeof record.items === 'string') {
    try { items = JSON.parse(record.items); } catch { items = []; }
  }
  return { ...record, items };
}
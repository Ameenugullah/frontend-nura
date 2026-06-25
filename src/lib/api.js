import pb from './pocketbase';
import { normalize } from './categories';

// ── HEALTH ───────────────────────────────────────────────────────────────────
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

// ── AUTH (customer) ──────────────────────────────────────────────────────────
export async function signUp(email, password, name) {
  const record = await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
    name,
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

// ── ADMIN AUTH ────────────────────────────────────────────────────────────────
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

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
//
// getProducts() fetches the FULL product list and lets the caller filter
// client-side (see Products.jsx). This used to be fine, but to also support
// fast server-side filtered fetches (e.g. for a paginated future), we still
// accept optional category/gender args and build a PocketBase filter string,
// fully normalized (trimmed + lower-cased) so "Fragrance" === "fragrance".
//
export async function getProducts(category, gender) {
  try {
    const filters = [];
    if (category && normalize(category) !== 'all') {
      // PocketBase filter syntax doesn't support LOWER() out of the box on
      // all deployments, so we filter case-sensitively here and let the
      // client-side useMemo in Products.jsx do the normalized re-filter.
      filters.push('category = "' + category.replace(/"/g, '\\"') + '"');
    }
    if (gender && normalize(gender) !== 'all') {
      filters.push('gender = "' + gender.replace(/"/g, '\\"') + '"');
    }

    const params = new URLSearchParams();
    if (filters.length > 0) params.set('filter', filters.join(' && '));
    params.set('perPage', '200'); // generous cap; raise if catalog grows

    const url = pb.baseUrl + '/api/collections/products/records' + (params.toString() ? '?' + params.toString() : '');
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return (data.items || []).map(normalizeProduct);
  } catch (err) {
    console.warn('getProducts failed:', err.message);
    return [];
  }
}

export async function getProductById(id) {
  try {
    const url = pb.baseUrl + '/api/collections/products/records/' + id;
    const res = await fetch(url);
    if (!res.ok) return null;
    const record = await res.json();
    return normalizeProduct(record);
  } catch {
    return null;
  }
}

export async function createProduct(data) {
  try {
    const formData = buildProductFormData(data);
    formData.append('rating', data.rating ?? 5);
    const record = await pb.collection('products').create(formData);
    return normalizeProduct(record);
  } catch (err) {
    let details = '';
    try {
      if (err?.data) details = JSON.stringify(err.data);
      else if (err?.response?.data) details = JSON.stringify(err.response.data);
      else details = String(err);
    } catch {
      details = String(err);
    }
    console.error('createProduct error:', err, details);
    throw new Error('Failed to create product: ' + (details || err.message || String(err)));
  }
}

export async function updateProduct(id, data) {
  const formData = buildProductFormData(data);
  const record = await pb.collection('products').update(id, formData);
  return normalizeProduct(record);
}

export async function deleteProduct(id) {
  await pb.collection('products').delete(id);
}

export async function updateStock(id, stock) {
  await pb.collection('products').update(id, { stock: Number(stock) });
}

// ── ORDERS ────────────────────────────────────────────────────────────────────
// NOTE: orders are created with status "pending" and a "paymentStatus" of
// "unpaid". They only become "Paid"/"Completed" after server-side webhook
// verification — see PAYMENT_ARCHITECTURE.md and pb_hooks/payments.pb.js.
export async function createOrder(data) {
  const record = await pb.collection('orders').create({
    customerName:   data.customerName,
    email:          data.email,
    phone:          data.phone || '',
    address:        data.address,
    city:           data.city,
    state:          data.state || '',
    country:        data.country || 'NG',
    items:          JSON.stringify(data.items),
    subtotal:       data.subtotal,
    shipping:       data.shipping,
    tax:            data.tax || 0,
    total:          data.total,
    paymentMethod:  data.paymentMethod || 'online',
    paymentRef:     data.paymentRef || '',     // Paystack reference, set before redirect
    paymentStatus:  'unpaid',                  // unpaid | verifying | paid | failed
    status:         'pending',                 // pending | processing | paid | failed | cancelled | refunded
    notes:          data.notes || '',
  });
  return record;
}

export async function getOrders(status) {
  try {
    const params = new URLSearchParams();
    if (status) params.set('filter', 'status = "' + status + '"');
    params.set('perPage', '200');

    const headers = { 'Content-Type': 'application/json' };
    if (pb.authStore.token) headers['Authorization'] = 'Bearer ' + pb.authStore.token;

    const url = pb.baseUrl + '/api/collections/orders/records' + (params.toString() ? '?' + params.toString() : '');
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
  const record = await res.json();
  return normalizeOrder(record);
}

export async function updateOrderStatus(id, status) {
  return pb.collection('orders').update(id, { status });
}

export async function deleteOrder(id) {
  await pb.collection('orders').delete(id);
}

// ── PAYMENT VERIFICATION (polling) ─────────────────────────────────────────
// After redirecting back from Paystack, the frontend polls this endpoint to
// see whether the PocketBase server-side hook has confirmed the webhook yet.
// The actual verification call to Paystack's /transaction/verify endpoint
// happens server-side in pb_hooks/payments.pb.js — never trust a client-side
// "success" callback alone.
export async function pollOrderPaymentStatus(orderId, { intervalMs = 2000, timeoutMs = 60000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const order = await getOrderById(orderId);
      if (order.paymentStatus === 'paid' || order.paymentStatus === 'failed') {
        return order;
      }
    } catch {
      // keep polling — order may not be readable until auth catches up
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('Payment verification timed out. Please contact support with your order reference.');
}

// ── USERS (admin view) ────────────────────────────────────────────────────────
export async function getUsers() {
  try {
    const records = await pb.collection('users').getFullList({ sort: '-created' });
    return records;
  } catch {
    return [];
  }
}

// ── NEWSLETTER ────────────────────────────────────────────────────────────────
export async function subscribeNewsletter(email) {
  try {
    await pb.collection('newsletter').create({ email });
    return { success: true };
  } catch (err) {
    if (err.status === 400) return { success: true, message: 'Already subscribed!' };
    return { success: false, error: err.message };
  }
}


// ── INSTAGRAM GRID ────────────────────────────────────────────────────────────

export async function getInstagramPosts() {
  try {
    const records = await pb.collection('instagram_grid').getList(1, 6, { sort: '+created', requestKey: null });
    return (records.items || []).map(r => ({
      id:      r.id,
      image:   r.image ? pb.files.getUrl(r, r.image) : null,
      caption: r.caption || '',
      link:    r.link    || '',
      order:   r.sort_order || r.order || 0,
    }));
  } catch (err) {
    console.warn('getInstagramPosts failed:', err.message);
    return [];
  }
}

export async function createInstagramPost(data) {
  const fd = new FormData();
  // caption is plain text — always safe to send empty string
  fd.append('caption', data.caption || '');
  // link is a URL field — PocketBase rejects empty string, omit if blank
  if (data.link && data.link.trim()) fd.append('link', data.link.trim());
  // order must be a number string, not empty
  if (data.order) fd.append('sort_order', String(Number(data.order)));
  if (data.imageFile) fd.append('image', data.imageFile);
  return pb.collection('instagram_grid').create(fd);
}

export async function updateInstagramPost(id, data) {
  const fd = new FormData();
  fd.append('caption', data.caption || '');
  // To CLEAR a URL field in PocketBase send an empty string explicitly;
  // to SET it, send the trimmed value. Both are intentional here.
  fd.append('link', data.link ? data.link.trim() : '');
  if (data.order) fd.append('sort_order', String(Number(data.order)));
  if (data.imageFile) fd.append('image', data.imageFile);
  return pb.collection('instagram_grid').update(id, fd);
}

export async function deleteInstagramPost(id) {
  await pb.collection('instagram_grid').delete(id);
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function buildProductFormData(data) {
  const fd = new FormData();
  fd.append('name',        data.name);
  fd.append('category',    data.category);
  // Fragrance products are gender-neutral by design and submit an explicit
  // empty string for gender (see AdminDashboard.jsx handleSave). Only
  // default to 'women' when gender is genuinely undefined/null — never when
  // it's deliberately set to ''.
  fd.append('gender',      data.gender === undefined || data.gender === null ? 'women' : data.gender);
  fd.append('price',       data.price);
  fd.append('description', data.description || '');
  fd.append('badge',       data.badge || '');
  fd.append('featured',    data.featured ? 'true' : 'false');
  fd.append('stock',       data.stock ?? 10);
  fd.append('colors',      JSON.stringify(data.colors || []));
  fd.append('sizes',       JSON.stringify(data.sizes  || []));
  if (data.originalPrice) fd.append('originalPrice', data.originalPrice);
  if (data.imageFiles && data.imageFiles.length > 0) {
    data.imageFiles.forEach(function (f) { fd.append('images', f); });
  }
  return fd;
}

// Always derive file URLs from pb.baseUrl (which itself comes from
// VITE_PB_URL) — never hardcode a host here. This is what makes images work
// correctly in production builds regardless of where PocketBase is deployed.
function getImageUrl(record, filename) {
  if (!filename) return '';
  try {
    return pb.files.getUrl(record, filename);
  } catch {
    return pb.baseUrl + '/api/files/' + record.collectionId + '/' + record.id + '/' + filename;
  }
}

function normalizeProduct(record) {
  return {
    id:            record.id,
    name:          record.name,
    category:      record.category,
    // Don't default missing gender to 'women' — Fragrance products are
    // intentionally gender-neutral (empty string). Defaulting here would
    // silently re-leak them into Women's-scoped views. Anywhere that needs
    // a gender comparison should use matchesGender()/isFragrance() from
    // lib/categories.js, which already account for this correctly.
    gender:        record.gender || '',
    price:         Number(record.price),
    originalPrice: record.originalPrice ? Number(record.originalPrice) : null,
    description:   record.description || '',
    colors: typeof record.colors === 'string' ? JSON.parse(record.colors) : (record.colors || []),
    sizes:  typeof record.sizes  === 'string' ? JSON.parse(record.sizes)  : (record.sizes  || []),
    images: (record.images || []).map(function (img) { return getImageUrl(record, img); }),
    badge:    record.badge    || null,
    featured: record.featured || false,
    rating:   Number(record.rating) || 5,
    stock:    Number(record.stock)  || 0,
  };
}

function normalizeOrder(record) {
  return Object.assign({}, record, {
    items: typeof record.items === 'string' ? JSON.parse(record.items) : (record.items || []),
  });
}
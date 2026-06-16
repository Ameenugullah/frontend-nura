import pb from './pocketbase';

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
export async function getProducts(category, gender) {
  try {
    const params = new URLSearchParams();
    const filters = [];
    if (category && category !== 'All') filters.push('category = "' + category + '"');
    if (gender && gender !== 'all') filters.push('gender = "' + gender + '"');
    if (filters.length > 0) params.set('filter', filters.join(' && '));

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
    // Try to extract structured error info from PocketBase client error
    let details = '';
    try {
      if (err?.data) details = JSON.stringify(err.data);
      else if (err?.response?.data) details = JSON.stringify(err.response.data);
      else details = String(err);
    } catch (e) {
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
export async function createOrder(data) {
  const record = await pb.collection('orders').create({
    customerName:  data.customerName,
    email:         data.email,
    phone:         data.phone || '',
    address:       data.address,
    city:          data.city,
    state:         data.state || '',
    country:       data.country || 'NG',
    items:         JSON.stringify(data.items),
    subtotal:      data.subtotal,
    shipping:      data.shipping,
    tax:           data.tax || 0,
    total:         data.total,
    paymentMethod: data.paymentMethod || 'online',
    status:        'pending',
    notes:         data.notes || '',
  });
  return record;
}

export async function getOrders(status) {
  try {
    const params = new URLSearchParams();
    if (status) params.set('filter', 'status = "' + status + '"');

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

// ── HELPERS ───────────────────────────────────────────────────────────────────

function buildProductFormData(data) {
  const fd = new FormData();
  fd.append('name',        data.name);
  fd.append('category',    data.category);
  fd.append('gender',      data.gender || 'women');
  fd.append('price',       data.price);
  fd.append('description', data.description || '');
  fd.append('badge',       data.badge || '');
  fd.append('featured',    data.featured ? 'true' : 'false');
  fd.append('stock',       data.stock ?? 10);
  fd.append('colors',      JSON.stringify(data.colors || []));
  fd.append('sizes',       JSON.stringify(data.sizes  || []));
  if (data.originalPrice) fd.append('originalPrice', data.originalPrice);
  if (data.imageFiles && data.imageFiles.length > 0) {
    data.imageFiles.forEach(function(f) { fd.append('images', f); });
  }
  return fd;
}

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
    gender:        record.gender || 'women',
    price:         Number(record.price),
    originalPrice: record.originalPrice ? Number(record.originalPrice) : null,
    description:   record.description || '',
    colors: typeof record.colors === 'string' ? JSON.parse(record.colors) : (record.colors || []),
    sizes:  typeof record.sizes  === 'string' ? JSON.parse(record.sizes)  : (record.sizes  || []),
    images: (record.images || []).map(function(img) { return getImageUrl(record, img); }),
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
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
export async function getProducts(category = '', gender = '') {
  try {
    const filters = [];
    if (category && category !== 'All') filters.push(`category = "${category}"`);
    if (gender && gender !== 'all') filters.push(`gender = "${gender}"`);
    const filter = filters.join(' && ');
    const records = await pb.collection('products').getFullList({ sort: '-created', filter });
    return records.map(normalizeProduct);
  } catch {
    return [];
  }
}

export async function getProductById(id) {
  try {
    const record = await pb.collection('products').getOne(id);
    return normalizeProduct(record);
  } catch {
    return null;
  }
}

export async function createProduct(data) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('category', data.category);
  formData.append('gender', data.gender || 'women');
  formData.append('price', data.price);
  if (data.originalPrice) formData.append('originalPrice', data.originalPrice);
  formData.append('description', data.description || '');
  formData.append('colors', JSON.stringify(data.colors || []));
  formData.append('sizes', JSON.stringify(data.sizes || []));
  formData.append('badge', data.badge || '');
  formData.append('featured', data.featured ? 'true' : 'false');
  formData.append('stock', data.stock ?? 10);
  formData.append('rating', data.rating ?? 5);
  if (data.imageFiles) data.imageFiles.forEach(f => formData.append('images', f));
  const record = await pb.collection('products').create(formData);
  return normalizeProduct(record);
}

export async function updateProduct(id, data) {
  const record = await pb.collection('products').update(id, data);
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
    customerName: data.customerName,
    email:        data.email,
    phone:        data.phone || '',
    address:      data.address,
    city:         data.city,
    state:        data.state || '',
    country:      data.country || 'NG',
    items:        JSON.stringify(data.items),
    subtotal:     data.subtotal,
    shipping:     data.shipping,
    tax:          data.tax || 0,
    total:        data.total,
    paymentMethod: data.paymentMethod || 'online',
    status:       'pending',
    notes:        data.notes || '',
  });
  return record;
}

export async function getOrders(status = '') {
  const filter = status ? `status = "${status}"` : '';
  const records = await pb.collection('orders').getFullList({ sort: '-created', filter });
  return records.map(r => ({
    ...r,
    items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
  }));
}

export async function getOrderById(id) {
  const record = await pb.collection('orders').getOne(id);
  return {
    ...record,
    items: typeof record.items === 'string' ? JSON.parse(record.items) : (record.items || []),
  };
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
    // 400 = unique constraint = already subscribed
    if (err.status === 400) return { success: true, message: 'Already subscribed!' };
    return { success: false, error: err.message };
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function normalizeProduct(record) {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    gender: record.gender || 'women',
    price: Number(record.price),
    originalPrice: record.originalPrice ? Number(record.originalPrice) : null,
    description: record.description || '',
    colors: typeof record.colors === 'string' ? JSON.parse(record.colors) : (record.colors || []),
    sizes:  typeof record.sizes  === 'string' ? JSON.parse(record.sizes)  : (record.sizes  || []),
    images: (record.images || []).map(img => pb.files.getUrl(record, img)),
    badge:  record.badge || null,
    featured: record.featured || false,
    rating: Number(record.rating) || 5,
    stock:  Number(record.stock) ?? 10,
  };
}

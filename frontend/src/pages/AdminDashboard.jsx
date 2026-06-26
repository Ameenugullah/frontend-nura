import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  LogOut, Menu, X, Plus, Pencil, Trash2, Search, Upload,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Eye,
  RefreshCw, Wifi, WifiOff, Instagram, GripVertical,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { ALL_CATEGORIES, CATEGORIES_GROUPED, isFragranceCategory } from '../lib/categories';
import {
  getInstagramPosts,
  createInstagramPost,
  updateInstagramPost,
  deleteInstagramPost,
} from '../lib/api';

// ── shared ───────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  paid:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  shipped:    'bg-purple-50 text-purple-700 border-purple-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
  failed:     'bg-red-50 text-red-700 border-red-200',
  refunded:   'bg-stone-100 text-stone-600 border-stone-300',
};

const PB_ADMIN_URL = (import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090') + '/_/';

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 font-body text-[10px] tracking-wider uppercase border ${STATUS_STYLES[status] || 'bg-stone-50 text-stone-600 border-stone-200'}`}>
      {status}
    </span>
  );
}

// ── login screen ─────────────────────────────────────────────────────────────
function AdminLogin() {
  const { login, loginError } = useAdmin();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-charcoal-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-4xl text-white font-script">Nura Bahar</span>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-stone-400 mt-2">Admin Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4 bg-white">
          <h2 className="mb-2 text-2xl font-light font-display text-charcoal-800">Sign In</h2>
          <div>
            <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@nurabahar.ng" className="input-field" required autoComplete="username" />
          </div>
          <div>
            <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="input-field" required autoComplete="current-password" />
          </div>
          {loginError && <p className="text-xs font-body text-blush-500">{loginError}</p>}
          <button type="submit" disabled={loading} className="justify-center w-full py-3 btn-primary disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="pt-1 text-xs text-center font-body text-stone-400">Admin credentials set in PocketBase settings.</p>
        </form>
      </div>
    </div>
  );
}

// ── sidebar nav ──────────────────────────────────────────────────────────────
const adminNav = [
  { label: 'Dashboard',      icon: LayoutDashboard, to: '/admin' },
  { label: 'Products',       icon: Package,          to: '/admin/products' },
  { label: 'Orders',         icon: ShoppingCart,     to: '/admin/orders' },
  { label: 'Customers',      icon: Users,            to: '/admin/customers' },
  { label: 'Instagram Grid', icon: Instagram,        to: '/admin/instagram' },
];

function AdminSidebar({ mobile, onClose }) {
  const { logout, pbConnected } = useAdmin();
  const location = useLocation();

  return (
    <aside className={`flex flex-col bg-charcoal-900 ${mobile ? 'h-full' : 'w-60 min-h-screen sticky top-0'}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <span className="text-2xl leading-none text-white font-script">Nura Bahar</span>
          <p className="font-body text-[10px] text-stone-500 tracking-widest uppercase">Admin</p>
        </div>
        {mobile && <button onClick={onClose}><X size={18} className="text-stone-400" /></button>}
      </div>

      <div className="px-6 py-3 border-b border-white/10">
        <div className={`flex items-center gap-2 font-body text-[10px] tracking-wider uppercase ${pbConnected ? 'text-green-400' : 'text-amber-400'}`}>
          {pbConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
          {pbConnected ? 'PocketBase connected' : 'PocketBase offline'}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        {adminNav.map(({ label, icon: Icon, to }) => {
          const active = to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);
          return (
            <Link key={to} to={to} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 mb-1 font-body text-sm transition-colors rounded-sm ${
                active ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-white/5 hover:text-white'
              }`}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pt-4 pb-6 border-t border-white/10">
        <a href={PB_ADMIN_URL} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 font-body text-xs text-stone-400 hover:text-white transition-colors mb-1">
          <Settings size={14} /> PocketBase Admin UI
        </a>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full font-body text-xs text-stone-400 hover:text-blush-400 transition-colors">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── dashboard overview ────────────────────────────────────────────────────────
function DashboardHome() {
  const { stats, orders, adminProducts, refreshOrders, refreshProducts, loading } = useAdmin();
  const lowStock = adminProducts.filter(p => (p.stock ?? 10) <= 5).length;
  const recent   = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light font-display text-charcoal-800">Dashboard</h1>
        <button onClick={() => { refreshOrders(); refreshProducts(); }}
          className="flex items-center gap-2 text-xs transition-colors font-body text-stone-500 hover:text-charcoal-800">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Revenue',   value: `₦${stats.revenue.toLocaleString('en-NG')}`, icon: TrendingUp,    color: 'bg-green-50 text-green-600' },
          { label: 'Total Orders',    value: stats.totalOrders,   icon: ShoppingCart,  color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending Orders',  value: stats.pendingOrders, icon: Clock,         color: 'bg-amber-50 text-amber-600' },
          { label: 'Low Stock Items', value: lowStock,            icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 bg-white border border-stone-200">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-2xl font-light font-display text-charcoal-800">{value}</p>
            <p className="font-body text-xs text-stone-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="text-sm font-semibold font-body text-charcoal-800">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs transition-colors font-body text-blush-500 hover:text-blush-600">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-10 text-xs text-center font-body text-stone-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr className="text-left font-body text-[10px] tracking-[0.15em] uppercase text-stone-400">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(o => (
                  <tr key={o.id} className="transition-colors border-t border-stone-100 hover:bg-stone-50">
                    <td className="px-5 py-3 text-xs font-medium font-body text-charcoal-700">NB-{o.id.slice(-6)}</td>
                    <td className="px-5 py-3 text-xs font-body text-charcoal-700">{o.customerName}</td>
                    <td className="px-5 py-3 text-xs font-body text-charcoal-700">₦{(o.total || 0).toLocaleString('en-NG')}</td>
                    <td className="px-5 py-3 text-xs capitalize font-body text-charcoal-700">{o.paymentMethod || '—'}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {lowStock > 0 && (
        <div className="flex items-start gap-3 p-4 border bg-amber-50 border-amber-200">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold font-body text-amber-700">{lowStock} product{lowStock > 1 ? 's' : ''} are running low on stock.</p>
            <Link to="/admin/products" className="font-body text-xs text-amber-600 underline mt-0.5 inline-block">Manage Products</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── products panel ────────────────────────────────────────────────────────────
function AdminProducts() {
  const { adminProducts, addProduct, editProduct, deleteProduct, updateStock } = useAdmin();
  const [search,     setSearch]     = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirm,    setConfirm]    = useState(null);
  const [saving,     setSaving]     = useState(false);

  const emptyForm = {
    name: '', category: ALL_CATEGORIES[0], gender: '',
    price: '', originalPrice: '', description: '',
    colors: '', sizes: '', badge: '', stock: '10', featured: false,
  };

  const [form,          setForm]          = useState(emptyForm);
  const [imageFiles,    setImageFiles]    = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const openNew = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setImageFiles([]);
    setImagePreviews([]);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setForm({
      ...p,
      gender: p.gender || '',
      colors: Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || ''),
      sizes:  Array.isArray(p.sizes)  ? p.sizes.join(', ')  : (p.sizes  || ''),
      price:         String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      stock:         String(p.stock ?? 10),
    });
    setImageFiles([]);
    setImagePreviews(p.images || []);
    setShowForm(true);
  };

  const handleImagePick = (e) => {
    const picked = Array.from(e.target.files);
    if (!picked.length) return;
    const combined = [...imageFiles, ...picked].slice(0, 6);
    setImageFiles(combined);
    const previews = combined.map((f, i) =>
      i < imageFiles.length ? imagePreviews[i] : URL.createObjectURL(f)
    );
    setImagePreviews(previews);
    e.target.value = '';
  };

  const removeImage = (i) => {
    if (imagePreviews[i]?.startsWith('blob:')) URL.revokeObjectURL(imagePreviews[i]);
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fragranceSelected = isFragranceCategory(form.category);
      const data = {
        ...form,
        gender:        fragranceSelected ? '' : (form.gender || 'women'),
        price:         Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock:         Number(form.stock),
        colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
        sizes:  form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
      };
      if (editTarget) await editProduct(editTarget.id, data);
      else await addProduct(data);
      setShowForm(false);
    } catch (err) {
      alert('Error saving product: ' + (err.message || 'Unknown error. Check console.'));
    } finally {
      setSaving(false);
    }
  };

  const filtered = adminProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-light font-display text-charcoal-800">Products</h1>
        <button onClick={openNew} className="flex items-center gap-2 py-2 btn-primary">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute -translate-y-1/2 left-3 top-1/2 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products…" className="text-sm input-field pl-9" />
      </div>

      <div className="overflow-x-auto bg-white border border-stone-200">
        <table className="w-full min-w-[640px]">
          <thead className="border-b bg-stone-50 border-stone-200">
            <tr className="text-left font-body text-[10px] tracking-[0.15em] uppercase text-stone-400">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="transition-colors border-t border-stone-100 hover:bg-stone-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name}
                        className="object-cover w-10 h-10 border border-stone-200 shrink-0"
                        onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder-product.svg'; }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 border bg-stone-100 border-stone-200 shrink-0">
                        <Package size={14} className="text-stone-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium font-body text-charcoal-800">{p.name}</p>
                      <p className="font-body text-[10px] text-stone-400">{p.gender}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs font-body text-charcoal-700">{p.category}</td>
                <td className="px-5 py-3 text-xs font-body text-charcoal-700">₦{p.price.toLocaleString('en-NG')}</td>
                <td className="px-5 py-3">
                  <input type="number" min={0} value={p.stock ?? 10}
                    onChange={e => updateStock(p.id, e.target.value)}
                    className="w-16 py-1 text-xs text-center border border-stone-200 font-body focus:outline-none focus:border-charcoal-700" />
                </td>
                <td className="px-5 py-3">
                  <span className={`font-body text-[10px] tracking-wider uppercase px-2 py-0.5 border ${
                    (p.stock ?? 10) <= 0 ? 'bg-red-50 text-red-600 border-red-200'
                    : (p.stock ?? 10) <= 5 ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-green-50 text-green-600 border-green-200'
                  }`}>
                    {(p.stock ?? 10) <= 0 ? 'Out of Stock' : (p.stock ?? 10) <= 5 ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/products/${p.id}`} target="_blank"
                      className="flex items-center justify-center transition-colors w-7 h-7 text-stone-400 hover:text-charcoal-800">
                      <Eye size={13} />
                    </Link>
                    <button onClick={() => openEdit(p)}
                      className="flex items-center justify-center transition-colors w-7 h-7 text-stone-400 hover:text-charcoal-800">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setConfirm(p.id)}
                      className="flex items-center justify-center transition-colors w-7 h-7 text-stone-400 hover:text-blush-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-xs text-center font-body text-stone-400">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* product form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-charcoal-900/60">
          <div className="w-full max-w-lg p-6 my-8 bg-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-light font-display text-charcoal-800">{editTarget ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-stone-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label-xs">Name *</label>
                  <input required value={form.name}
                    onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    className="text-sm input-field" placeholder="Luna Dress" />
                </div>
                <div>
                  <label className="label-xs">Category</label>
                  <select value={form.category}
                    onChange={e => {
                      const nextCategory = e.target.value;
                      setForm(f => ({
                        ...f,
                        category: nextCategory,
                        gender: isFragranceCategory(nextCategory) ? '' : (f.gender || 'women'),
                      }));
                    }}
                    className="text-sm input-field">
                    {CATEGORIES_GROUPED.map(group => (
                      <optgroup key={group.group} label={`── ${group.group} ──`}>
                        {group.items.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                {!isFragranceCategory(form.category) ? (
                  <div>
                    <label className="label-xs">Gender</label>
                    <select value={form.gender || 'women'}
                      onChange={e => setForm(f => ({...f, gender: e.target.value}))}
                      className="text-sm input-field">
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-end">
                    <p className="font-body text-[10px] text-stone-400 bg-stone-50 border border-stone-200 p-2.5 leading-relaxed">
                      Fragrance products don't need a gender — they only appear in the Fragrance section.
                    </p>
                  </div>
                )}
                <div>
                  <label className="label-xs">Price (₦) *</label>
                  <input required type="number" min={0} value={form.price}
                    onChange={e => setForm(f => ({...f, price: e.target.value}))}
                    className="text-sm input-field" placeholder="45000" />
                </div>
                <div>
                  <label className="label-xs">Original Price (₦)</label>
                  <input type="number" min={0} value={form.originalPrice}
                    onChange={e => setForm(f => ({...f, originalPrice: e.target.value}))}
                    className="text-sm input-field" placeholder="Leave blank if no discount" />
                </div>
                <div>
                  <label className="label-xs">Stock</label>
                  <input type="number" min={0} value={form.stock}
                    onChange={e => setForm(f => ({...f, stock: e.target.value}))}
                    className="text-sm input-field" />
                </div>
                <div>
                  <label className="label-xs">Badge</label>
                  <select value={form.badge}
                    onChange={e => setForm(f => ({...f, badge: e.target.value}))}
                    className="text-sm input-field">
                    {['', 'New', 'Bestseller', 'Sale', 'Luxury', 'Bridal', 'Premium'].map(b => (
                      <option key={b} value={b}>{b || '— None —'}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label-xs">Colors (comma-separated)</label>
                  <input value={form.colors}
                    onChange={e => setForm(f => ({...f, colors: e.target.value}))}
                    className="text-sm input-field" placeholder="Blush, Ivory, Champagne" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-xs">Sizes (comma-separated)</label>
                  <input value={form.sizes}
                    onChange={e => setForm(f => ({...f, sizes: e.target.value}))}
                    className="text-sm input-field" placeholder="XS, S, M, L, XL" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-xs">Description</label>
                  <textarea rows={3} value={form.description}
                    onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    className="text-sm resize-none input-field" />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <input type="checkbox" id="featured" checked={form.featured}
                    onChange={e => setForm(f => ({...f, featured: e.target.checked}))}
                    className="accent-charcoal-900" />
                  <label htmlFor="featured" className="text-xs font-body text-charcoal-700">Featured on homepage</label>
                </div>
                <div className="sm:col-span-2">
                  <label className="label-xs">Product Images (up to 6)</label>
                  <label className="mt-1 flex flex-col items-center justify-center gap-1.5 border border-dashed border-stone-300 py-5 cursor-pointer hover:border-charcoal-700 hover:bg-stone-50 transition-colors">
                    <Upload size={18} className="text-stone-400" />
                    <span className="text-xs font-body text-stone-400">Click to upload images</span>
                    <span className="font-body text-[10px] text-stone-300">JPG, PNG, WEBP · max 6 photos</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                      onChange={handleImagePick} disabled={imagePreviews.length >= 6} />
                  </label>
                  {imagePreviews.length > 0 && (
                    <>
                      <div className="grid grid-cols-6 gap-2 mt-3">
                        {imagePreviews.map((src, i) => (
                          <div key={i} className="relative group aspect-square">
                            <img src={src} alt={`Preview ${i + 1}`}
                              className="object-cover w-full h-full border border-stone-200"
                              onError={e => { e.target.onerror = null; e.target.src = '/images/placeholder-product.svg'; }} />
                            {i === 0 && (
                              <span className="absolute bottom-0 left-0 right-0 bg-charcoal-900/80 text-white text-[8px] font-body text-center py-0.5">MAIN</span>
                            )}
                            <button type="button" onClick={() => removeImage(i)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-charcoal-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="font-body text-[10px] text-stone-400 mt-1.5">
                        {imagePreviews.length}/6 photos · hover to remove · first image is main
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 disabled:opacity-60">
                  {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Product'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60">
          <div className="w-full max-w-sm p-6 text-center bg-white">
            <Trash2 size={24} className="mx-auto mb-3 text-blush-500" />
            <h3 className="mb-2 text-sm font-semibold font-body text-charcoal-800">Delete this product?</h3>
            <p className="mb-5 text-xs font-body text-stone-400">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { deleteProduct(confirm); setConfirm(null); }} className="flex-1 py-2 btn-blush">Delete</button>
              <button onClick={() => setConfirm(null)} className="flex-1 py-2 btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── instagram grid panel ──────────────────────────────────────────────────────
function AdminInstagramGrid() {
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirm,    setConfirm]    = useState(null);
  const [saving,     setSaving]     = useState(false);

  const emptyForm = { caption: '', link: '', order: '' };
  const [form,        setForm]        = useState(emptyForm);
  const [imageFile,   setImageFile]   = useState(null);
  const [imagePreview,setImagePreview]= useState(null);

  const load = async () => {
    setLoading(true);
    const data = await getInstagramPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditTarget(null);
    setForm({ caption: '', link: '', order: String(posts.length + 1) });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (post) => {
    setEditTarget(post);
    setForm({ caption: post.caption, link: post.link, order: String(post.sort_order || '') });
    setImageFile(null);
    setImagePreview(post.image);
    setShowForm(true);
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editTarget && !imageFile) {
      alert('Please select an image.');
      return;
    }
    setSaving(true);
    try {
      const data = {
        caption:   form.caption,
        link:      form.link,
        order:     Number(form.order) || 0,
        imageFile: imageFile || undefined,
      };
      if (editTarget) await updateInstagramPost(editTarget.id, data);
      else             await createInstagramPost(data);
      setShowForm(false);
      await load();
    } catch (err) {
      alert('Error saving post: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteInstagramPost(id);
      setConfirm(null);
      await load();
    } catch (err) {
      alert('Error deleting post: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light font-display text-charcoal-800">Instagram Grid</h1>
          <p className="mt-1 text-xs font-body text-stone-400">Manage the 6 photos shown in the homepage @NuraBaharNigeria section.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load}
            className="flex items-center gap-2 text-xs transition-colors font-body text-stone-500 hover:text-charcoal-800">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {posts.length < 6 && (
            <button onClick={openNew} className="flex items-center gap-2 py-2 btn-primary">
              <Plus size={15} /> Add Post
            </button>
          )}
        </div>
      </div>

      {/* grid preview */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-stone-200 aspect-square animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {posts.map((post, idx) => (
              <div key={post.id} className="relative group">
                <div className="relative overflow-hidden aspect-square bg-stone-100">
                  {post.image ? (
                    <img src={post.image} alt={post.caption || `Post ${idx + 1}`}
                      className="object-cover w-full h-full" loading="lazy" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-stone-200">
                      <Instagram size={20} className="text-stone-400" />
                    </div>
                  )}
                  {/* order badge */}
                  <span className="absolute top-1.5 left-1.5 bg-charcoal-900/80 text-white font-body text-[9px] px-1.5 py-0.5">
                    #{post.sort_order || idx + 1}
                  </span>
                  {/* action overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200 opacity-0 bg-charcoal-900/50 group-hover:opacity-100">
                    <button onClick={() => openEdit(post)}
                      className="flex items-center justify-center w-8 h-8 transition-colors bg-white text-charcoal-800 hover:bg-stone-100">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setConfirm(post.id)}
                      className="flex items-center justify-center w-8 h-8 transition-colors bg-white text-blush-500 hover:bg-blush-50">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {post.caption && (
                  <p className="mt-1 font-body text-[10px] text-stone-400 truncate">{post.caption}</p>
                )}
              </div>
            ))}

            {/* empty slots */}
            {Array.from({ length: Math.max(0, 6 - posts.length) }).map((_, i) => (
              <button key={`empty-${i}`} onClick={openNew}
                className="flex flex-col items-center justify-center gap-2 transition-colors border-2 border-dashed border-stone-200 aspect-square hover:border-charcoal-700 hover:bg-stone-50 group">
                <Plus size={18} className="transition-colors text-stone-300 group-hover:text-charcoal-700" />
                <span className="font-body text-[10px] text-stone-300 group-hover:text-charcoal-700 transition-colors">Add photo</span>
              </button>
            ))}
          </div>

          {posts.length === 0 && (
            <p className="py-6 text-xs text-center font-body text-stone-400">
              No posts yet. Click "Add Post" or any empty slot to upload your first photo.
            </p>
          )}
        </>
      )}

      {/* info card */}
      <div className="flex items-start gap-3 p-4 border bg-stone-50 border-stone-200">
        <GripVertical size={15} className="text-stone-400 mt-0.5 shrink-0" />
        <div className="space-y-1 text-xs font-body text-stone-500">
          <p>Use the <strong>Order</strong> field (1–6) to control which position each photo appears in on the homepage.</p>
          <p>The <strong>Link</strong> field should be the full URL to the Instagram post (e.g. <span className="font-mono">https://instagram.com/p/abc123</span>).</p>
          <p>Photos are displayed at 1:1 square ratio — portrait photos work best.</p>
        </div>
      </div>

      {/* add/edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-charcoal-900/60">
          <div className="w-full max-w-md p-6 my-8 bg-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-light font-display text-charcoal-800">
                {editTarget ? 'Edit Post' : 'Add Instagram Post'}
              </h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-stone-400" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* image upload */}
              <div>
                <label className="label-xs">Photo {!editTarget && '*'}</label>
                {imagePreview ? (
                  <div className="relative mt-1 group aspect-square max-w-[200px]">
                    <img src={imagePreview} alt="Preview"
                      className="object-cover w-full h-full border border-stone-200" />
                    <button type="button"
                      onClick={() => { if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview); setImageFile(null); setImagePreview(null); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-charcoal-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={11} />
                    </button>
                    <label className="absolute bottom-0 left-0 right-0 py-1.5 text-center cursor-pointer bg-charcoal-900/70 font-body text-[10px] text-white hover:bg-charcoal-900 transition-colors">
                      Change photo
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImagePick} />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 py-8 mt-1 transition-colors border-2 border-dashed cursor-pointer border-stone-300 hover:border-charcoal-700 hover:bg-stone-50">
                    <Upload size={20} className="text-stone-400" />
                    <span className="text-xs font-body text-stone-400">Click to upload photo</span>
                    <span className="font-body text-[10px] text-stone-300">JPG, PNG, WEBP · square crops best</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImagePick} />
                  </label>
                )}
              </div>

              <div>
                <label className="label-xs">Instagram Post Link</label>
                <input type="url" value={form.link}
                  onChange={e => setForm(f => ({...f, link: e.target.value}))}
                  className="text-sm input-field"
                  placeholder="https://instagram.com/p/abc123" />
              </div>

              <div>
                <label className="label-xs">Caption (optional)</label>
                <input type="text" value={form.caption}
                  onChange={e => setForm(f => ({...f, caption: e.target.value}))}
                  className="text-sm input-field"
                  placeholder="New arrivals just dropped! ✨" />
              </div>

              <div>
                <label className="label-xs">Order (1–6)</label>
                <input type="number" min={1} max={6} value={form.order}
                  onChange={e => setForm(f => ({...f, order: e.target.value}))}
                  className="w-24 text-sm input-field"
                  placeholder="1" />
                <p className="font-body text-[10px] text-stone-400 mt-1">Controls which position this photo appears in (1 = first).</p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="btn-primary flex-1 py-2.5 disabled:opacity-60">
                  {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Post'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* delete confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60">
          <div className="w-full max-w-sm p-6 text-center bg-white">
            <Trash2 size={24} className="mx-auto mb-3 text-blush-500" />
            <h3 className="mb-2 text-sm font-semibold font-body text-charcoal-800">Remove this post?</h3>
            <p className="mb-5 text-xs font-body text-stone-400">It will be removed from the homepage grid.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirm)} className="flex-1 py-2 btn-blush">Remove</button>
              <button onClick={() => setConfirm(null)} className="flex-1 py-2 btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── orders panel ──────────────────────────────────────────────────────────────
function AdminOrders() {
  const { orders, changeOrderStatus, deleteOrder, refreshOrders, loading } = useAdmin();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);

  const ALL_STATUSES = ['pending','processing','paid','shipped','delivered','cancelled','failed','refunded'];

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.customerName?.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-light font-display text-charcoal-800">Orders</h1>
        <button onClick={refreshOrders}
          className="flex items-center gap-2 text-xs transition-colors font-body text-stone-500 hover:text-charcoal-800">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute -translate-y-1/2 left-3 top-1/2 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID…" className="text-sm input-field pl-9" />
        </div>
        <div className="flex flex-wrap gap-1">
          {['all', ...ALL_STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`font-body text-[10px] tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                filter === s ? 'bg-charcoal-900 text-white border-charcoal-900' : 'border-stone-200 text-stone-500 hover:border-charcoal-700'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-stone-200">
        <table className="w-full min-w-[760px]">
          <thead className="border-b bg-stone-50 border-stone-200">
            <tr className="text-left font-body text-[10px] tracking-[0.15em] uppercase text-stone-400">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Pay Status</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="transition-colors border-t border-stone-100 hover:bg-stone-50">
                <td className="px-5 py-3 text-xs font-medium font-body text-charcoal-700">NB-{o.id.slice(-6)}</td>
                <td className="px-5 py-3">
                  <p className="text-xs font-body text-charcoal-800">{o.customerName}</p>
                  <p className="font-body text-[10px] text-stone-400">{o.email}</p>
                </td>
                <td className="px-5 py-3 text-xs font-body text-charcoal-700">{(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}</td>
                <td className="px-5 py-3 text-xs font-semibold font-body text-charcoal-800">₦{(o.total || 0).toLocaleString('en-NG')}</td>
                <td className="px-5 py-3 text-xs capitalize font-body text-charcoal-700">{o.paymentMethod || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`font-body text-[10px] tracking-wider uppercase px-2 py-0.5 border ${
                    o.paymentStatus === 'paid'      ? 'bg-green-50 text-green-600 border-green-200'
                    : o.paymentStatus === 'failed'  ? 'bg-red-50 text-red-600 border-red-200'
                    : o.paymentStatus === 'verifying' ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-stone-50 text-stone-500 border-stone-200'
                  }`}>{o.paymentStatus || 'unpaid'}</span>
                </td>
                <td className="px-5 py-3">
                  <select value={o.status} onChange={e => changeOrderStatus(o.id, e.target.value)}
                    className="appearance-none font-body text-[10px] tracking-wider uppercase pl-2 pr-6 py-1 border cursor-pointer focus:outline-none"
                    style={{ backgroundImage: 'none' }}>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setDetail(o)}
                      className="flex items-center justify-center transition-colors w-7 h-7 text-stone-400 hover:text-charcoal-800">
                      <Eye size={13} />
                    </button>
                    <button onClick={() => deleteOrder(o.id)}
                      className="flex items-center justify-center transition-colors w-7 h-7 text-stone-400 hover:text-blush-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-12 text-xs text-center font-body text-stone-400">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-charcoal-900/60">
          <div className="w-full max-w-lg p-6 my-4 bg-white">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-light font-display text-charcoal-800">Order NB-{detail.id.slice(-6)}</h3>
              <button onClick={() => setDetail(null)}><X size={18} className="text-stone-400" /></button>
            </div>
            <div className="space-y-4 text-sm font-body">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Customer</p><p className="font-medium text-charcoal-800">{detail.customerName}</p></div>
                <div><p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Email</p><p className="text-charcoal-700">{detail.email}</p></div>
                <div><p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Phone</p><p className="text-charcoal-700">{detail.phone || '—'}</p></div>
                <div><p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Payment</p><p className="capitalize text-charcoal-700">{detail.paymentMethod || '—'} · {detail.paymentStatus || 'unpaid'}</p></div>
                {detail.paymentRef && (
                  <div className="col-span-2"><p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Paystack Reference</p><p className="text-charcoal-700">{detail.paymentRef}</p></div>
                )}
                <div className="col-span-2"><p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Delivery Address</p><p className="text-charcoal-700">{detail.address}, {detail.city}, {detail.state}</p></div>
              </div>
              <div className="pt-3 border-t border-stone-200">
                <p className="text-[10px] tracking-wider uppercase text-stone-400 mb-2">Items</p>
                {(detail.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-charcoal-700 py-1.5 border-b border-stone-50">
                    <span>{item.name} × {item.quantity} <span className="text-stone-400">({item.color}{item.size !== 'One Size' ? ` / ${item.size}` : ''})</span></span>
                    <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString('en-NG')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-1 text-sm font-semibold text-charcoal-800">
                <span>Total</span>
                <span className="text-blush-500">₦{(detail.total || 0).toLocaleString('en-NG')}</span>
              </div>
              {detail.notes && (
                <div className="p-3 bg-stone-50">
                  <p className="text-[10px] tracking-wider uppercase text-stone-400 mb-1">Notes</p>
                  <p className="text-xs text-charcoal-700">{detail.notes}</p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <label className="text-xs text-stone-500">Status:</label>
                <select value={detail.status}
                  onChange={e => { changeOrderStatus(detail.id, e.target.value); setDetail(d => ({...d, status: e.target.value})); }}
                  className="input-field text-xs py-1.5 flex-1">
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── customers panel ───────────────────────────────────────────────────────────
function AdminCustomers() {
  const { users, refreshUsers } = useAdmin();
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-light font-display text-charcoal-800">Customers</h1>
        <button onClick={refreshUsers}
          className="flex items-center gap-2 text-xs transition-colors font-body text-stone-500 hover:text-charcoal-800">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      <div className="relative max-w-sm">
        <Search size={14} className="absolute -translate-y-1/2 left-3 top-1/2 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search customers…" className="text-sm input-field pl-9" />
      </div>
      <div className="overflow-x-auto bg-white border border-stone-200">
        <table className="w-full min-w-[540px]">
          <thead className="border-b bg-stone-50 border-stone-200">
            <tr className="text-left font-body text-[10px] tracking-[0.15em] uppercase text-stone-400">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Verified</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="transition-colors border-t border-stone-100 hover:bg-stone-50">
                <td className="px-5 py-3 text-xs font-medium font-body text-charcoal-800">{u.name || '—'}</td>
                <td className="px-5 py-3 text-xs font-body text-charcoal-700">{u.email}</td>
                <td className="px-5 py-3 text-xs font-body text-stone-400">{u.created ? new Date(u.created).toLocaleDateString('en-NG') : '—'}</td>
                <td className="px-5 py-3">
                  {u.verified
                    ? <span className="text-green-500"><CheckCircle size={13} /></span>
                    : <span className="font-body text-[10px] text-stone-400">—</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="py-10 text-xs text-center font-body text-stone-400">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── main shell ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { isAdminLoggedIn } = useAdmin();
  const [mobileSidebar, setMobileSidebar] = useState(false);

  if (!isAdminLoggedIn) return <AdminLogin />;

  return (
    <div className="flex min-h-screen bg-stone-50">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {mobileSidebar && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-charcoal-900/50" onClick={() => setMobileSidebar(false)} />
          <div className="relative h-full w-60">
            <AdminSidebar mobile onClose={() => setMobileSidebar(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200">
          <button onClick={() => setMobileSidebar(true)} className="lg:hidden">
            <Menu size={20} className="text-charcoal-800" />
          </button>
          <div className="hidden lg:block" />
          <p className="text-sm font-body text-stone-400">
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        <div className="max-w-6xl p-6 mx-auto">
          <Routes>
            <Route index            element={<DashboardHome />} />
            <Route path="products"  element={<AdminProducts />} />
            <Route path="orders"    element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="instagram" element={<AdminInstagramGrid />} />
          </Routes>
        </div>
      </main>

      <style>{`.label-xs{display:block;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9c9080;margin-bottom:4px;}`}</style>
    </div>
  );
}
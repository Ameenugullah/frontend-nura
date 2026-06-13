import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  LogOut, Menu, X, Plus, Pencil, Trash2, Search, ChevronDown,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Eye,
  RefreshCw, Wifi, WifiOff,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

// ── shared ───────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped:    'bg-purple-50 text-purple-700 border-purple-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
};

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
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-script text-4xl text-white">Nura Bahar</span>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-stone-400 mt-2">Admin Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 space-y-4">
          <h2 className="font-display text-2xl text-charcoal-800 font-light mb-2">Sign In</h2>
          <div>
            <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@nurabahar.ng" className="input-field" required />
          </div>
          <div>
            <label className="font-body text-xs tracking-wider uppercase text-stone-500 block mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="input-field" required />
          </div>
          {loginError && <p className="font-body text-xs text-blush-500">{loginError}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="font-body text-xs text-stone-400 text-center pt-1">
            Admin credentials set in PocketBase settings.
          </p>
        </form>
      </div>
    </div>
  );
}

// ── sidebar nav ──────────────────────────────────────────────────────────────
const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Products',  icon: Package,          to: '/admin/products' },
  { label: 'Orders',    icon: ShoppingCart,      to: '/admin/orders' },
  { label: 'Customers', icon: Users,             to: '/admin/customers' },
];

function AdminSidebar({ mobile, onClose }) {
  const { logout, pbConnected } = useAdmin();
  const location = useLocation();

  return (
    <aside className={`flex flex-col bg-charcoal-900 ${mobile ? 'h-full' : 'w-60 min-h-screen sticky top-0'}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <span className="font-script text-2xl text-white leading-none">Nura Bahar</span>
          <p className="font-body text-[10px] text-stone-500 tracking-widest uppercase">Admin</p>
        </div>
        {mobile && <button onClick={onClose}><X size={18} className="text-stone-400" /></button>}
      </div>

      {/* PB connection indicator */}
      <div className="px-6 py-3 border-b border-white/10">
        <div className={`flex items-center gap-2 font-body text-[10px] tracking-wider uppercase ${pbConnected ? 'text-green-400' : 'text-amber-400'}`}>
          {pbConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
          {pbConnected ? 'PocketBase connected' : 'PocketBase offline (static data)'}
        </div>
      </div>

      <nav className="flex-1 py-4 px-3">
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

      <div className="px-3 pb-6 border-t border-white/10 pt-4">
        <a href="http://localhost:8090/_/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 font-body text-xs text-stone-400 hover:text-white transition-colors mb-1">
          <Settings size={14} />
          PocketBase Admin UI
        </a>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full font-body text-xs text-stone-400 hover:text-blush-400 transition-colors">
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── dashboard overview ───────────────────────────────────────────────────────
function DashboardHome() {
  const { stats, orders, adminProducts, refreshOrders, refreshProducts, loading } = useAdmin();

  const lowStock = adminProducts.filter(p => (p.stock ?? 10) <= 5).length;
  const recent   = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-charcoal-800 font-light">Dashboard</h1>
        <button onClick={() => { refreshOrders(); refreshProducts(); }}
          className="flex items-center gap-2 font-body text-xs text-stone-500 hover:text-charcoal-800 transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',    value: `₦${stats.revenue.toLocaleString('en-NG')}`,    icon: TrendingUp,     color: 'bg-green-50 text-green-600' },
          { label: 'Total Orders',     value: stats.totalOrders,    icon: ShoppingCart,   color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending Orders',   value: stats.pendingOrders,  icon: Clock,          color: 'bg-amber-50 text-amber-600' },
          { label: 'Low Stock Items',  value: lowStock,             icon: AlertTriangle,  color: 'bg-red-50 text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-stone-200 p-5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="font-display text-2xl text-charcoal-800 font-light">{value}</p>
            <p className="font-body text-xs text-stone-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* recent orders */}
      <div className="bg-white border border-stone-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="font-body text-sm font-semibold text-charcoal-800">Recent Orders</h3>
          <Link to="/admin/orders" className="font-body text-xs text-blush-500 hover:text-blush-600 transition-colors">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="font-body text-xs text-stone-400 text-center py-10">No orders yet.</p>
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
                  <tr key={o.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3 font-body text-xs text-charcoal-700 font-medium">NB-{o.id.slice(-6)}</td>
                    <td className="px-5 py-3 font-body text-xs text-charcoal-700">{o.customerName}</td>
                    <td className="px-5 py-3 font-body text-xs text-charcoal-700">₦{(o.total || 0).toLocaleString('en-NG')}</td>
                    <td className="px-5 py-3 font-body text-xs text-charcoal-700 capitalize">{o.paymentMethod || '—'}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* low stock warning */}
      {lowStock > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-body text-xs font-semibold text-amber-700">{lowStock} product{lowStock > 1 ? 's' : ''} are running low on stock.</p>
            <Link to="/admin/products" className="font-body text-xs text-amber-600 underline mt-0.5 inline-block">Manage Products</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── products panel ────────────────────────────────────────────────────────────
function AdminProducts() {
  const { adminProducts, addProduct, editProduct, deleteProduct, updateStock, loading } = useAdmin();
  const [search,     setSearch]     = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirm,    setConfirm]    = useState(null);

  const [form, setForm] = useState({
    name: '', category: 'Gowns', gender: 'women',
    price: '', originalPrice: '', description: '',
    colors: '', sizes: '', badge: '', stock: '10', featured: false,
  });

  const openNew  = () => { setEditTarget(null); setForm({ name:'',category:'Gowns',gender:'women',price:'',originalPrice:'',description:'',colors:'',sizes:'',badge:'',stock:'10',featured:false }); setShowForm(true); };
  const openEdit = (p) => { setEditTarget(p); setForm({ ...p, colors: Array.isArray(p.colors) ? p.colors.join(', ') : p.colors, sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes, price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : '', stock: String(p.stock ?? 10) }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      price:         Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock:         Number(form.stock),
      colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
      sizes:  form.sizes.split(',').map(s => s.trim()).filter(Boolean),
    };
    if (editTarget) await editProduct(editTarget.id, data);
    else await addProduct(data);
    setShowForm(false);
  };

  const filtered = adminProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl text-charcoal-800 font-light">Products</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 py-2">
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products…" className="input-field pl-9 text-sm" />
      </div>

      {/* table */}
      <div className="bg-white border border-stone-200 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-stone-50 border-b border-stone-200">
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
              <tr key={p.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-body text-xs font-medium text-charcoal-800">{p.name}</p>
                  <p className="font-body text-[10px] text-stone-400">{p.gender}</p>
                </td>
                <td className="px-5 py-3 font-body text-xs text-charcoal-700">{p.category}</td>
                <td className="px-5 py-3 font-body text-xs text-charcoal-700">₦{p.price.toLocaleString('en-NG')}</td>
                <td className="px-5 py-3">
                  <input
                    type="number" min={0} value={p.stock ?? 10}
                    onChange={e => updateStock(p.id, e.target.value)}
                    className="w-16 border border-stone-200 text-center font-body text-xs py-1 focus:outline-none focus:border-charcoal-700"
                  />
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
                      className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-charcoal-800 transition-colors">
                      <Eye size={13} />
                    </Link>
                    <button onClick={() => openEdit(p)}
                      className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-charcoal-800 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setConfirm(p.id)}
                      className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-blush-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 font-body text-xs text-stone-400">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── product form modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg my-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-charcoal-800 font-light">{editTarget ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-stone-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="label-xs">Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input-field text-sm" placeholder="Luna Dress" />
                </div>
                <div>
                  <label className="label-xs">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input-field text-sm">
                    {['Boubous','Gowns','Ankara','Perfumes','Agbada','Kaftan','Babariga','Senator'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-xs">Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))} className="input-field text-sm">
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                  </select>
                </div>
                <div>
                  <label className="label-xs">Price (₦) *</label>
                  <input required type="number" min={0} value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} className="input-field text-sm" placeholder="45000" />
                </div>
                <div>
                  <label className="label-xs">Original Price (₦)</label>
                  <input type="number" min={0} value={form.originalPrice} onChange={e => setForm(f => ({...f, originalPrice: e.target.value}))} className="input-field text-sm" placeholder="Leave blank if no discount" />
                </div>
                <div>
                  <label className="label-xs">Stock</label>
                  <input type="number" min={0} value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} className="input-field text-sm" />
                </div>
                <div>
                  <label className="label-xs">Badge</label>
                  <select value={form.badge} onChange={e => setForm(f => ({...f, badge: e.target.value}))} className="input-field text-sm">
                    {['', 'New', 'Bestseller', 'Sale', 'Luxury', 'Bridal', 'Premium'].map(b => <option key={b} value={b}>{b || '— None —'}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label-xs">Colors (comma-separated)</label>
                  <input value={form.colors} onChange={e => setForm(f => ({...f, colors: e.target.value}))} className="input-field text-sm" placeholder="Blush, Ivory, Champagne" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-xs">Sizes (comma-separated)</label>
                  <input value={form.sizes} onChange={e => setForm(f => ({...f, sizes: e.target.value}))} className="input-field text-sm" placeholder="XS, S, M, L, XL" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-xs">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="input-field text-sm resize-none" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(f => ({...f, featured: e.target.checked}))} className="accent-charcoal-900" />
                  <label htmlFor="featured" className="font-body text-xs text-charcoal-700">Featured on homepage</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 py-2.5">{editTarget ? 'Save Changes' : 'Add Product'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── delete confirm ── */}
      {confirm && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-sm w-full text-center">
            <Trash2 size={24} className="text-blush-500 mx-auto mb-3" />
            <h3 className="font-body text-sm font-semibold text-charcoal-800 mb-2">Delete this product?</h3>
            <p className="font-body text-xs text-stone-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { deleteProduct(confirm); setConfirm(null); }} className="btn-blush flex-1 py-2">Delete</button>
              <button onClick={() => setConfirm(null)} className="btn-outline flex-1 py-2">Cancel</button>
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
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [detail,  setDetail]  = useState(null);

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.customerName?.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-3xl text-charcoal-800 font-light">Orders</h1>
        <button onClick={refreshOrders}
          className="flex items-center gap-2 font-body text-xs text-stone-500 hover:text-charcoal-800 transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID…" className="input-field pl-9 text-sm" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['all','pending','processing','shipped','delivered','cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`font-body text-[10px] tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                filter === s ? 'bg-charcoal-900 text-white border-charcoal-900' : 'border-stone-200 text-stone-500 hover:border-charcoal-700'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr className="text-left font-body text-[10px] tracking-[0.15em] uppercase text-stone-400">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                <td className="px-5 py-3 font-body text-xs font-medium text-charcoal-700">NB-{o.id.slice(-6)}</td>
                <td className="px-5 py-3">
                  <p className="font-body text-xs text-charcoal-800">{o.customerName}</p>
                  <p className="font-body text-[10px] text-stone-400">{o.email}</p>
                </td>
                <td className="px-5 py-3 font-body text-xs text-charcoal-700">{(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}</td>
                <td className="px-5 py-3 font-body text-xs font-semibold text-charcoal-800">₦{(o.total || 0).toLocaleString('en-NG')}</td>
                <td className="px-5 py-3 font-body text-xs text-charcoal-700 capitalize">{o.paymentMethod || '—'}</td>
                <td className="px-5 py-3">
                  <div className="relative">
                    <select value={o.status}
                      onChange={e => changeOrderStatus(o.id, e.target.value)}
                      className="appearance-none font-body text-[10px] tracking-wider uppercase pl-2 pr-6 py-1 border cursor-pointer focus:outline-none"
                      style={{ backgroundImage: 'none' }}
                    >
                      {['pending','processing','shipped','delivered','cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setDetail(o)}
                      className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-charcoal-800 transition-colors">
                      <Eye size={13} />
                    </button>
                    <button onClick={() => deleteOrder(o.id)}
                      className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-blush-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 font-body text-xs text-stone-400">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* order detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg my-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-charcoal-800 font-light">Order NB-{detail.id.slice(-6)}</h3>
              <button onClick={() => setDetail(null)}><X size={18} className="text-stone-400" /></button>
            </div>
            <div className="space-y-4 font-body text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Customer</p>
                  <p className="text-charcoal-800 font-medium">{detail.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Email</p>
                  <p className="text-charcoal-700">{detail.email}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Phone</p>
                  <p className="text-charcoal-700">{detail.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Payment</p>
                  <p className="text-charcoal-700 capitalize">{detail.paymentMethod || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Delivery Address</p>
                  <p className="text-charcoal-700">{detail.address}, {detail.city}, {detail.state}</p>
                </div>
              </div>
              <div className="border-t border-stone-200 pt-3">
                <p className="text-[10px] tracking-wider uppercase text-stone-400 mb-2">Items</p>
                {(detail.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-charcoal-700 py-1.5 border-b border-stone-50">
                    <span>{item.name} × {item.quantity} <span className="text-stone-400">({item.color}{item.size !== 'One Size' ? ` / ${item.size}` : ''})</span></span>
                    <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString('en-NG')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-semibold text-charcoal-800 pt-1">
                <span>Total</span>
                <span className="text-blush-500">₦{(detail.total || 0).toLocaleString('en-NG')}</span>
              </div>
              {detail.notes && (
                <div className="bg-stone-50 p-3">
                  <p className="text-[10px] tracking-wider uppercase text-stone-400 mb-1">Notes</p>
                  <p className="text-xs text-charcoal-700">{detail.notes}</p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <label className="text-xs text-stone-500">Status:</label>
                <select value={detail.status}
                  onChange={e => { changeOrderStatus(detail.id, e.target.value); setDetail(d => ({...d, status: e.target.value})); }}
                  className="input-field text-xs py-1.5 flex-1">
                  {['pending','processing','shipped','delivered','cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── customers panel ────────────────────────────────────────────────────────────
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
        <h1 className="font-display text-3xl text-charcoal-800 font-light">Customers</h1>
        <button onClick={refreshUsers}
          className="flex items-center gap-2 font-body text-xs text-stone-500 hover:text-charcoal-800 transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search customers…" className="input-field pl-9 text-sm" />
      </div>

      <div className="bg-white border border-stone-200 overflow-x-auto">
        <table className="w-full min-w-[540px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr className="text-left font-body text-[10px] tracking-[0.15em] uppercase text-stone-400">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Verified</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                <td className="px-5 py-3 font-body text-xs font-medium text-charcoal-800">{u.name || '—'}</td>
                <td className="px-5 py-3 font-body text-xs text-charcoal-700">{u.email}</td>
                <td className="px-5 py-3 font-body text-xs text-stone-400">{u.created ? new Date(u.created).toLocaleDateString('en-NG') : '—'}</td>
                <td className="px-5 py-3">
                  {u.verified
                    ? <span className="text-green-500"><CheckCircle size={13} /></span>
                    : <span className="font-body text-[10px] text-stone-400">—</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 font-body text-xs text-stone-400">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── main admin dashboard shell ────────────────────────────────────────────────
export default function AdminDashboard() {
  const { isAdminLoggedIn } = useAdmin();
  const [mobileSidebar, setMobileSidebar] = useState(false);

  if (!isAdminLoggedIn) return <AdminLogin />;

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* mobile sidebar */}
      {mobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-charcoal-900/50" onClick={() => setMobileSidebar(false)} />
          <div className="relative w-60 h-full">
            <AdminSidebar mobile onClose={() => setMobileSidebar(false)} />
          </div>
        </div>
      )}

      {/* main content */}
      <main className="flex-1 min-w-0">
        {/* topbar */}
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setMobileSidebar(true)} className="lg:hidden">
            <Menu size={20} className="text-charcoal-800" />
          </button>
          <div className="hidden lg:block" />
          <p className="font-body text-sm text-stone-400">
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          <Routes>
            <Route index              element={<DashboardHome />} />
            <Route path="products"   element={<AdminProducts />} />
            <Route path="orders"     element={<AdminOrders />} />
            <Route path="customers"  element={<AdminCustomers />} />
          </Routes>
        </div>
      </main>

      {/* utility class required by admin form labels */}
      <style>{`.label-xs { display:block; font-family: 'DM Sans', sans-serif; font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:#9c9080; margin-bottom:4px; }`}</style>
    </div>
  );
}

import { useState } from 'react';
import { Eye, Trash2, Search, RefreshCw, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import StatusBadge from '../../components/admin/StatusBadge';

const ALL_STATUSES = ['pending','processing','paid','shipped','delivered','cancelled','failed','refunded'];

export default function AdminOrders() {
  const { orders, changeOrderStatus, deleteOrder, refreshOrders, loading } = useAdmin();
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all');
  const [detail,    setDetail]    = useState(null);
  const [confirmId, setConfirmId] = useState(null);

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
                    o.paymentStatus === 'paid'        ? 'bg-green-50 text-green-600 border-green-200'
                    : o.paymentStatus === 'failed'    ? 'bg-red-50 text-red-600 border-red-200'
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
                    <button onClick={() => setConfirmId(o.id)}
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

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60">
          <div className="w-full max-w-sm p-6 text-center bg-white">
            <Trash2 size={24} className="mx-auto mb-3 text-blush-500" />
            <h3 className="mb-2 text-sm font-semibold font-body text-charcoal-800">Delete this order?</h3>
            <p className="mb-5 text-xs font-body text-stone-400">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { deleteOrder(confirmId); setConfirmId(null); }} className="flex-1 py-2 btn-blush">Delete</button>
              <button onClick={() => setConfirmId(null)} className="flex-1 py-2 btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

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
                  <div className="col-span-2"><p className="text-[10px] tracking-wider uppercase text-stone-400 mb-0.5">Payment Reference</p><p className="text-charcoal-700">{detail.paymentRef}</p></div>
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

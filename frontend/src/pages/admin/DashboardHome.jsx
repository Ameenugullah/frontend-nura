import { Link } from 'react-router-dom';
import { TrendingUp, AlertTriangle, ShoppingCart, Clock, RefreshCw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import StatusBadge from '../../components/admin/StatusBadge';

export default function DashboardHome() {
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

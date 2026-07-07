import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrdersByEmail } from '../lib/api';

const STATUS_STYLES = {
  pending:    'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  paid:       'bg-cyan-50 text-cyan-700',
  shipped:    'bg-purple-50 text-purple-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-stone-100 text-stone-500',
  failed:     'bg-red-50 text-red-600',
  refunded:   'bg-orange-50 text-orange-700',
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/orders' } }); return; }
    getOrdersByEmail(user.email).then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl px-6 py-16 mx-auto">
        <div className="mb-10">
          <p className="tag mb-2">Account</p>
          <h1 className="section-heading">My Orders</h1>
          <p className="mt-2 text-sm font-body text-stone-400">{user.email}</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-stone-200 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag size={40} className="mx-auto mb-4 text-stone-300" />
            <p className="mb-2 text-lg font-light font-display text-charcoal-800">No orders yet</p>
            <p className="mb-8 text-sm font-body text-stone-400">When you place an order it will appear here.</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-stone-200">
                <button
                  className="flex items-center justify-between w-full px-5 py-4 text-left"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <Package size={18} className="text-stone-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium font-body text-charcoal-800">
                        NB-{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="font-body text-[10px] text-stone-400 mt-0.5">
                        {new Date(order.created).toLocaleDateString('en-NG', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                        {' · '}
                        {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-body text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 ${STATUS_STYLES[order.status] || 'bg-stone-100 text-stone-500'}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold font-body text-charcoal-800 hidden sm:block">
                      ₦{Number(order.total || 0).toLocaleString('en-NG')}
                    </span>
                    <ChevronRight size={15} className={`text-stone-400 transition-transform ${expanded === order.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {expanded === order.id && (
                  <div className="px-5 pb-5 border-t border-stone-100">
                    <div className="pt-4 space-y-3">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-medium font-body text-charcoal-800">{item.name}</p>
                            <p className="font-body text-[10px] text-stone-400">
                              {item.color && `${item.color} · `}
                              {item.size && item.size !== 'One Size' ? `${item.size} · ` : ''}
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold font-body text-charcoal-800 shrink-0">
                            ₦{(Number(item.price) * Number(item.quantity)).toLocaleString('en-NG')}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 mt-4 border-t border-stone-100 space-y-1.5 text-xs font-body text-stone-500">
                      {order.address && order.address !== 'STORE PICKUP' && (
                        <p>Delivery: {order.address}, {order.city}, {order.state}</p>
                      )}
                      {order.address === 'STORE PICKUP' && <p>Store pickup — Kano</p>}
                      {order.notes && <p>Notes: {order.notes}</p>}
                      <div className="flex justify-between pt-1 text-sm font-semibold text-charcoal-800">
                        <span>Total</span>
                        <span>₦{Number(order.total || 0).toLocaleString('en-NG')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

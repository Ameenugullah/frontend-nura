import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, CheckCheck, ShoppingBag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbase';

const MAX_NOTIFICATIONS = 50;

function fmt(dateStr) {
  return new Date(dateStr).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function normalize(r) {
  return {
    id:            r.id,
    orderId:       r.orderId       || '',
    orderRef:      r.orderRef      || `NB-${r.id.slice(-6).toUpperCase()}`,
    customerName:  r.customerName  || 'Customer',
    amount:        Number(r.amount || 0),
    paymentMethod: r.paymentMethod || 'paystack',
    read:          Boolean(r.read),
    createdAt:     r.created       || new Date().toISOString(),
  };
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [open,          setOpen]          = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    let unsub;

    async function init() {
      try {
        const result = await pb.collection('notifications').getList(1, MAX_NOTIFICATIONS, {
          sort: '-created',
        });
        setNotifications(result.items.map(normalize));
      } catch {
      } finally {
        setLoading(false);
      }

      try {
        unsub = await pb.collection('notifications').subscribe('*', (e) => {
          if (e.action === 'create') {
            setNotifications(prev => [normalize(e.record), ...prev].slice(0, MAX_NOTIFICATIONS));
          } else if (e.action === 'update') {
            setNotifications(prev => prev.map(n => n.id === e.record.id ? normalize(e.record) : n));
          } else if (e.action === 'delete') {
            setNotifications(prev => prev.filter(n => n.id !== e.record.id));
          }
        });
      } catch {}
    }

    init();
    return () => { unsub?.(); };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = useCallback(async (id, orderId) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await pb.collection('notifications').update(id, { read: true }); } catch {}
    if (orderId) { navigate('/admin/orders'); setOpen(false); }
  }, [navigate]);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.read);
    if (!unread.length) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await Promise.allSettled(unread.map(n => pb.collection('notifications').update(n.id, { read: true })));
  }, [notifications]);

  const clearAll = useCallback(async () => {
    const ids = notifications.map(n => n.id);
    setNotifications([]);
    setOpen(false);
    await Promise.allSettled(ids.map(id => pb.collection('notifications').delete(id)));
  }, [notifications]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 transition-colors rounded-full hover:bg-stone-100"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={17} className="text-charcoal-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-blush-500 text-white text-[10px] font-bold font-body rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white shadow-xl shadow-stone-900/10 border border-stone-200 z-50 max-h-[480px] flex flex-col">

          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-charcoal-800" />
              <span className="text-sm font-semibold font-body text-charcoal-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-blush-500 text-white text-[9px] font-bold font-body px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button onClick={markAllRead} title="Mark all read"
                  className="transition-colors text-stone-400 hover:text-charcoal-800">
                  <CheckCheck size={14} />
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} title="Clear all"
                  className="transition-colors text-stone-400 hover:text-blush-500">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-2">
                <Loader2 size={16} className="animate-spin text-stone-300" />
                <span className="text-xs font-body text-stone-400">Loading…</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={28} className="mx-auto mb-3 text-stone-200" strokeWidth={1.5} />
                <p className="text-xs font-body text-stone-400">No notifications yet</p>
                <p className="font-body text-[10px] text-stone-300 mt-1">Paid orders appear here instantly</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id, n.orderId)}
                  className={`w-full text-left flex gap-3 px-4 py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors ${!n.read ? 'bg-blush-50/50' : ''}`}
                >
                  <div className="shrink-0 w-8 h-8 bg-green-50 rounded-full flex items-center justify-center mt-0.5">
                    <ShoppingBag size={13} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-snug font-body text-charcoal-800 truncate">
                        {n.customerName}
                      </p>
                      {!n.read && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blush-500 mt-0.5" />}
                    </div>
                    <p className="font-body text-[10px] text-stone-400 mt-0.5">{n.orderRef}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-semibold text-green-600 font-body">
                        ₦{n.amount.toLocaleString('en-NG')}
                      </span>
                      <span className="font-body text-[10px] text-stone-300">{fmt(n.createdAt)}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

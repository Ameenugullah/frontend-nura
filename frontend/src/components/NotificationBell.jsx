import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, CheckCheck, ShoppingBag } from 'lucide-react';
import pb from '../lib/pocketbase';

const STORAGE_KEY = 'nb_notifications';
const READ_KEY    = 'nb_notifications_read';

function loadNotifications() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveNotifications(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
}
function loadRead() {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')); } catch { return new Set(); }
}
function saveRead(set) {
  localStorage.setItem(READ_KEY, JSON.stringify([...set]));
}

function fmt(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState(loadNotifications);
  const [readIds,       setReadIds]       = useState(loadRead);
  const [open,         setOpen]           = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  // Subscribe to PocketBase realtime — new paid orders trigger a notification
  useEffect(() => {
    let unsub;
    const subscribe = async () => {
      try {
        unsub = await pb.collection('orders').subscribe('*', (event) => {
          const order = event.record;
          if (
            (event.action === 'create' || event.action === 'update') &&
            (order.paymentStatus === 'paid' || order.status === 'processing')
          ) {
            setNotifications(prev => {
              // Avoid duplicates
              if (prev.some(n => n.id === order.id)) return prev;
              const next = [{
                id:            order.id,
                customerName:  order.customerName || 'Customer',
                orderRef:      `NB-${order.id.slice(-6).toUpperCase()}`,
                total:         order.total || 0,
                paymentStatus: order.paymentStatus || 'paid',
                createdAt:     order.created || new Date().toISOString(),
              }, ...prev];
              saveNotifications(next);
              return next;
            });
          }
        });
      } catch { /* PB not connected or no auth — silent */ }
    };
    subscribe();
    return () => { unsub?.(); };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = useCallback(() => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
    saveRead(allIds);
  }, [notifications]);

  const markRead = useCallback((id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveRead(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setReadIds(new Set());
    saveNotifications([]);
    saveRead(new Set());
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center transition-colors rounded-full w-9 h-9 bg-white/10 hover:bg-white/20"
        aria-label="Notifications"
      >
        <Bell size={17} className="text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-blush-500 text-white text-[10px] font-bold font-body rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white shadow-lift border border-stone-200 z-50 max-h-[480px] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-charcoal-800" />
              <span className="text-sm font-semibold font-body text-charcoal-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-blush-500 text-white text-[9px] font-bold font-body px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-2">
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

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={28} className="mx-auto mb-3 text-stone-200" />
                <p className="text-xs font-body text-stone-400">No notifications yet</p>
                <p className="font-body text-[10px] text-stone-300 mt-1">Paid orders will appear here</p>
              </div>
            ) : (
              notifications.map(n => {
                const isUnread = !readIds.has(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`w-full text-left flex gap-3 px-4 py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors ${isUnread ? 'bg-blush-50/40' : ''}`}
                  >
                    <div className="shrink-0 w-8 h-8 bg-green-50 rounded-full flex items-center justify-center mt-0.5">
                      <ShoppingBag size={13} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold leading-snug font-body text-charcoal-800">
                          {n.customerName}
                        </p>
                        {isUnread && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blush-500 mt-1" />}
                      </div>
                      <p className="font-body text-[10px] text-stone-400 mt-0.5">{n.orderRef}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-semibold text-green-600 font-body">
                          ₦{Number(n.total).toLocaleString('en-NG')}
                        </span>
                        <span className="font-body text-[10px] text-stone-300">{fmt(n.createdAt)}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

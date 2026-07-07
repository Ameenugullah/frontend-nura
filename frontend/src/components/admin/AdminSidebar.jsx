import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Settings, LogOut, Wifi, WifiOff, Instagram, X,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const PB_ADMIN_URL = (import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090') + '/_/';

const adminNav = [
  { label: 'Dashboard',      icon: LayoutDashboard, to: '/admin' },
  { label: 'Products',       icon: Package,          to: '/admin/products' },
  { label: 'Orders',         icon: ShoppingCart,     to: '/admin/orders' },
  { label: 'Customers',      icon: Users,            to: '/admin/customers' },
  { label: 'Instagram Grid', icon: Instagram,        to: '/admin/instagram' },
];

export default function AdminSidebar({ mobile, onClose }) {
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

import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAdmin }          from '../context/AdminContext';
import AdminLogin            from '../components/admin/AdminLogin';
import AdminSidebar          from '../components/admin/AdminSidebar';
import NotificationBell      from '../components/NotificationBell';
import DashboardHome         from './admin/DashboardHome';
import AdminProducts         from './admin/AdminProducts';
import AdminOrders           from './admin/AdminOrders';
import AdminCustomers        from './admin/AdminCustomers';
import AdminPromoVideos      from './admin/AdminPromoVideos';

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
          <div className="flex items-center gap-4">
            <NotificationBell />
            <p className="hidden text-sm sm:block font-body text-stone-400">
              {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>

        <div className="max-w-6xl p-6 mx-auto">
          <Routes>
            <Route index            element={<DashboardHome />} />
            <Route path="products"  element={<AdminProducts />} />
            <Route path="orders"    element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="promo-videos" element={<AdminPromoVideos />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <p className="font-body text-[10px] tracking-[0.3em] uppercase text-blush-500">404</p>
                <h2 className="text-3xl font-light font-display text-charcoal-800">Page not found</h2>
              </div>
            } />
          </Routes>
        </div>
      </main>
    </div>
  );
}

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider }  from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider }  from './context/AuthContext';
import Navbar            from './components/Navbar';
import Footer            from './components/Footer';
import Home              from './pages/Home';
import Products          from './pages/Products';
import ProductDetail     from './pages/ProductDetail';
import Cart              from './pages/Cart';
import Checkout          from './pages/Checkout';
import FAQ               from './pages/FAQ';
import Login             from './pages/Login';
import ForgotPassword    from './pages/ForgotPassword';
import AdminDashboard    from './pages/AdminDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <main className="flex-1">
        <ScrollToTop />
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/products"        element={<Products />} />
          <Route path="/products/:id"    element={<ProductDetail />} />
          <Route path="/cart"            element={<Cart />} />
          <Route path="/checkout"        element={<Checkout />} />
          <Route path="/faq"             element={<FAQ />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center pt-20">
              <div className="text-center px-6">
                <p className="font-body text-[10px] tracking-[0.3em] uppercase text-blush-500 mb-4">404 — Not Found</p>
                <h1 className="font-display text-7xl text-charcoal-800 font-light mb-6">Lost?</h1>
                <p className="font-body text-charcoal-700/60 mb-8">This page doesn't exist.</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <Routes>
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/*"       element={<StoreLayout />} />
            </Routes>
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

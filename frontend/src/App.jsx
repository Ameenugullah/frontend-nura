import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider }     from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AdminProvider }    from './context/AdminContext';
import { AuthProvider }     from './context/AuthContext';
import Navbar               from './components/Navbar';
import Footer               from './components/Footer';
import Home                 from './pages/Home';
import Products             from './pages/Products';
import ProductDetail        from './pages/ProductDetail';
import Cart                 from './pages/Cart';
import Checkout             from './pages/Checkout';
import OrderVerifying       from './pages/OrderVerifying';
import FAQ                  from './pages/FAQ';
import Login                from './pages/Login';
import ForgotPassword       from './pages/ForgotPassword';
import About                from './pages/About';
import Contact              from './pages/Contact';
import Orders               from './pages/Orders';
import Wishlist             from './pages/Wishlist';
import AdminDashboard       from './pages/AdminDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

function StoreLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <Navbar />
      <main className="flex-1">
        <ScrollToTop />
        <Routes>
          <Route index                        element={<Home />} />
          <Route path="products"              element={<Products />} />
          <Route path="products/:id"          element={<ProductDetail />} />
          <Route path="cart"                  element={<Cart />} />
          <Route path="checkout"              element={<Checkout />} />
          <Route path="order/:id/verifying"   element={<OrderVerifying />} />
          <Route path="faq"                   element={<FAQ />} />
          <Route path="about"                 element={<About />} />
          <Route path="contact"               element={<Contact />} />
          <Route path="login"                 element={<Login />} />
          <Route path="forgot-password"       element={<ForgotPassword />} />
          <Route path="orders"               element={<Orders />} />
          <Route path="wishlist"             element={<Wishlist />} />
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen pt-20">
              <div className="px-6 text-center">
                <p className="font-body text-[10px] tracking-[0.3em] uppercase text-blush-500 mb-4">404 — Not Found</p>
                <h1 className="mb-6 font-light font-display text-7xl text-charcoal-800">Lost?</h1>
                <p className="mb-8 font-body text-charcoal-700/60">This page doesn't exist.</p>
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
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route path="/admin/*" element={
                <AdminProvider>
                  <AdminDashboard />
                </AdminProvider>
              } />
              <Route path="/*" element={<StoreLayout />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

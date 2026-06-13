import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  adminLogin, adminLogout, isAdminLoggedIn,
  getProducts, createProduct, updateProduct,
  deleteProduct as apiDeleteProduct, updateStock as apiUpdateStock,
  getOrders, updateOrderStatus, deleteOrder as apiDeleteOrder,
  getUsers, checkPBHealth,
} from '../lib/api';
import { allProducts as staticProducts } from '../data/products';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn]   = useState(isAdminLoggedIn());
  const [pbProducts, setPbProducts]   = useState(staticProducts);
  const [orders, setOrders]           = useState([]);
  const [users, setUsers]             = useState([]);
  const [loginError, setLoginError]   = useState('');
  const [loading, setLoading]         = useState(false);
  const [pbConnected, setPbConnected] = useState(false);
  const [stats, setStats]             = useState({ revenue: 0, totalOrders: 0, pendingOrders: 0 });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const alive = await checkPBHealth();
      setPbConnected(alive);
      if (alive) {
        const data = await getProducts();
        setPbProducts(data.length > 0 ? data : staticProducts);
      } else {
        setPbProducts(staticProducts);
      }
    } catch {
      setPbConnected(false);
      setPbProducts(staticProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
      // compute quick stats
      const revenue      = data.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0);
      const totalOrders  = data.length;
      const pendingOrders= data.filter(o => o.status === 'pending').length;
      setStats({ revenue, totalOrders, pendingOrders });
    } catch (err) {
      console.warn('Could not load orders:', err.message);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch { /* silently fail if no admin auth */ }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => {
    if (isLoggedIn) {
      loadOrders();
      loadUsers();
    }
  }, [isLoggedIn, loadOrders, loadUsers]);

  const login = useCallback(async (email, password) => {
    const result = await adminLogin(email, password);
    if (result.success) {
      setIsLoggedIn(true);
      setLoginError('');
      return true;
    }
    setLoginError(result.error || 'Invalid credentials.');
    return false;
  }, []);

  const logout = useCallback(() => {
    adminLogout();
    setIsLoggedIn(false);
  }, []);

  const addProduct = useCallback(async (product) => {
    if (pbConnected) {
      try {
        const p = await createProduct(product);
        setPbProducts(prev => [p, ...prev]);
        return p;
      } catch (err) { console.error(err); }
    }
    const p = { ...product, id: `local-${Date.now()}`, rating: 5, reviews: 0, stock: product.stock || 10 };
    setPbProducts(prev => [p, ...prev]);
    return p;
  }, [pbConnected]);

  const editProduct = useCallback(async (id, data) => {
    if (pbConnected) {
      try {
        const p = await updateProduct(id, data);
        setPbProducts(prev => prev.map(x => x.id === id ? p : x));
        return p;
      } catch (err) { console.error(err); }
    }
    setPbProducts(prev => prev.map(x => x.id === id ? { ...x, ...data } : x));
  }, [pbConnected]);

  const removeProduct = useCallback(async (id) => {
    if (pbConnected) {
      try { await apiDeleteProduct(id); } catch (err) { console.error(err); }
    }
    setPbProducts(prev => prev.filter(p => p.id !== id));
  }, [pbConnected]);

  const updateStock = useCallback(async (id, stock) => {
    if (pbConnected) {
      try { await apiUpdateStock(id, stock); } catch (err) { console.error(err); }
    }
    setPbProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Number(stock) } : p));
  }, [pbConnected]);

  const getStock = useCallback((id) => {
    return pbProducts.find(p => p.id === id)?.stock ?? 10;
  }, [pbProducts]);

  const changeOrderStatus = useCallback(async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      // refresh stats
      setOrders(prev => {
        const updated = prev.map(o => o.id === id ? { ...o, status } : o);
        const revenue       = updated.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0);
        const totalOrders   = updated.length;
        const pendingOrders = updated.filter(o => o.status === 'pending').length;
        setStats({ revenue, totalOrders, pendingOrders });
        return updated;
      });
    } catch (err) { console.error(err); }
  }, []);

  const removeOrder = useCallback(async (id) => {
    try {
      await apiDeleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) { console.error(err); }
  }, []);

  return (
    <AdminContext.Provider value={{
      isAdminLoggedIn: isLoggedIn, login, logout, loginError, loading, pbConnected,
      allProducts: pbProducts, adminProducts: pbProducts,
      addProduct, editProduct, deleteProduct: removeProduct, updateStock, getStock,
      orders, changeOrderStatus, deleteOrder: removeOrder, refreshOrders: loadOrders,
      users, refreshUsers: loadUsers,
      refreshProducts: loadProducts,
      stats,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be inside AdminProvider');
  return ctx;
};

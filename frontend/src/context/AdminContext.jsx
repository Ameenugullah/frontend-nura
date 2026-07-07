import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  adminLogin, adminLogout, isAdminLoggedIn,
  getProducts, createProduct, updateProduct,
  deleteProduct as apiDeleteProduct, updateStock as apiUpdateStock,
  getOrders, updateOrderStatus, deleteOrder as apiDeleteOrder,
  getUsers, checkPBHealth,
} from '../lib/api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn]   = useState(isAdminLoggedIn());
  const [pbProducts, setPbProducts]   = useState([]);
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
        setPbProducts(data);
      } else {
        setPbProducts([]);
      }
    } catch {
      setPbConnected(false);
      setPbProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
      const revenue       = data.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0);
      const totalOrders   = data.length;
      const pendingOrders = data.filter(o => o.status === 'pending').length;
      setStats({ revenue, totalOrders, pendingOrders });
    } catch (err) {
      console.warn('Could not load orders:', err.message);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadProducts();
      loadOrders();
      loadUsers();
    }
  }, [isLoggedIn, loadProducts, loadOrders, loadUsers]);

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
    if (!pbConnected) {
      console.warn('PocketBase is offline — cannot add product.');
      return null;
    }
    try {
      const p = await createProduct(product);
      setPbProducts(prev => [p, ...prev]);
      return p;
    } catch (err) {
      console.error('Failed to create product:', err);
      // Bubble up the error so the UI can show a message and we can inspect details
      throw err;
    }
  }, [pbConnected]);

  const editProduct = useCallback(async (id, data) => {
    if (!pbConnected) {
      console.warn('PocketBase is offline — cannot edit product.');
      return null;
    }
    try {
      const p = await updateProduct(id, data);
      setPbProducts(prev => prev.map(x => x.id === id ? p : x));
      return p;
    } catch (err) {
      console.error('Failed to update product:', err);
      return null;
    }
  }, [pbConnected]);

  const removeProduct = useCallback(async (id) => {
    if (!pbConnected) {
      console.warn('PocketBase is offline — cannot delete product.');
      return;
    }
    try {
      await apiDeleteProduct(id);
      setPbProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  }, [pbConnected]);

  const updateStock = useCallback(async (id, stock) => {
    if (!pbConnected) return;
    try {
      await apiUpdateStock(id, stock);
      setPbProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Number(stock) } : p));
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  }, [pbConnected]);

  const getStock = useCallback((id) => {
    return pbProducts.find(p => p.id === id)?.stock ?? 0;
  }, [pbProducts]);

  const changeOrderStatus = useCallback(async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => {
        const updated = prev.map(o => o.id === id ? { ...o, status } : o);
        const revenue       = updated.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0);
        const totalOrders   = updated.length;
        const pendingOrders = updated.filter(o => o.status === 'pending').length;
        setStats({ revenue, totalOrders, pendingOrders });
        return updated;
      });
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  }, []);

  const removeOrder = useCallback(async (id) => {
    try {
      await apiDeleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  }, []);

  return (
    <AdminContext.Provider value={{
      isAdminLoggedIn: isLoggedIn, login, logout, loginError, loading, pbConnected,
      adminProducts: pbProducts,
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be inside AdminProvider');
  return ctx;
}
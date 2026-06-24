import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((product, size = 'One Size', color = '', qty = 1) => {
    // unique key per product+size+color combo
    const key = `${product.id}__${size}__${color}`;
    setCartItems(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { ...product, key, size, color, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((key) => {
    setCartItems(prev => prev.filter(i => i.key !== key));
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    if (quantity < 1) {
      setCartItems(prev => prev.filter(i => i.key !== key));
      return;
    }
    setCartItems(prev => prev.map(i => i.key === key ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = cartItems.reduce((s, i) => s + (i.quantity || 0), 0);
  const subtotal  = cartItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

export default CartContext;
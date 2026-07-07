import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'nb_wishlist';

function loadWishlist() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(loadWishlist);

  const toggle = useCallback((product) => {
    setItems(prev =>
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const isWishlisted = useCallback((id) => items.some(p => p.id === id), [items]);

  const wishlistCount = items.length;

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
};

export default WishlistContext;
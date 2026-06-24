import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signIn, signOut, getCurrentUser } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      await signIn(email, password);
      const u = getCurrentUser();
      setUser(u);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || String(err) };
    }
  }, []);

  const logout = useCallback(() => {
    signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;

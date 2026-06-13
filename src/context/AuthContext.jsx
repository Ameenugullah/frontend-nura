import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { signIn, signOut, signUp, getCurrentUser, requestPasswordReset, checkPBHealth } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(getCurrentUser);
  const [loading, setLoading] = useState(false);
  const [pbLive, setPbLive]   = useState(false);

  useEffect(() => { checkPBHealth().then(setPbLive); }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const auth = await signIn(email, password);
      setUser(auth.record);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, name) => {
    setLoading(true);
    try {
      await signUp(email, password, name);
      const auth = await signIn(email, password);
      setUser(auth.record);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      await requestPasswordReset(email);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to send reset email.' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, pbLive, login, register, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

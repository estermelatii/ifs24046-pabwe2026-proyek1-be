import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';
const A = createContext();
export const useAuth = () => useContext(A);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => { try { if (localStorage.getItem('fg-token')) api('/api/auth/me').then(setUser).catch(() => localStorage.removeItem('fg-token')); } catch {} }, []);
  const login = async (path, body) => { const r = await api('/api/auth/' + path, { method: 'POST', body }); localStorage.setItem('fg-token', r.token); setUser(r.user); };
  const logout = () => { try { localStorage.removeItem('fg-token'); } catch {} setUser(null); };
  return <A.Provider value={{ user, login, logout }}>{children}</A.Provider>;
}

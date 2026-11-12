import { createContext, useContext, useState } from 'react';
import { api } from '../api';
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
function readUser() { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const saveSession = data => { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); setUser(data.user); };
  const login = async credentials => { const response = await api.post('/auth/login', credentials); saveSession(response.data); };
  const register = async details => { const response = await api.post('/auth/register', details); saveSession(response.data); };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };
  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

type User = { id: string; email: string; role: 'ADMIN' };
type AuthContextValue = { user: User | null; isLoading: boolean; refresh: () => Promise<void> };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    try {
      const response = await fetch(`${apiBaseUrl}/auth/me`, { credentials: 'include' });
      const data = response.ok ? await response.json() as { user: User } : null;
      setUser(data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  return <AuthContext.Provider value={{ user, isLoading, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

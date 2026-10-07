import { onAuthStateChanged, type User } from '@firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getAuthInstance } from './auth';

type AuthState = {
  user: User | null;
  loading: boolean;
  /** Solo en desarrollo: entrar sin cuenta para probar pantallas en Expo Go. */
  guest: boolean;
  enterAsGuest: () => void;
};

const Ctx = createContext<AuthState>({ user: null, loading: true, guest: false, enterAsGuest: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(false);
  useEffect(
    () =>
      onAuthStateChanged(getAuthInstance(), (u) => {
        setUser(u);
        setLoading(false);
      }),
    [],
  );
  const value = useMemo(() => ({ user, loading, guest, enterAsGuest: () => setGuest(true) }), [user, loading, guest]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

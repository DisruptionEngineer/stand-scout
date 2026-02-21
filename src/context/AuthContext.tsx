import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSession, onAuthStateChange } from '../lib/auth';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then(s => {
      setSession(s);
      setLoading(false);
    });

    const subscription = onAuthStateChange(s => {
      setSession(s);
      setLoading(false);
    });

    return () => {
      if ('unsubscribe' in subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const user = session?.user ?? null;
  // Any authenticated Supabase user is treated as admin
  const isAdmin = !!user;

  return (
    <AuthContext.Provider value={{ session, user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

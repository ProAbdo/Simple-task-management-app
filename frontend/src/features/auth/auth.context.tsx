import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { setAccessToken } from '@/api/http-client';
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from '@/features/auth/auth.storage';
import type { AuthSession } from '@/features/auth/auth.types';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  startSession: (session: AuthSession) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const initialSession = loadAuthSession();

setAccessToken(initialSession?.accessToken ?? null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(initialSession);

  const startSession = useCallback((nextSession: AuthSession) => {
    saveAuthSession(nextSession);
    setAccessToken(nextSession.accessToken);
    setSession(nextSession);
  }, []);

  const signOut = useCallback(() => {
    clearAuthSession();
    setAccessToken(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      startSession,
      signOut,
    }),
    [session, signOut, startSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

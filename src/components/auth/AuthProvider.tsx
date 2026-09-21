"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAuthRepository } from "@/lib/auth/repository";
import type { AuthSession, LoginCredentials } from "@/types/auth";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const repo = useMemo(() => getAuthRepository(), []);

  const refresh = useCallback(async () => {
    const next = await repo.getSession();
    setSession(next);
  }, [repo]);

  useEffect(() => {
    void (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const next = await repo.login(credentials);
      setSession(next);
    },
    [repo],
  );

  const logout = useCallback(async () => {
    await repo.logout();
    setSession(null);
  }, [repo]);

  const value = useMemo(
    () => ({ session, loading, login, logout, refresh }),
    [session, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}

import { apiFetch, setStoredToken, getStoredToken } from '@/lib/api/client';
import type {
  AuthRepository,
  AuthSession,
  AuthUser,
  LoginCredentials,
} from '@/types/auth';

const SESSION_KEY = 'rs.auth.session';

function readSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      setStoredToken(null);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession | null) {
  if (typeof window === 'undefined') return;
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    setStoredToken(null);
    document.cookie = 'rs_auth=; Path=/; Max-Age=0; SameSite=Lax';
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setStoredToken(session.token);
  const maxAge = Math.max(
    0,
    Math.floor((session.expiresAt - Date.now()) / 1000),
  );
  document.cookie = `rs_auth=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export const apiAuthRepository: AuthRepository = {
  async login(credentials: LoginCredentials) {
    const session = await apiFetch<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    writeSession(session);
    return session;
  },

  async logout() {
    writeSession(null);
  },

  async getSession() {
    const cached = readSession();
    if (!cached || !getStoredToken()) return cached;
    try {
      const user = await apiFetch<AuthUser>('/auth/me');
      const next = { ...cached, user };
      writeSession(next);
      return next;
    } catch {
      writeSession(null);
      return null;
    }
  },

  async isAuthenticated() {
    return (await this.getSession()) !== null;
  },
};

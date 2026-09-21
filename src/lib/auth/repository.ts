/**
 * 인증 repository.
 * NEXT_PUBLIC_DATA_SOURCE=api → Nest JWT
 * 기본(local) → localStorage 데모 계정
 */
import type {
  AuthRepository,
  AuthSession,
  LoginCredentials,
} from "@/types/auth";
import { apiAuthRepository } from "@/lib/auth/api-auth";

const SESSION_KEY = "rs.auth.session";

const USERS = [
  {
    id: "user-rjsgud",
    username: "rjsgud",
    password: "rjsgud123",
    displayName: "rjsgud",
    role: "admin" as const,
  },
];

function createToken() {
  return `tok_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    document.cookie = "rs_auth=; Path=/; Max-Age=0; SameSite=Lax";
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  const maxAge = Math.max(
    0,
    Math.floor((session.expiresAt - Date.now()) / 1000),
  );
  document.cookie = `rs_auth=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export const localAuthRepository: AuthRepository = {
  async login(credentials: LoginCredentials) {
    await delay(200);
    const user = USERS.find(
      (u) =>
        u.username === credentials.username.trim() &&
        u.password === credentials.password,
    );
    if (!user) {
      throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
    const session: AuthSession = {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
      token: createToken(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    };
    writeSession(session);
    return session;
  },

  async logout() {
    writeSession(null);
  },

  async getSession() {
    return readSession();
  },

  async isAuthenticated() {
    return readSession() !== null;
  },
};

export function getAuthRepository(): AuthRepository {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "local";
  if (source === "api") return apiAuthRepository;
  return localAuthRepository;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

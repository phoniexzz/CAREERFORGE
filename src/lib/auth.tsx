import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiRequest } from "./api-client";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "advisor";
  isVerified: boolean;
  isActive: boolean;
  deletionScheduledAt?: string | null;
  createdAt: string;
}

export interface AuthSession {
  id: string;
  current: boolean;
  userAgent: string;
  ipAddress: string;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function hasSessionHint() {
  return (
    typeof document !== "undefined" &&
    document.cookie
      .split("; ")
      .some((item) => item.startsWith("careerforge_csrf="))
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!hasSessionHint()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const current = await apiRequest<AuthUser>("/auth/me");
      setUser(current);
      return current;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
    const expired = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener("careerforge:session-expired", expired);
    return () =>
      window.removeEventListener("careerforge:session-expired", expired);
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refreshUser,
      login: async (email, password) => {
        const current = await apiRequest<AuthUser>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setUser(current);
        return current;
      },
      logout: async () => {
        try {
          await apiRequest<null>("/auth/logout", { method: "POST" });
        } finally {
          setUser(null);
        }
      },
    }),
    [loading, refreshUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

"use client";

import * as React from "react";
import type { User, UserRole } from "@/types";

const STORAGE_KEY = "smc-user";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
export interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  setUser: (user: User | null) => void;
  login: (credentials: LoginCredentials) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;        // hydration loading
  isAuthLoading: boolean;    // login/logout loading
}

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function isValidRole(role: unknown): role is UserRole {
  return (
    role === "admin" ||
    role === "department_head" ||
    role === "staff" ||
    role === "auditor" ||
    role === "public" ||
    role === "po" ||
    role === "collector" ||
    role === "dc"
  );
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as unknown;

    if (
      data &&
      typeof data === "object" &&
      typeof (data as User).id === "string" &&
      typeof (data as User).name === "string" &&
      typeof (data as User).email === "string" &&
      isValidRole((data as User).role)
    ) {
      const u = data as User;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        departmentId:
          typeof u.departmentId === "string" ? u.departmentId : undefined,
        avatar: typeof u.avatar === "string" ? u.avatar : undefined,
      };
    }
  } catch {
    // ignore invalid storage
  }

  return null;
}

function persistUser(user: User | null) {
  if (typeof window === "undefined") return;

  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      avatar: user.avatar,
    })
  );
}

/* ─────────────────────────────────────────────────────────────
   Context
───────────────────────────────────────────────────────────── */
const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

/* ─────────────────────────────────────────────────────────────
   Demo Users (optional for testing)
───────────────────────────────────────────────────────────── */
const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: "1",
    name: "Municipal Admin",
    email: "admin@municipal.gov",
    role: "admin",
    avatar: undefined,
  },
  department_head: {
    id: "2",
    name: "Dept. Head Singh",
    email: "head@municipal.gov",
    role: "department_head",
    departmentId: "dept-1",
    avatar: undefined,
  },
  staff: {
    id: "3",
    name: "Staff Kumar",
    email: "staff@municipal.gov",
    role: "staff",
    departmentId: "dept-1",
    avatar: undefined,
  },
  auditor: {
    id: "4",
    name: "Auditor Sharma",
    email: "auditor@municipal.gov",
    role: "auditor",
    avatar: undefined,
  },
  public: {
    id: "5",
    name: "Citizen Rao",
    email: "citizen@email.com",
    role: "public",
    avatar: undefined,
  },
  po: {
    id: "6",
    name: "PO Officer",
    email: "po@municipal.gov",
    role: "po",
    avatar: undefined,
  },
  collector: {
    id: "7",
    name: "District Collector",
    email: "collector@gov.in",
    role: "collector",
    avatar: undefined,
  },
  dc: {
    id: "8",
    name: "Deputy Commissioner",
    email: "dc@gov.in",
    role: "dc",
    avatar: undefined,
  },
};

/* ─────────────────────────────────────────────────────────────
   Provider
───────────────────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<User | null>(null);
  const [hasHydrated, setHasHydrated] = React.useState(false);
  const [isAuthLoading, setIsAuthLoading] = React.useState(false);

  // Hydrate from localStorage
  React.useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUserState(storedUser);
    }
    setHasHydrated(true);
  }, []);

  const setUser = React.useCallback((newUser: User | null) => {
    setUserState(newUser);
    persistUser(newUser);
  }, []);

  const login = React.useCallback(
    async (credentials: LoginCredentials): Promise<{ error?: string }> => {
      setIsAuthLoading(true);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email.trim(),
            password: credentials.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { error: data?.error ?? "Login failed" };
        }

        if (data?.user) {
          const loggedInUser: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            departmentId: data.user.departmentId,
            avatar: data.user.avatar,
          };

          setUser(loggedInUser);
          return {};
        }

        return { error: "Invalid response from server" };
      } catch {
        return { error: "Network error" };
      } finally {
        setIsAuthLoading(false);
      }
    },
    [setUser]
  );

  const logout = React.useCallback(async () => {
    setIsAuthLoading(true);

    try {
      // Optional: call backend logout route if you have one
      // await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore logout API failure, still clear local user
    } finally {
      setUser(null);
      setIsAuthLoading(false);
    }
  }, [setUser]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? "public",
      setUser,
      login,
      logout,
      isLoading: !hasHydrated,
      isAuthLoading,
    }),
    [user, setUser, login, logout, hasHydrated, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ─────────────────────────────────────────────────────────────
   Hook
───────────────────────────────────────────────────────────── */
export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

/* ─────────────────────────────────────────────────────────────
   Export Demo Users
───────────────────────────────────────────────────────────── */
export { DEMO_USERS };
"use client";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type PublicUser = {
  id?: string;
  email: string;
  name?: string;
  image?: string;
};

interface AuthContextType {
  token: string | null;
  user: PublicUser | null;
  login: (token: string, user?: PublicUser) => void; // token flow (email/pwd) or OAuth redirect token
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Boot: prefer localStorage token; otherwise try cookie session (OAuth)
  useEffect(() => {
    const controller = new AbortController();

    const boot = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("userPublic");

        if (storedToken) setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser) as PublicUser);
          } catch {
            localStorage.removeItem("userPublic");
          }
        }

        if (!storedToken && BASE_URL) {
          const r = await fetch(`${BASE_URL}/auth/session`, {
            credentials: "include",
            signal: controller.signal,
          });
          const j = await r.json();
          if (j?.authenticated) {
            // Mark as logged in via cookie session
            setToken("cookie-session");
            const pu: PublicUser = {
              email: j.email || "",
              // if your session returns these, they’ll populate; otherwise they’ll be undefined
              id: j.sub,
              name: j.name,
              image: j.image,
            };
            setUser(pu);
            localStorage.setItem("userPublic", JSON.stringify(pu));
          }
        }
      } catch {
        // ignore boot errors; stay logged out
      } finally {
        setLoading(false);
      }
    };

    boot();
    return () => controller.abort();
  }, [BASE_URL]);

  // Unified login for both flows (email/password or OAuth redirect with ?token=)
  const login = (newToken: string, publicUser?: PublicUser) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    if (publicUser) {
      setUser(publicUser);
      localStorage.setItem("userPublic", JSON.stringify(publicUser));
    } else if (!user) {
      // if not provided, try to fetch session-backed user for OAuth cookie logins
      (async () => {
        try {
          if (!BASE_URL) return;
          const r = await fetch(`${BASE_URL}/auth/session`, { credentials: "include" });
          const j = await r.json();
          if (j?.authenticated) {
            const pu: PublicUser = {
              email: j.email || "",
              id: j.sub,
              name: j.name,
              image: j.image,
            };
            setUser(pu);
            localStorage.setItem("userPublic", JSON.stringify(pu));
          }
        } catch {
          /* ignore */
        }
      })();
    }

    router.push("/chat");
    router.refresh();
  };

  const logout = async () => {
    try {
      if (BASE_URL) {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      }
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userPublic");
    localStorage.removeItem("userProfile");

    setToken(null);
    setUser(null);

    router.push("/auth");
    router.refresh();
  };

  const value = useMemo<AuthContextType>(
    () => ({ token, user, login, logout }),
    [token, user]
  );

  if (loading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

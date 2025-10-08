"use client";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    token: string | null; 
    login: (token: string) => void;
    logout: () => void;
    user: string|null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(true)
    const router = useRouter();

    useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const profileData = localStorage.getItem("userProfile");
    
    if (profileData) {
    try {
      setUser(JSON.parse(profileData));
    } catch (err) {
      console.error("Failed to parse userProfile:", err);
    }
  }
    if (storedToken) setToken(storedToken);
    setLoading(false);
  }, [router]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    router.push("/chat");
    router.refresh();
  };

  const logout = async() => {
    try {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include", // <-- important: sends the cookie
    });
  } catch (e) {
    console.warn("Logout request failed", e);
  }
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    
    setToken(null);
    router.push("/auth");
    router.refresh();
  };

   if (loading) return null;

  return (
    <AuthContext.Provider value={{ token, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
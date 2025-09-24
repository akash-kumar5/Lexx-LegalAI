"use client";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
// adjust this import if your provider file lives elsewhere
import { useLoading } from "../components/Loading";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!API_URL) {
      window.alert("App not configured: backend URL missing.");
      return;
    }

    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    const url = `${API_URL.replace(/\/$/, "")}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    setSubmitting(true);
    showLoading(isLogin ? "Signing you in…" : "Creating account…");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // network-level error
      if (!res.ok) {
        let body: unknown;
        try {
          body = await res.json();
        } catch {
          body = null;
        }
        const errMsg =
          body && typeof body === "object" && "error" in (body as Record<string, unknown>)
            ? String((body as Record<string, unknown>).error)
            : `Request failed with status ${res.status}`;
        window.alert(errMsg);
        return;
      }

      const data = await res.json();
      if (data?.token) {
        // successful login/signup
        login(data.token);
      } else {
        window.alert(data?.error || "Unexpected response from server");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Auth request failed:", message);
      window.alert("Network error. Please try again.");
    } finally {
      hideLoading();
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-r from-zinc-700/20 via-black/40 to-zinc-700/20 text-white"
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs sm:max-w-sm md:max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-5
        bg-white/10 backdrop-blur-md border border-white/30 transition-all duration-300"
      >
        <h2 className="text-3xl font-bold text-center drop-shadow-lg">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70"
        />

        <button
          type="submit"
          disabled={submitting}
          className={`py-2 rounded-lg text-white border border-zinc-500 transition-all duration-200 ${
            submitting ? "bg-zinc-700/60 cursor-not-allowed" : "bg-zinc-800 hover:bg-zinc-700"
          }`}
        >
          {submitting ? (isLogin ? "Signing in…" : "Creating…") : isLogin ? "Login" : "Sign Up"}
        </button>

        <p
          className="text-sm text-center cursor-pointer hover:underline mt-2"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
}

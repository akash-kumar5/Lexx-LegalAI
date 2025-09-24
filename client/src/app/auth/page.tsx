"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
// adjust this import if your provider file lives elsewhere
import { useLoading } from "../components/Loading";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const submitBtnRef = useRef<HTMLButtonElement | null>(null);
  const searchParams = useSearchParams()
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Use your existing login function, which saves token & sets context
      login(token);
      // remove token param and navigate to protected area:
      router.replace("/chat");
    }
  }, [searchParams, login, router]);


  useEffect(() => {
    // clear server error when inputs change
    setServerError(null);
  }, [email, password, isLogin]);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    // simple email regex
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!API_URL) {
      setServerError("App not configured: backend URL missing.");
      return;
    }

    if (!validate()) {
      // focus first invalid field
      if (fieldErrors.email) {
        (
          document.querySelector(
            'input[type="email"]'
          ) as HTMLInputElement | null
        )?.focus();
      } else {
        (
          document.querySelector(
            'input[type="password"]'
          ) as HTMLInputElement | null
        )?.focus();
      }
      return;
    }

    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    const url = `${API_URL.replace(/\/$/, "")}${
      endpoint.startsWith("/") ? "" : "/"
    }${endpoint}`;

    setSubmitting(true);
    setServerError(null);
    showLoading(isLogin ? "Signing you in…" : "Creating account…");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // parse body safely
      let body: any = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      if (!res.ok) {
        const errMsg =
          (body && (body.error || body.message)) ||
          `Request failed with status ${res.status}`;
        setServerError(String(errMsg));
        return;
      }

      if (body?.token) {
        login(body.token);
        // redirect to chat or home
        router.push("/chat");
      } else {
        setServerError(body?.error || "Unexpected response from server");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Auth request failed:", message);
      setServerError("Network error. Please try again.");
    } finally {
      hideLoading();
      setSubmitting(false);
      // return focus to submit button for accessibility
      submitBtnRef.current?.focus();
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-r from-zinc-700/20 via-black/40 to-zinc-700/20 text-white"
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      <form
        onSubmit={handleSubmit}
        aria-live="polite"
        className="w-full max-w-xs sm:max-w-sm md:max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-5
        bg-white/10 backdrop-blur-md border border-white/30 transition-all duration-300"
      >
        <h2 className="text-3xl font-bold text-center drop-shadow-lg">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {serverError && (
          <div
            role="alert"
            className="text-sm text-red-300 bg-red-900/20 p-2 rounded-md"
          >
            {serverError}
          </div>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-200">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70"
          />
          {fieldErrors.email && (
            <span id="email-error" className="text-xs text-red-300">
              {fieldErrors.email}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-200">Password</span>
          <input
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-invalid={!!fieldErrors.password}
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70"
          />
          {fieldErrors.password && (
            <span id="password-error" className="text-xs text-red-300">
              {fieldErrors.password}
            </span>
          )}
        </label>

        <button
          ref={submitBtnRef}
          type="submit"
          disabled={submitting}
          className={`py-2 rounded-lg text-white border border-zinc-500 transition-all duration-200 ${
            submitting
              ? "bg-zinc-700/60 cursor-not-allowed"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
          aria-busy={submitting}
        >
          {submitting
            ? isLogin
              ? "Signing in…"
              : "Creating…"
            : isLogin
            ? "Login"
            : "Sign Up"}
        </button>

        <div className="flex items-center justify-center gap-3 mt-2">
          <p className="text-sm text-center">or</p>
        </div>

        {/* OAuth placeholders - remove or wire real providers */}
        <div className="flex flex-col gap-2">
          <a
            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/login`}
            className="py-2 px-4 rounded-md bg-white/5 hover:bg-white/10 text-sm"
          >
            Continue with Google
          </a>
          <button
            type="button"
            disabled
            className="py-2 rounded-md border border-white/20 bg-white/5 text-sm text-white/80 cursor-not-allowed"
            title="Not enabled yet"
          >
            Continue with GitHub (coming soon)
          </button>
        </div>

        <p
          className="text-sm text-center cursor-pointer hover:underline mt-2"
          onClick={() => {
            setIsLogin(!isLogin);
            setFieldErrors({});
            setServerError(null);
          }}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
}

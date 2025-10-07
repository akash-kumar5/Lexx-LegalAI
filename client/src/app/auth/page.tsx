"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useLoading } from "../components/Loading";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeClosed, LucideEye } from "lucide-react";
import Image from "next/image";

type FieldErrors = {
  email?: string;
  password?: string;
};

type AuthResponse = {
  token?: string;
  error?: string;
  message?: string;
  [key: string]: unknown;
};

function isAuthResponse(obj: unknown): obj is AuthResponse {
  return typeof obj === "object" && obj !== null;
}

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const submitBtnRef = useRef<HTMLButtonElement | null>(null);
  const searchParams = useSearchParams();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token);
      router.replace("/chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, login, router]);

  useEffect(() => {
    setServerError(null);
  }, [email, password, isLogin]);

  useEffect(() => {
    // still support ?token= for email/password flow, but also handle cookie sessions
    const token = searchParams.get("token");
    if (token) {
      login(token);
      router.replace("/chat");
      return;
    }

    // check cookie-based session
    const check = async () => {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
      if (!base) return;
      try {
        const r = await fetch(`${base}/auth/session`, {
          credentials: "include",
        });
        const j = await r.json();
        if (j?.authenticated) {
          // if your app uses localStorage tokens, you can store a sentinel
          // or fetch a bearer token; or just mark logged-in in your AuthContext.
          login("cookie"); // or login with a server-issued short token
          router.replace("/chat");
        }
      } catch {}
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, login, router]);

  const validate = () => {
    const errs: FieldErrors = {};
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
      if (fieldErrors.email) {
        (
          document.querySelector(
            'input[type="email"]'
          ) as HTMLInputElement | null
        )?.focus();
      } else {
        (
          document.querySelector(
            'input[data-field="password"]'
          ) as HTMLInputElement | null
        )?.focus();
      }
      return;
    }

    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    const url = `${API_URL.replace(/\/$/, "")}${endpoint}`;

    setSubmitting(true);
    setServerError(null);
    showLoading(isLogin ? "Signing you in…" : "Creating account…");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let body: unknown = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      if (!res.ok) {
        const errMsg =
          (isAuthResponse(body) &&
            ((body.error as string) || (body.message as string))) ||
          `Request failed with status ${res.status}`;
        setServerError(String(errMsg));
        return;
      }

      if (isAuthResponse(body) && typeof body.token === "string") {
        login(body.token);
        router.push("/chat");
      } else if (isAuthResponse(body) && (body.error || body.message)) {
        setServerError(String(body.error ?? body.message));
      } else {
        setServerError("Unexpected response from server");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Auth request failed:", message);
      setServerError("Network error. Please try again.");
    } finally {
      hideLoading();
      setSubmitting(false);
      submitBtnRef.current?.focus();
    }
  };

  return (
    <div
      className="
        flex flex-col items-center justify-center min-h-screen
        bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200
        dark:from-zinc-900 dark:via-black dark:to-zinc-900
        text-zinc-900 dark:text-zinc-100
      "
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      <form
        onSubmit={handleSubmit}
        aria-live="polite"
        className="
          w-full max-w-xs sm:max-w-sm md:max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-5
          backdrop-blur-md border transition-all duration-300
          bg-zinc-100 border-zinc-300
          dark:bg-stone-900 dark:border-stone-700
        "
      >
        <h2 className="text-3xl font-bold text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {serverError && (
          <div
            role="alert"
            className="
              text-sm p-2 rounded-md
              bg-red-50 text-red-700 border border-red-100
              dark:bg-red-900/40 dark:text-red-300 dark:border-red-700/30
            "
          >
            {serverError}
          </div>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-800 dark:text-zinc-300">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            disabled={submitting}
            className={`
              px-4 py-2 rounded-md border focus:outline-none focus:ring-2
              ${
                fieldErrors.email
                  ? "border-red-300 focus:ring-red-200"
                  : "border-zinc-200 focus:ring-zinc-300"
              }
              bg-white text-zinc-900 placeholder-zinc-500
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500
            `}
          />
          {fieldErrors.email && (
            <span id="email-error" className="text-xs text-red-500">
              {fieldErrors.email}
            </span>
          )}
        </label>

        {/* Password with eye toggle */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Password</span>
          <div className="relative">
            <input
              data-field="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-invalid={!!fieldErrors.password}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
              disabled={submitting}
              className={`
                w-full pr-12 px-4 py-2 rounded-md border focus:outline-none focus:ring-2
                ${
                  fieldErrors.password
                    ? "border-red-300 focus:ring-red-200"
                    : "border-zinc-200 focus:ring-zinc-300"
                }
                bg-white text-zinc-900 placeholder-zinc-400
                dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                px-1 py-1 text-xs rounded-md border
                bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100
                dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-600
                focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600
              "
            >
              {showPassword ? (
                <LucideEye className="h-4 w-4" />
              ) : (
                <EyeClosed className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <span id="password-error" className="text-xs text-red-500">
              {fieldErrors.password}
            </span>
          )}
        </label>

        <button
          ref={submitBtnRef}
          type="submit"
          disabled={submitting}
          className={`
            py-2 rounded-lg text-white border transition-all duration-200
            ${
              submitting
                ? "bg-zinc-500 cursor-not-allowed"
                : "bg-zinc-900 hover:bg-zinc-800"
            }
            dark:${submitting ? "bg-zinc-600" : "bg-zinc-700 hover:bg-zinc-600"}
          `}
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
          <p className="text-sm text-zinc-600 dark:text-zinc-400">or</p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/login`}
            className=" flex gap-3 justify-center
              py-2 px-4 rounded-md text-sm text-center transition
              bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700/80
            "
          >
            <Image
              src="/googled.svg" // place google.svg in /public
              alt="Google logo"
              width={10}
              height={10}
              className="w-5 h-5"
            />
            Continue with Google
          </a>
        </div>

        <p
          className="text-sm text-center cursor-pointer hover:underline mt-2 text-zinc-700 dark:text-zinc-300"
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

"use client";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      login(data.token);
    } else {
      alert(data.error || "Something went wrong");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center  bg-gradient-to-r from-zinc-700/20 via-black/40 to-zinc-700/20 text-white"
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
          className="bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-white border border-zinc-500 transition-all duration-200"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
        <p
          className="text-sm text-center cursor-pointer hover:underline mt-2"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";


export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const {login} = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    const res = await fetch(`http://localhost:8000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      login(data.token)
    } else {
      alert(data.error || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center bg-stone-950 text-white ">
      <form
        onSubmit={handleSubmit}
        className=" mt-[20%] min-w-[65%] p-18 rounded-xl shadow-lg flex flex-col gap-4 w-full max-w-sm bg-gradient-to-r from-zinc-800/20 via-black/50 to-zinc-800/20"
      >
        <h2 className="text-2xl font-bold text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-2 rounded bg-stone-800 border-1 border-stone-700"
        />
        <input
          type="text"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-3 py-2 rounded bg-stone-800 border-1 border-stone-700"
        />
        <button
          type="submit"
          className="bg-zinc-800 hover:bg-zinc-700 py-2 rounded-md text-white border-1 border-zinc-400 max-w-[40%] mx-[30%]"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
        <p
          className="text-sm text-center cursor-pointer hover:underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
}

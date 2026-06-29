"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    // ✅ Validate email format before hitting the server
    if (!emailRegex.test(email.trim())) {
      setMsg("Please enter a valid email address (e.g. you@gmail.com)");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.ok) {
      router.replace("/dashboard");
    } else {
      setMsg("Wrong email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-100 flex items-center justify-center px-6">
      <form onSubmit={handleLogin} className="w-full max-w-md -mt-16 space-y-4">
        <div className="flex justify-center mb-2">
          <img src="/logo.png" alt="SkillSage" className="w-22 h-22 rounded-2xl shadow-lg" />
        </div>

        <h1 className="text-4xl font-bold text-center text-gray-800 whitespace-nowrap">
          Welcome back to <span className="text-blue-600">SkillSage</span>
        </h1>
        <p className="text-center text-gray-500 mb-6">Login to continue your journey</p>

        <input
          type="text"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-xl border bg-white"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-xl border bg-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-semibold disabled:opacity-60"
        >
          {loading ? "Checking..." : "Login"}
        </button>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* ── Google button ── */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 p-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        {msg && <p className="text-red-500 text-center text-sm">{msg}</p>}

        <p className="text-center text-sm text-gray-600">
          Want to create an account?{" "}
          <Link href="/signup" className="text-blue-600 font-semibold">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

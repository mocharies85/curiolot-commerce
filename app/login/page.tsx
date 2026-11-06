"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Tampilkan pesan error jika belum aktivasi email atau password salah (Gambar 5)
        setErrorMsg(data.error || "Invalid username/email or password.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="max-w-md w-full bg-[#1E293B] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Icon */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-emerald-500/25">
            C
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            Log in to Curiolot
          </h1>
          <p className="text-xs text-slate-400">
            Manage your digital products, store settings, and payouts.
          </p>
        </div>

        {/* Notifikasi Error (Sesuai Kotak Merah Gambar 5) */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username or Email address"
                className="w-full pl-11 pr-4 py-3 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-11 py-3 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            <span>{isSubmitting ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account yet?{" "}
          <Link href="/register" className="text-emerald-400 hover:underline font-bold">
            Create store
          </Link>
        </p>

      </div>
    </div>
  );
}
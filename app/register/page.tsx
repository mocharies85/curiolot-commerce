"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  MailCheck, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State setelah berhasil register untuk memunculkan modal "Check Your Email" (Gambar 3)
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!agreedToTerms) {
      setErrorMsg("You must agree to the Terms of Service and Privacy Policy to proceed.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          email: email.trim(),
          password,
          agreedToTerms: true
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Registration failed. Username or email may already be registered.");
      } else {
        setIsRegistered(true);
      }
    } catch (err) {
      setErrorMsg("Connection error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TAMPILAN 1: CHECK YOUR EMAIL SCREEN (Sesuai Gambar 3) */}
      {isRegistered ? (
        <div className="max-w-md w-full bg-[#1E293B] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <MailCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Check Your Email</h2>
            <p className="text-xs text-slate-400">
              We have sent an activation link to:
            </p>
            <p className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 py-1.5 px-3 rounded-xl inline-block">
              {email}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left space-y-2 text-xs text-slate-300">
            <p className="font-bold text-slate-200">Next steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
              <li>Open your email inbox (or spam folder).</li>
              <li>Click the <strong>Activate My Account</strong> button in the email.</li>
              <li>Log in to access your digital storefront dashboard.</li>
            </ol>
          </div>

          <Link
            href="/login"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <span>Go to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (

        /* TAMPILAN 2: FORM REGISTRASI (Sesuai Gambar 2) */
        <div className="max-w-md w-full bg-[#1E293B] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
          
          {/* Logo Brand */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-emerald-500/25">
              C
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              Create Your Creator Store
            </h1>
            <p className="text-xs text-slate-400">
              Launch your independent digital store with 0% escrow fee.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Username Input */}
            <div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="Username (e.g. aries)"
                  className="w-full pl-11 pr-4 py-3 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition font-mono"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-11 pr-4 py-3 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (minimum 6 characters)"
                  className="w-full pl-11 pr-4 py-3 bg-[#0F172A] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* CENTANG PERSETUJUAN HUKUM (Sesuai Gambar 2 yang dilingkari merah) */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400 leading-snug select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-[#0F172A] text-emerald-500 focus:ring-emerald-500 shrink-0"
                />
                <span>
                  I have read and agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-emerald-400 hover:underline font-semibold">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-emerald-400 hover:underline font-semibold">
                    Privacy Policy
                  </Link>.
                </span>
              </label>
            </div>

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              <span>{isSubmitting ? "Creating Account..." : "Get Started for Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          <p className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 hover:underline font-bold">
              Log in
            </Link>
          </p>

        </div>
      )}
    </div>
  );
}
"use client";

import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Database, EyeOff } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Curiolot</span>
          </Link>
          <span className="text-xs font-mono text-slate-400">Privacy Standard</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8 text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Data Privacy & Security
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-3">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compliant with international privacy frameworks (GDPR, CCPA).
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-8 text-xs leading-relaxed text-slate-700">
          
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>1. Information We Collect</span>
            </h2>
            <p>
              We collect creator account credentials (email address, username, password hashes) necessary to administer storefronts. For buyers, checkout information is handled exclusively by off-site payment gateways (PayPal, Stripe, Lemon Squeezy, Paddle). Curiolot never stores credit card details or bank passwords on its servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              <span>2. No Selling of Personal Information</span>
            </h2>
            <p>
              Curiolot does not monetize, rent, or sell user or customer personal data to third-party data brokers or advertisement networks. Information is utilized strictly to provide storefront functionality and digital file delivery.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>3. Cloud Storage & Encryption</span>
            </h2>
            <p>
              Uploaded creator archives are encrypted in isolated Cloudflare R2 object storage containers. Download links generated upon verified orders expire according to creator configurations to minimize unauthorized scraping.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
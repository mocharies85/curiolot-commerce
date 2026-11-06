"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert, CheckCircle, Scale, FileText } from "lucide-react";

export default function TermsOfServicePage() {
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
          <span className="text-xs font-mono text-slate-400">Legal Agreement</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8 text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Legal Disclaimer & Terms
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-3">
            Terms of Service & Platform Limitations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Last updated: November 2026. Effective immediately upon account registration or checkout.
          </p>
        </div>

        {/* PRIMARY DISCLAIMER BOX */}
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-950 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Strict Intermediary Notice & Limitation of Liability</span>
          </div>
          <p className="text-xs leading-relaxed text-amber-900/90">
            Curiolot operates solely as a technical facilitator, storefront builder, and digital marketplace venue. Curiolot does not manufacture, verify, hold intellectual property titles, or act as the legal merchant for assets listed by creators. All sales agreements, warranties, file deliveries, and commercial rights are executed strictly between the independent Creator and the Buyer.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-8 text-xs leading-relaxed text-slate-700">
          
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>1. Marketplace Role & Zero Escrow Model</span>
            </h2>
            <p>
              Curiolot provides web infrastructure enabling creators to host storefronts and link third-party checkout gateways (PayPal, Stripe, Lemon Squeezy, Paddle, Ko-fi). Curiolot holds zero buyer funds in escrow and retains 0% transaction commissions. All financial transactions take place exclusively on the respective payment provider's servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>2. Creator Responsibility & Intellectual Property Warranty</span>
            </h2>
            <p>
              By uploading digital files, vectors, graphics, templates, or e-books, Creators represent and warrant that they possess 100% legal ownership or valid commercial licenses for every uploaded item. Creators agree to indemnify and hold harmless Curiolot, its founders, and operators against any claims, losses, copyright infringements, or damages arising from their listings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>3. Disputes, Refunds & Non-Delivery</span>
            </h2>
            <p>
              Because customer payments are routed directly to the Creator's personal or business payment gateway, Curiolot cannot issue refunds, cancel subscriptions, or reverse transactions. In the event of defective files, non-delivery, or license disputes, buyers must resolve claims directly with the Creator through the designated payment gateway dispute resolution center.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>4. DMCA & Takedown Enforcement</span>
            </h2>
            <p>
              Curiolot respects intellectual property rights. If copyright owners identify infringing material hosted on any subdomain, they may submit a verified takedown notice to legal@curiolot.com. Confirmed infringing assets or abusive accounts will be deactivated immediately without prior notice.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingBag,
  Percent,
  CheckCircle2,
  Save,
  ShieldCheck,
  Zap,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  X,
  Settings,
} from "lucide-react";
import type { PayoutProvider } from "@/lib/storeSettings";

export default function EarningsPage() {
  const [username, setUsername] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [provider, setProvider] = useState<PayoutProvider>("paypal");

  // Gateway form inputs (kosong sampai data akun yang login dimuat)
  const [paypalHandle, setPaypalHandle] = useState("");
  const [stripeUrl, setStripeUrl] = useState("");
  const [lemonSqueezyUrl, setLemonSqueezyUrl] = useState("");
  const [paddleUrl, setPaddleUrl] = useState("");
  const [kofiUrl, setKofiUrl] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  // Modal Guide State
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);

  // Ambil username dinamis dari sesi login aktif
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("curiolot_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const resolvedUsername =
            parsed.username ||
            (parsed.email ? parsed.email.split("@")[0].toLowerCase() : "vanth");
          setUsername(resolvedUsername);
        } catch (e) {
          setUsername("vanth");
        }
      } else {
        setUsername("vanth");
      }
    }
  }, []);

  const instantSuccessUrl = username
    ? `https://store.curiolot.com/${username}/success`
    : "https://store.curiolot.com/.../success";

  // Muat pengaturan payout sesuai username yang sedang login
  useEffect(() => {
    if (!username) return;

    fetch(`/api/settings?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data) {
          if (data.payoutProvider) setProvider(data.payoutProvider);
          if (data.payoutPaypalHandle !== undefined) {
            setPaypalHandle(data.payoutPaypalHandle || "");
          }
          if (data.payoutStripeUrl !== undefined) {
            setStripeUrl(data.payoutStripeUrl || "");
          }
          if (data.payoutLemonSqueezyUrl !== undefined) {
            setLemonSqueezyUrl(data.payoutLemonSqueezyUrl || "");
          }
          if (data.payoutPaddleUrl !== undefined) {
            setPaddleUrl(data.payoutPaddleUrl || "");
          }
          if (data.payoutKofiUrl !== undefined) {
            setKofiUrl(data.payoutKofiUrl || "");
          }
          if (data.payoutCustomUrl !== undefined) {
            setCustomUrl(data.payoutCustomUrl || "");
          }
        }
      });
  }, [username]);

  const handleCopySuccessUrl = () => {
    if (!username) return;
    navigator.clipboard.writeText(instantSuccessUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyModalUrl = () => {
    if (!username) return;
    navigator.clipboard.writeText(instantSuccessUrl);
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2000);
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        payoutProvider: provider,
        payoutPaypalHandle: paypalHandle
          .replace(/^https?:\/\/paypal\.me\//i, "")
          .replace(/\/.*$/, ""),
        payoutStripeUrl: stripeUrl,
        payoutLemonSqueezyUrl: lemonSqueezyUrl,
        payoutPaddleUrl: paddleUrl,
        payoutKofiUrl: kofiUrl,
        payoutCustomUrl: customUrl,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const GATEWAY_OPTIONS: {
    id: PayoutProvider;
    name: string;
    region: string;
    desc: string;
  }[] = [
    {
      id: "paypal",
      name: "PayPal",
      region: "Global (200+ Countries)",
      desc: "Instant P2P payments via Personal handle or automated checkout via Business.",
    },
    {
      id: "stripe",
      name: "Stripe Checkout",
      region: "USA, Europe, Global",
      desc: "Accept Apple Pay, Google Pay, credit/debit cards, and iDEAL with auto-redirect.",
    },
    {
      id: "lemonsqueezy",
      name: "Lemon Squeezy",
      region: "Global Merchant of Record",
      desc: "Automates global sales tax, EU VAT, and localized checkout currencies.",
    },
    {
      id: "paddle",
      name: "Paddle",
      region: "Global Software & Digital",
      desc: "Handles global tax compliance, wire payouts, and multi-currency billing.",
    },
    {
      id: "kofi",
      name: "Ko-fi / Buy Me a Coffee",
      region: "Asia, Worldwide Creators",
      desc: "Direct creator tipping and digital shop payment links.",
    },
    {
      id: "custom",
      name: "Custom / Regional Gateway",
      region: "India, Africa, LatAm, Asia",
      desc: "Use your own custom checkout link (Razorpay, Paystack, local bank gateway).",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payouts & Direct Sales
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Zero-escrow payout: 100% of customer checkout payments go straight to
            your selected provider with no holding period.
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
          <Zap className="w-3.5 h-3.5 fill-emerald-600" />
          <span>0% Platform Commission</span>
        </span>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Estimated Revenue
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">$0.00</p>
          <p className="text-[10px] text-slate-400 mt-1">
            100% direct creator settlement
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Direct Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">0</p>
          <p className="text-[10px] text-slate-400 mt-1">
            Total completed checkout clicks
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Platform Cut
            </span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-600">0%</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">
            Keep 100% of product revenue
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Settlement Speed
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">Instant</p>
          <p className="text-[10px] text-slate-400 mt-1">
            No platform holding period
          </p>
        </div>
      </div>

      {/* Main Gateway Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Global Payout Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the primary gateway accepted in your region. All product
              purchase buttons will route directly to this provider.
            </p>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>

        {saved && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Payout provider settings updated successfully! All products now use
              this gateway.
            </span>
          </div>
        )}

        <form onSubmit={handleSavePayout} className="space-y-6">
          {/* 6 Gateway Selection Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {GATEWAY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setProvider(opt.id)}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  provider === opt.id
                    ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900/10 shadow-xs"
                    : "border-slate-200 hover:bg-slate-50/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-slate-900">
                      {opt.name}
                    </p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                      {opt.region}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold mt-3 inline-flex items-center gap-1 ${
                    provider === opt.id
                      ? "text-emerald-700 font-extrabold"
                      : "text-slate-400"
                  }`}
                >
                  {provider === opt.id ? "● Active Gateway" : "Click to select"}
                </span>
              </button>
            ))}
          </div>

          {/* Dynamic Input Based on Selected Gateway */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
            {provider === "paypal" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your PayPal.Me Username *
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-slate-900 transition">
                    <span className="pl-4 text-xs text-slate-400 font-mono">
                      https://paypal.me/
                    </span>
                    <input
                      type="text"
                      required
                      value={paypalHandle}
                      onChange={(e) => setPaypalHandle(e.target.value)}
                      placeholder="yourhandle"
                      className="w-full px-2 py-3 bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* IMPORTANT NOTICE: Personal vs Business PayPal */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-950 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Important Notice on Instant Delivery vs Manual Delivery:
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900/90 pl-5">
                    • <strong>Personal Account:</strong> Customers transfer funds
                    directly to you, but PayPal Personal does not support
                    automated redirect. You must email the download link to the
                    buyer manually upon receipt.
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-900/90 pl-5">
                    •{" "}
                    <strong>
                      Business Account (Recommended for Automation):
                    </strong>{" "}
                    Free to upgrade in PayPal. Enables <em>Auto Return</em>,
                    allowing customers to download files immediately without
                    waiting for you.
                  </p>
                </div>
              </div>
            )}

            {provider === "stripe" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Default Stripe Payment Link URL *
                </label>
                <input
                  type="url"
                  required
                  value={stripeUrl}
                  onChange={(e) => setStripeUrl(e.target.value)}
                  placeholder="https://buy.stripe.com/..."
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900 transition font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Paste your Stripe Payment Link created from your Stripe
                  Dashboard.
                </p>
              </div>
            )}

            {provider === "lemonsqueezy" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lemon Squeezy Store / Checkout URL *
                </label>
                <input
                  type="url"
                  required
                  value={lemonSqueezyUrl}
                  onChange={(e) => setLemonSqueezyUrl(e.target.value)}
                  placeholder="https://yourbrand.lemonsqueezy.com/buy/..."
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900 transition font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Lemon Squeezy acts as your Merchant of Record and
                  automatically handles European VAT and US state sales taxes.
                </p>
              </div>
            )}

            {provider === "paddle" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Paddle Checkout Link / Pay URL *
                </label>
                <input
                  type="url"
                  required
                  value={paddleUrl}
                  onChange={(e) => setPaddleUrl(e.target.value)}
                  placeholder="https://buy.paddle.com/..."
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900 transition font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Direct billing checkout link powered by Paddle MoR.
                </p>
              </div>
            )}

            {provider === "kofi" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ko-fi Shop / Page URL *
                </label>
                <input
                  type="url"
                  required
                  value={kofiUrl}
                  onChange={(e) => setKofiUrl(e.target.value)}
                  placeholder="https://ko-fi.com/yourhandle/shop"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900 transition font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Connects seamlessly to your PayPal Personal account while
                  providing automated post-purchase redirects.
                </p>
              </div>
            )}

            {provider === "custom" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Custom Regional Checkout Link (Razorpay, Paystack,
                  AliPay/WeChat link, etc.) *
                </label>
                <input
                  type="url"
                  required
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://rzp.io/l/... or your local payment link"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900 transition font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Works with any custom payment URL supported in your country
                  (India, Nigeria, Brazil, China, etc.).
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>Save Global Gateway Configuration</span>
          </button>
        </form>
      </div>

      {/* STEP-BY-STEP SETUP GUIDE: CLEAR & EASY TO UNDERSTAND */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-800">
        {/* Guide Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>How Customers Receive Their Purchased Files</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Understand how checkout settlement and instant delivery work on
                your store.
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Copy Personal Success Redirect URL */}
        <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Your Personal Order Confirmation & Download URL</span>
            </label>
            <span className="text-[10px] text-slate-400">
              For automated gateways
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-emerald-400 font-bold truncate pr-3">
              {instantSuccessUrl}
            </span>
            <button
              type="button"
              onClick={handleCopySuccessUrl}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                copiedUrl
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-900 hover:bg-slate-200"
              }`}
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Paste this URL into your payment provider's redirect field. When a
            purchase succeeds, buyers land on this page to download their files.
          </p>
        </div>

        {/* Clear Step-by-Step Instructions Per Gateway */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* PayPal Card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="font-extrabold text-white text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>PayPal Account Guide</span>
              </p>
              <div className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                <p>
                  <strong>1. If using PayPal Personal:</strong> You do not need
                  any setup. Customers pay your handle directly, and you email
                  them the product link manually.
                </p>
                <p>
                  <strong>2. If using PayPal Business (Auto):</strong> Go to{" "}
                  <em>
                    Account Settings → Website Payments → Website Preferences
                  </em>
                  . Turn <strong>Auto Return</strong> ON and paste your Download
                  URL.
                </p>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
              <span className="text-[10px] text-sky-400 font-semibold">
                Upgrade to Business is free inside PayPal.
              </span>
              <button
                type="button"
                onClick={() => setShowPayPalModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-[11px] font-bold transition active:scale-95 cursor-pointer shrink-0"
                title="Click to view full PayPal Business configuration guide"
              >
                <span>Full Guide</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Stripe Card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="font-extrabold text-white text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Stripe Payment Links</span>
              </p>
              <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                <li>
                  Open your <strong>Stripe Dashboard → Payment Links</strong>.
                </li>
                <li>
                  Edit your product link and click <strong>After payment</strong>
                  .
                </li>
                <li>
                  Select <strong>Don't show confirmation page</strong>.
                </li>
                <li>
                  Choose <strong>Redirect customers to your website</strong> and
                  paste your Download URL.
                </li>
              </ol>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold pt-2 border-t border-slate-800/60">
              ✓ 100% automated instant redirect.
            </p>
          </div>

          {/* Lemon Squeezy & Paddle Card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="font-extrabold text-white text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Lemon Squeezy & Paddle</span>
              </p>
              <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                <li>Open your product edit page in your dashboard.</li>
                <li>
                  Find <strong>Confirmation Page URL</strong> or{" "}
                  <strong>Redirect URL</strong>.
                </li>
                <li>Paste your Download URL and save changes.</li>
              </ol>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold pt-2 border-t border-slate-800/60">
              ✓ Automated tax filing + instant file download.
            </p>
          </div>

          {/* Ko-fi Card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="font-extrabold text-white text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Ko-fi Shop Settings</span>
              </p>
              <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                <li>
                  Go to your <strong>Ko-fi Shop Settings</strong>.
                </li>
                <li>
                  Under <strong>Post-Purchase Redirect</strong>, enable custom
                  redirect.
                </li>
                <li>
                  Paste your Download URL so supporters download files
                  instantly.
                </li>
              </ol>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold pt-2 border-t border-slate-800/60">
              ✓ Works seamlessly with Personal PayPal accounts.
            </p>
          </div>

          {/* Custom & Regional Gateways Card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5 flex flex-col justify-between md:col-span-2">
            <div className="space-y-2">
              <p className="font-extrabold text-white text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  Custom / Regional Gateway (Razorpay, Paystack, etc.)
                </span>
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Most regional checkout gateways allow you to define a{" "}
                <strong>Success Callback URL</strong> or{" "}
                <strong>Redirect URL</strong> in your payment link dashboard.
                Paste your Download URL there. Your international customers will
                be redirected back to Curiolot immediately upon payment
                confirmation.
              </p>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold pt-2 border-t border-slate-800/60">
              ✓ Universal compatibility with global fintech providers.
            </p>
          </div>
        </div>
      </div>

      {/* DETAILED PAYPAL BUSINESS SETUP POPUP MODAL */}
      {showPayPalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-left">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    PayPal Business Automation Guide
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Step-by-step setup for auto-return & card guest checkout
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayPalModal(false)}
                className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
              {/* STEP 1: Copy Order Confirmation URL */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                      1
                    </span>
                    Your Personal Order Confirmation & Download URL
                  </span>
                  <span className="text-[10px] text-slate-500">Auto-filled</span>
                </div>

                <p className="text-slate-400 text-[11px]">
                  Copy this exact confirmation link. You will paste it into your
                  PayPal Website Preferences in Step 3.
                </p>

                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-emerald-400 text-xs overflow-x-auto">
                    {instantSuccessUrl}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyModalUrl}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                  >
                    {modalCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>{modalCopied ? "Copied!" : "Copy URL"}</span>
                  </button>
                </div>
              </div>

              {/* STEP 2: Navigate in PayPal */}
              <div className="space-y-2">
                <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    2
                  </span>
                  Open Website Preferences in PayPal
                </span>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 text-slate-300">
                  <p>
                    1. Log in to your{" "}
                    <a
                      href="https://www.paypal.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 font-semibold underline inline-flex items-center gap-0.5"
                    >
                      PayPal Business Account <ExternalLink className="w-3 h-3" />
                    </a>
                    .
                  </p>
                  <p>
                    2. Click the <strong>Settings (Gear Icon)</strong> in the
                    top-right corner → <strong>Account Settings</strong>.
                  </p>
                  <p>
                    3. In the left sidebar under{" "}
                    <strong>PRODUCTS & SERVICES</strong>, select{" "}
                    <strong>Website payments</strong>.
                  </p>
                  <p>
                    4. Next to <strong>Website preferences</strong>, click the{" "}
                    <strong>Update</strong> button.
                  </p>
                </div>
              </div>

              {/* STEP 3: Apply Configurations */}
              <div className="space-y-3">
                <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    3
                  </span>
                  Required Configuration Settings
                </span>

                <div className="space-y-3">
                  {/* Auto Return */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-white text-xs">
                        Auto Return for Website Payments:{" "}
                        <span className="text-emerald-400">TURN ON</span>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Paste your copied Download URL into the{" "}
                        <strong>Return URL</strong> field and click{" "}
                        <strong>Save</strong>. Buyers are redirected back within
                        5 seconds of purchase.
                      </p>
                    </div>
                  </div>

                  {/* PDT */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-white text-xs">
                        Payment Data Transfer (PDT):{" "}
                        <span className="text-emerald-400">TURN ON</span>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Enables secure transmission of transaction confirmation
                        tokens back to your store.
                      </p>
                    </div>
                  </div>

                  {/* Encrypted Payments Warning */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-amber-200 text-xs">
                        Block Non-Encrypted Website Payments:{" "}
                        <span className="text-amber-400 underline">
                          TURN OFF
                        </span>
                      </p>
                      <p className="text-amber-200/80 text-[11px]">
                        <strong>CRITICAL:</strong> If this is kept Active,
                        PayPal blocks checkout clicks from external stores. Keep
                        it <strong>OFF (Nonaktif)</strong>.
                      </p>
                    </div>
                  </div>

                  {/* PayPal Optional */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-white text-xs">
                        PayPal Account Optional:{" "}
                        <span className="text-sky-400">TURN ON</span>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Enables Guest Checkout: international buyers can pay
                        directly using a Debit/Credit Card without creating a
                        PayPal account.
                      </p>
                    </div>
                  </div>

                  {/* Phone & Express Checkout */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-white text-xs">
                        Contact Phone & Express Checkout:{" "}
                        <span className="text-slate-400">TURN OFF</span>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Removes friction for buyers by skipping unnecessary
                        phone and bank transfer prompts during checkout.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 4: Store Handle */}
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 space-y-2">
                <span className="font-bold text-sky-300 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    4
                  </span>
                  Final Step: Save Global Gateway
                </span>
                <p className="text-sky-200/80 text-[11px]">
                  Return to this page, ensure your clean PayPal handle is saved
                  in the <strong>Your PayPal.Me Username</strong> field above,
                  and click <strong>Save Global Gateway Configuration</strong>.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Settings take effect immediately inside PayPal.
              </span>
              <button
                type="button"
                onClick={() => setShowPayPalModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer"
              >
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
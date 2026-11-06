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
  Globe2, 
  CreditCard, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import type { StoreSettings, PayoutProvider } from "@/lib/storeSettings";

export default function EarningsPage() {
  const username = "aries";
  const [saved, setSaved] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [provider, setProvider] = useState<PayoutProvider>("paypal");

  // Gateway form inputs
  const [paypalHandle, setPaypalHandle] = useState("curiolot");
  const [stripeUrl, setStripeUrl] = useState("");
  const [lemonSqueezyUrl, setLemonSqueezyUrl] = useState("");
  const [paddleUrl, setPaddleUrl] = useState("");
  const [kofiUrl, setKofiUrl] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  const instantSuccessUrl = `https://store.curiolot.com/${username}/success`;

  useEffect(() => {
    fetch(`/api/settings?username=${username}`)
      .then((res) => res.json())
      .then((data: StoreSettings) => {
        if (data) {
          if (data.payoutProvider) setProvider(data.payoutProvider);
          if (data.payoutPaypalHandle) setPaypalHandle(data.payoutPaypalHandle);
          if (data.payoutStripeUrl) setStripeUrl(data.payoutStripeUrl);
          if (data.payoutLemonSqueezyUrl) setLemonSqueezyUrl(data.payoutLemonSqueezyUrl);
          if (data.payoutPaddleUrl) setPaddleUrl(data.payoutPaddleUrl);
          if (data.payoutKofiUrl) setKofiUrl(data.payoutKofiUrl);
          if (data.payoutCustomUrl) setCustomUrl(data.payoutCustomUrl);
        }
      });
  }, [username]);

  const handleCopySuccessUrl = () => {
    navigator.clipboard.writeText(instantSuccessUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        payoutProvider: provider,
        payoutPaypalHandle: paypalHandle.replace(/^https?:\/\/paypal\.me\//i, "").replace(/\/.*$/, ""),
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

  const GATEWAY_OPTIONS: { id: PayoutProvider; name: string; region: string; desc: string }[] = [
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payouts & Direct Sales</h1>
          <p className="text-xs text-slate-500 mt-1">
            Zero-escrow payout: 100% of customer checkout payments go straight to your selected provider with no holding period.
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
            <span className="text-[11px] font-bold uppercase tracking-wider">Estimated Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">$0.00</p>
          <p className="text-[10px] text-slate-400 mt-1">100% direct creator settlement</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Direct Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">0</p>
          <p className="text-[10px] text-slate-400 mt-1">Total completed checkout clicks</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Platform Cut</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-600">0%</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">Keep 100% of product revenue</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Settlement Speed</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">Instant</p>
          <p className="text-[10px] text-slate-400 mt-1">No platform holding period</p>
        </div>
      </div>

      {/* Main Gateway Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Global Payout Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the primary gateway accepted in your region. All product purchase buttons will route directly to this provider.
            </p>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>

        {saved && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Payout provider settings updated successfully! All products now use this gateway.</span>
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
                    <p className="text-xs font-extrabold text-slate-900">{opt.name}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                      {opt.region}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{opt.desc}</p>
                </div>
                
                <span className={`text-[10px] font-bold mt-3 inline-flex items-center gap-1 ${
                  provider === opt.id ? "text-emerald-700 font-extrabold" : "text-slate-400"
                }`}>
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
                    <span className="pl-4 text-xs text-slate-400 font-mono">https://paypal.me/</span>
                    <input
                      type="text"
                      required
                      value={paypalHandle}
                      onChange={(e) => setPaypalHandle(e.target.value)}
                      placeholder="curiolot"
                      className="w-full px-2 py-3 bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* IMPORTANT NOTICE: Personal vs Business PayPal */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-950 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Important Notice on Instant Delivery vs Manual Delivery:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900/90 pl-5">
                    • <strong>Personal Account:</strong> Customers transfer funds directly to you, but PayPal Personal does not support automated redirect. You must email the download link to the buyer manually upon receipt.
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-900/90 pl-5">
                    • <strong>Business Account (Recommended for Automation):</strong> Free to upgrade in PayPal. Enables <em>Auto Return</em>, allowing customers to download files immediately without waiting for you.
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
                  Paste your Stripe Payment Link created from your Stripe Dashboard.
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
                  Lemon Squeezy acts as your Merchant of Record and automatically handles European VAT and US state sales taxes.
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
                  Connects seamlessly to your PayPal Personal account while providing automated post-purchase redirects.
                </p>
              </div>
            )}

            {provider === "custom" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Custom Regional Checkout Link (Razorpay, Paystack, AliPay/WeChat link, etc.) *
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
                  Works with any custom payment URL supported in your country (India, Nigeria, Brazil, China, etc.).
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
                Understand how checkout settlement and instant delivery work on your store.
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
            <span className="text-[10px] text-slate-400">For automated gateways</span>
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
            Paste this URL into your payment provider's redirect field. When a purchase succeeds, buyers land on this page to download their files.
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
                  <strong>1. If using PayPal Personal:</strong> You do not need any setup. Customers pay your handle directly, and you email them the product link manually.
                </p>
                <p>
                  <strong>2. If using PayPal Business (Auto):</strong> Go to <em>Account Settings → Website Payments → Website Preferences</em>. Turn <strong>Auto Return</strong> ON and paste your Download URL.
                </p>
              </div>
            </div>
            <p className="text-[10px] text-sky-400 font-semibold pt-2 border-t border-slate-800/60">
              Upgrade to Business is free inside PayPal.
            </p>
          </div>

          {/* Stripe Card */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="font-extrabold text-white text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Stripe Payment Links</span>
              </p>
              <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                <li>Open your <strong>Stripe Dashboard → Payment Links</strong>.</li>
                <li>Edit your product link and click <strong>After payment</strong>.</li>
                <li>Select <strong>Don't show confirmation page</strong>.</li>
                <li>Choose <strong>Redirect customers to your website</strong> and paste your Download URL.</li>
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
                <li>Find <strong>Confirmation Page URL</strong> or <strong>Redirect URL</strong>.</li>
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
                <li>Go to your <strong>Ko-fi Shop Settings</strong>.</li>
                <li>Under <strong>Post-Purchase Redirect</strong>, enable custom redirect.</li>
                <li>Paste your Download URL so supporters download files instantly.</li>
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
                <span>Custom / Regional Gateway (Razorpay, Paystack, etc.)</span>
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Most regional checkout gateways allow you to define a <strong>Success Callback URL</strong> or <strong>Redirect URL</strong> in your payment link dashboard. Paste your Download URL there. Your international customers will be redirected back to Curiolot immediately upon payment confirmation.
              </p>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold pt-2 border-t border-slate-800/60">
              ✓ Universal compatibility with global fintech providers.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
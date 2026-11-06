"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Image as ImageIcon, 
  CheckCircle2, 
  Save, 
  Eye, 
  EyeOff, 
  UploadCloud, 
  Layers, 
  Tag, 
  ExternalLink, 
  Trash2 
} from "lucide-react";
import type { StoreSettings } from "@/lib/storeSettings";

export default function StoreSettingsPage() {
  const username = "aries";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<StoreSettings>({
    username: "aries",
    storeTitle: "Aries Store",
    logoUrl: "",
    payoutProvider: "paypal",
    payoutPaypalHandle: "curiolot",
    payoutStripeUrl: "",
    totalEarnings: 0,
    pendingEarnings: 0,
    showHero: true,
    heroBadge: "Featured Release",
    showHeroBadge: false,
    heroTitle: "Premium Vectors & 3D Design Assets",
    showHeroTitle: false,
    heroDescription: "Supercharge your creative workflow with production-ready assets.",
    showHeroDescription: false,
    heroImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
    showBundle: false,
    bundleBadge: "Bundle Offer",
    bundleTitle: "Save Up to 60% on All Graphic Bundles",
    bundleDescription: "Unlock instant access to the complete vector collection and 3D asset library in one discounted package.",
    bundleButtonText: "Get Complete Bundle",
    bundleUrl: "https://buy.stripe.com/test_demo",
    showPromoStrip: false,
    promoBadge: "Limited Time Offer",
    promoTitle: "Get 30% Off Your First Order",
    promoDescription: "Apply this coupon code at checkout to claim your launch discount.",
    promoCode: "CURIOLOT30",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/settings?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.username) {
          setSettings((prev) => ({
            ...prev,
            ...data,
            showHeroBadge: data.showHeroBadge !== undefined ? data.showHeroBadge : false,
            showHeroTitle: data.showHeroTitle !== undefined ? data.showHeroTitle : false,
            showHeroDescription: data.showHeroDescription !== undefined ? data.showHeroDescription : false,
          }));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const getInitials = (title: string) => {
    if (!title) return username.slice(0, 2).toUpperCase();
    const words = title.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return title.slice(0, 2).toUpperCase();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo file size exceeds 2 MB. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setSettings((prev) => ({ ...prev, logoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5 MB. Please upload a smaller image.");
      return;
    }

    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setSettings((prev) => ({ ...prev, heroImageUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasAnyHeroText = 
    (settings.showHeroBadge && Boolean(settings.heroBadge)) ||
    (settings.showHeroTitle && Boolean(settings.heroTitle)) ||
    (settings.showHeroDescription && Boolean(settings.heroDescription));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 font-sans antialiased">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Link>
          <span className="text-xs text-slate-400 font-medium">Store Customization</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Storefront Appearance & Branding</h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize your store identity, custom logo, hero showcase, upsell bundle, and promo coupon.
          </p>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Settings saved successfully! Changes are now live on your public store.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Store Identity & Custom Logo */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Store Identity & Logo</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Store Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={settings.storeTitle}
                  onChange={(e) => setSettings({ ...settings, storeTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Store Logo / Brand Avatar
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50">
                  <div className="relative shrink-0">
                    {settings.logoUrl ? (
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex items-center justify-center p-1">
                        <img
                          src={settings.logoUrl}
                          alt="Store Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xl shadow-md tracking-wider">
                        {getInitials(settings.storeTitle)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition active:scale-95 shadow-xs cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{settings.logoUrl ? "Replace Logo" : "Upload Custom Logo"}</span>
                      </button>

                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, logoUrl: "" })}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition cursor-pointer"
                          title="Reset to default initials"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Reset to Initials</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Recommended: <strong>1:1 Square (512 × 512 px)</strong> • PNG, JPG, WEBP, or SVG up to 2 MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Hero Banner Configuration */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Hero Showcase Banner</h2>
                <p className="text-xs text-slate-500 mt-0.5">Top billboard banner highlighting your creative assets.</p>
              </div>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, showHero: !settings.showHero })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                  settings.showHero
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {settings.showHero ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{settings.showHero ? "Banner Active" : "Banner Hidden"}</span>
              </button>
            </div>

            {settings.showHero && (
              <div className="space-y-5">
                
                {/* 1. Badge Tag Text */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Badge Tag Text
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {settings.showHeroBadge ? "Visible on banner" : "Hidden"}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Featured Release, Summer Sale 2026"
                      value={settings.heroBadge}
                      onChange={(e) => setSettings({ ...settings, heroBadge: e.target.value })}
                      className={`w-full pl-4 pr-12 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition ${
                        !settings.showHeroBadge ? "opacity-50 line-through text-slate-400" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, showHeroBadge: !settings.showHeroBadge })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-800 transition cursor-pointer rounded-lg hover:bg-slate-200/60"
                      title={settings.showHeroBadge ? "Hide badge tag on banner" : "Show badge tag on banner"}
                    >
                      {settings.showHeroBadge ? (
                        <Eye className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Main Headline */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Main Headline *
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {settings.showHeroTitle ? "Visible on banner" : "Hidden"}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required={settings.showHeroTitle}
                      placeholder="e.g. Premium Vectors & 3D Design Assets"
                      value={settings.heroTitle}
                      onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                      className={`w-full pl-4 pr-12 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition font-semibold ${
                        !settings.showHeroTitle ? "opacity-50 line-through text-slate-400" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, showHeroTitle: !settings.showHeroTitle })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-800 transition cursor-pointer rounded-lg hover:bg-slate-200/60"
                      title={settings.showHeroTitle ? "Hide main headline on banner" : "Show main headline on banner"}
                    >
                      {settings.showHeroTitle ? (
                        <Eye className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. Sub-Headline / Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Sub-Headline / Description *
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {settings.showHeroDescription ? "Visible on banner" : "Hidden"}
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={3}
                      required={settings.showHeroDescription}
                      placeholder="Explain your assets or store offer..."
                      value={settings.heroDescription}
                      onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                      className={`w-full pl-4 pr-12 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition ${
                        !settings.showHeroDescription ? "opacity-50 line-through text-slate-400" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, showHeroDescription: !settings.showHeroDescription })}
                      className="absolute right-3 top-3 p-1.5 text-slate-400 hover:text-slate-800 transition cursor-pointer rounded-lg hover:bg-slate-200/60"
                      title={settings.showHeroDescription ? "Hide description on banner" : "Show description on banner"}
                    >
                      {settings.showHeroDescription ? (
                        <Eye className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Banner Image URL & Upload */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Banner Background Image *
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      required
                      value={settings.heroImageUrl}
                      onChange={(e) => {
                        setSettings({ ...settings, heroImageUrl: e.target.value });
                        setUploadFileName(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                    />
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100/50 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
                  >
                    <UploadCloud className="w-5 h-5 text-indigo-600" />
                    <p className="text-xs font-bold text-slate-800">
                      {uploadFileName ? `Loaded: ${uploadFileName}` : "Click here to upload banner background image"}
                    </p>
                    <p className="text-[11px] text-slate-400">Optimal size: 1920 × 480 px (4:1 ratio)</p>
                  </div>
                </div>

                {/* Live Banner Preview */}
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Live Banner Preview</span>
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-md">
                      Storefront View
                    </span>
                  </div>

                  <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[220px] sm:min-h-[260px] p-6 sm:p-10 flex items-center shadow-lg border border-slate-800">
                    {settings.heroImageUrl && (
                      <img
                        src={settings.heroImageUrl}
                        alt="Hero Banner Preview"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                          hasAnyHeroText ? "opacity-30 mix-blend-overlay" : "opacity-100"
                        }`}
                      />
                    )}

                    {hasAnyHeroText ? (
                      <div className="relative z-10 max-w-xl space-y-3">
                        {settings.showHeroBadge && settings.heroBadge && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-white border border-white/20">
                            <Sparkles className="w-3 h-3 text-amber-300" /> {settings.heroBadge}
                          </span>
                        )}
                        
                        {settings.showHeroTitle && settings.heroTitle && (
                          <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                            {settings.heroTitle}
                          </h3>
                        )}

                        {settings.showHeroDescription && settings.heroDescription && (
                          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                            {settings.heroDescription}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="relative z-10 w-full flex items-center justify-end">
                        <span className="text-[10px] bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white/80 border border-white/10">
                          ✓ Clean Image Banner Mode (No text overlay)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Section 3: Bundle Offer Card Settings */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Bundle Offer Card</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Orange side card used to upsell full collections or packages.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, showBundle: !settings.showBundle })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                  settings.showBundle
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {settings.showBundle ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{settings.showBundle ? "Card Active" : "Card Hidden"}</span>
              </button>
            </div>

            {settings.showBundle ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Top Badge Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.bundleBadge}
                      onChange={(e) => setSettings({ ...settings, bundleBadge: e.target.value })}
                      placeholder="e.g. Bundle Offer"
                      className="w-full px-4 py-3 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Button Action Text *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.bundleButtonText}
                      onChange={(e) => setSettings({ ...settings, bundleButtonText: e.target.value })}
                      placeholder="e.g. Get Complete Bundle"
                      className="w-full px-4 py-3 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Bundle Headline Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.bundleTitle}
                    onChange={(e) => setSettings({ ...settings, bundleTitle: e.target.value })}
                    placeholder="e.g. Save Up to 60% on All Graphic Bundles"
                    className="w-full px-4 py-3 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Bundle Value Description *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={settings.bundleDescription}
                    onChange={(e) => setSettings({ ...settings, bundleDescription: e.target.value })}
                    placeholder="Explain what is included in the package..."
                    className="w-full px-4 py-3 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Checkout / Payment Link for the Bundle *
                  </label>
                  <div className="relative">
                    <ExternalLink className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      required={settings.showBundle}
                      value={settings.bundleUrl}
                      onChange={(e) => setSettings({ ...settings, bundleUrl: e.target.value })}
                      placeholder="https://buy.stripe.com/... or your custom bundle checkout"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Bundle Offer Card is hidden. The product catalog will display in full width.
              </p>
            )}
          </div>

          {/* Section 4: Promotional Coupon Strip Settings */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-800 font-bold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Discount Coupon Strip</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Bottom banner offering instant promo codes to first-time buyers.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, showPromoStrip: !settings.showPromoStrip })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                  settings.showPromoStrip
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {settings.showPromoStrip ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{settings.showPromoStrip ? "Strip Active" : "Strip Hidden"}</span>
              </button>
            </div>

            {settings.showPromoStrip ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Badge Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.promoBadge}
                      onChange={(e) => setSettings({ ...settings, promoBadge: e.target.value })}
                      placeholder="e.g. Limited Time Offer"
                      className="w-full px-4 py-3 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Coupon Code (Auto Click-to-Copy) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.promoCode}
                      onChange={(e) => setSettings({ ...settings, promoCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. CURIOLOT30"
                      className="w-full px-4 py-3 bg-slate-50 font-mono text-sm font-bold text-slate-900 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Promo Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.promoTitle}
                    onChange={(e) => setSettings({ ...settings, promoTitle: e.target.value })}
                    placeholder="e.g. Get 30% Off Your First Order"
                    className="w-full px-4 py-3 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Instructions / Description for Visitors *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.promoDescription}
                    onChange={(e) => setSettings({ ...settings, promoDescription: e.target.value })}
                    placeholder="e.g. Apply this coupon code at checkout to claim your launch discount."
                    className="w-full px-4 py-3 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Discount Coupon Strip is currently hidden from your storefront.
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
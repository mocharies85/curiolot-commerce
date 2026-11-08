"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { 
  Save, 
  UploadCloud, 
  ExternalLink, 
  Monitor, 
  Smartphone, 
  CheckCircle2, 
  Image as ImageIcon, 
  Trash2, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Layers, 
  Tag, 
  Lock, 
  DollarSign,
  Download
} from "lucide-react";
import type { StoreSettings } from "@/lib/storeSettings";

const DEFAULT_HERO_BANNER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80";

// Helper: Compress high-res uploaded images to lightweight JPEG via Canvas
const compressImage = (file: File, maxWidth: number, maxHeight: number, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function YourStorePage() {
  const username = "aries";
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadBannerName, setUploadBannerName] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Bundle pricing state for automatic checkout lock
  const [bundlePrice, setBundlePrice] = useState("19.00");

  const [settings, setSettings] = useState<StoreSettings>({
    username: "aries",
    storeTitle: "Aries Store",
    logoUrl: "",
    payoutProvider: "paypal",
    payoutPaypalHandle: "curiolot",
    payoutStripeUrl: "",
    payoutLemonSqueezyUrl: "",
    payoutPaddleUrl: "",
    payoutKofiUrl: "",
    payoutCustomUrl: "",
    showHero: true,
    heroBadge: "Featured Release",
    showHeroBadge: false,
    heroTitle: "Premium Vectors & 3D Design Assets",
    showHeroTitle: false,
    heroDescription: "Supercharge your creative workflow with production-ready assets.",
    showHeroDescription: false,
    heroImageUrl: DEFAULT_HERO_BANNER,
    showBundle: false,
    bundleBadge: "Bundle Offer",
    bundleTitle: "Save Up to 60% on All Graphic Bundles",
    bundleDescription: "Unlock instant access to the complete digital asset library.",
    bundleButtonText: "Get Complete Bundle",
    bundleUrl: "",
    bundleDownloadUrl: "",
    showPromoStrip: false,
    promoBadge: "Limited Time Offer",
    promoTitle: "Get 30% Off Your First Order",
    promoDescription: "Apply this coupon code at checkout to claim your launch discount.",
    promoCode: "CURIOLOT30",
  });

  useEffect(() => {
    // Read local cache first for instant UI response
    let localData: any = null;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`curiolot_store_settings_${username}`);
      if (stored) {
        try {
          localData = JSON.parse(stored);
          if (localData && typeof localData === "object") {
            setSettings((prev) => ({ ...prev, ...localData }));
          }
        } catch (e) {}
      }
    }

    fetch(`/api/settings?username=${username}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data && data.username) {
          setSettings((prev) => ({ 
            ...prev, 
            ...data,
            storeTitle: data.storeTitle || localData?.storeTitle || "Aries Store",
            heroImageUrl: data.heroImageUrl || data.bannerUrl || localData?.heroImageUrl || DEFAULT_HERO_BANNER,
            logoUrl: data.logoUrl || localData?.logoUrl || "",
            bundleDownloadUrl: data.bundleDownloadUrl || localData?.bundleDownloadUrl || "",
            showHero: typeof data.showHero !== "undefined" ? Boolean(data.showHero) : prev.showHero,
            showBundle: typeof data.showBundle !== "undefined" ? Boolean(data.showBundle) : prev.showBundle,
            showPromoStrip: typeof data.showPromoStrip !== "undefined" ? Boolean(data.showPromoStrip) : prev.showPromoStrip,
          }));
        }
      })
      .catch((err) => console.error("Failed to load settings:", err));
  }, [username]);

  // Synchronize bundle checkout link with active gateway from Earnings profile
  const autoLockedBundlePaymentUrl = useMemo(() => {
    if (settings.bundleUrl && !settings.bundleUrl.includes("buy.stripe.com/test_demo")) {
      return settings.bundleUrl;
    }

    const numericPrice = parseFloat(bundlePrice) || 19.0;
    const provider = settings.payoutProvider || "paypal";

    switch (provider) {
      case "stripe":
        return settings.payoutStripeUrl || "https://buy.stripe.com";
      case "lemonsqueezy":
        return settings.payoutLemonSqueezyUrl || "https://lemonsqueezy.com";
      case "paddle":
        return settings.payoutPaddleUrl || "https://paddle.com";
      case "kofi":
        return settings.payoutKofiUrl || "https://ko-fi.com/curiolot";
      case "custom":
        return settings.payoutCustomUrl || "#";
      case "paypal":
      default: {
        let cleanHandle = (settings.payoutPaypalHandle || "curiolot")
          .replace(/^https?:\/\/paypal\.me\//i, "")
          .replace(/\/.*$/, "")
          .trim();
        if (!cleanHandle || cleanHandle.toLowerCase() === "aries") {
          cleanHandle = "curiolot";
        }
        return `https://paypal.me/${cleanHandle}/${numericPrice.toFixed(2)}USD`;
      }
    }
  }, [
    settings.bundleUrl, 
    settings.payoutProvider, 
    settings.payoutPaypalHandle, 
    settings.payoutStripeUrl, 
    settings.payoutLemonSqueezyUrl, 
    settings.payoutPaddleUrl, 
    settings.payoutKofiUrl, 
    settings.payoutCustomUrl, 
    bundlePrice
  ]);

  const getInitials = (title: string) => {
    if (!title) return "AS";
    const words = title.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return title.slice(0, 2).toUpperCase();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Auto-compress logo to lightweight 256x256 image (~25 KB)
      const compressed = await compressImage(file, 256, 256, 0.85);
      setSettings((prev) => ({ ...prev, logoUrl: compressed }));
    } catch (err) {
      console.error("Failed to compress logo:", err);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadBannerName(file.name);
    try {
      // Auto-compress banner to 1400x500 JPEG (~70 KB) to respect D1 statement limit
      const compressed = await compressImage(file, 1400, 500, 0.8);
      setSettings((prev) => ({ ...prev, heroImageUrl: compressed }));
    } catch (err) {
      console.error("Failed to compress banner:", err);
    }
  };

  const handleResetBanner = () => {
    setSettings((prev) => ({ ...prev, heroImageUrl: DEFAULT_HERO_BANNER }));
    setUploadBannerName(null);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payloadToSave = {
      ...settings,
      username,
      storeTitle: settings.storeTitle.trim() || "Aries Store",
      storeName: settings.storeTitle.trim() || "Aries Store",
      bannerUrl: settings.heroImageUrl,
      heroImageUrl: settings.heroImageUrl,
      showHero: settings.showHero,
      showHeroBanner: settings.showHero,
      showBundle: settings.showBundle,
      showBundleCard: settings.showBundle,
      isBundleActive: settings.showBundle,
      showPromoStrip: settings.showPromoStrip,
      showDiscountCoupon: settings.showPromoStrip,
      isCouponActive: settings.showPromoStrip,
      bundleUrl: autoLockedBundlePaymentUrl,
      payoutPaypalHandle: settings.payoutPaypalHandle || "curiolot",
      paypalHandle: settings.payoutPaypalHandle || "curiolot",
    };

    try {
      // Use POST to guarantee D1 insertion and avoid 405 Method Not Allowed
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSave),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      // Synchronize directly to localStorage for instant local reflection
      if (typeof window !== "undefined") {
        localStorage.setItem(`curiolot_store_settings_${username}`, JSON.stringify(payloadToSave));
        localStorage.setItem("curiolot_store_settings", JSON.stringify(payloadToSave));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      alert("Store appearance and branding saved successfully!");
    } catch (err: any) {
      console.error("Failed to save store settings:", err);
      alert("Failed to save settings: " + (err.message || "Network error"));
    } finally {
      setIsSaving(false);
    }
  };

  const hasAnyHeroText = 
    (settings.showHeroBadge && Boolean(settings.heroBadge)) ||
    (settings.showHeroTitle && Boolean(settings.heroTitle)) ||
    (settings.showHeroDescription && Boolean(settings.heroDescription));

  const isCustomBanner = settings.heroImageUrl !== DEFAULT_HERO_BANNER;

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Store</h1>
          <p className="text-xs text-slate-500 mt-1">Configure your storefront branding, billboard banner, upsell cards, and promo codes.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> All Changes Live!
            </span>
          )}
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>Open Public Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2-Column Customizer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Settings */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          
          {/* 1. Store Identity & Logo */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Store Identity & Logo</h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Store Display Name *</label>
              <input
                type="text"
                required
                value={settings.storeTitle}
                onChange={(e) => setSettings({ ...settings, storeTitle: e.target.value })}
                placeholder="e.g. Aries Store"
                className="w-full px-4 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Storefront URL</label>
              <div className="flex items-center px-4 py-2.5 bg-slate-100 rounded-xl text-xs text-slate-500 font-mono">
                <span>store.curiolot.com/</span>
                <span className="font-bold text-slate-900 ml-1">{username}</span>
              </div>
            </div>

            {/* Logo Avatar Upload & URL */}
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Store Logo / Brand Avatar</label>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                <div className="relative shrink-0">
                  {settings.logoUrl ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-white p-1 flex items-center justify-center">
                      <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                      {getInitials(settings.storeTitle)}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                    </button>

                    {settings.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, logoUrl: "" })}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Reset to Monogram</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    placeholder="Or paste direct image URL (https://...)"
                    value={settings.logoUrl || ""}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white text-[11px] rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Hero Showcase Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hero Showcase Banner</h2>
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
              <div className="space-y-4 pt-1">
                {/* Badge Tag */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Badge Tag Text</label>
                    <span className="text-[10px] text-slate-400">
                      {settings.showHeroBadge ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Featured Release, Summer Sale 2026"
                      value={settings.heroBadge}
                      onChange={(e) => setSettings({ ...settings, heroBadge: e.target.value })}
                      className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition ${
                        !settings.showHeroBadge ? "opacity-50 text-slate-400" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, showHeroBadge: !settings.showHeroBadge })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                    >
                      {settings.showHeroBadge ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Main Headline */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Main Headline *</label>
                    <span className="text-[10px] text-slate-400">
                      {settings.showHeroTitle ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Premium Vectors & 3D Design Assets"
                      value={settings.heroTitle}
                      onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                      className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition font-semibold ${
                        !settings.showHeroTitle ? "opacity-50 text-slate-400" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, showHeroTitle: !settings.showHeroTitle })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                    >
                      {settings.showHeroTitle ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Sub-headline */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Sub-Headline / Description</label>
                    <span className="text-[10px] text-slate-400">
                      {settings.showHeroDescription ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={2}
                      placeholder="Explain your assets or store offer..."
                      value={settings.heroDescription}
                      onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                      className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition ${
                        !settings.showHeroDescription ? "opacity-50 text-slate-400" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, showHeroDescription: !settings.showHeroDescription })}
                      className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                    >
                      {settings.showHeroDescription ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Banner Image URL & File Upload */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">Banner Background Image *</label>
                    {isCustomBanner && (
                      <button
                        type="button"
                        onClick={handleResetBanner}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition cursor-pointer"
                        title="Reset to default banner"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset to Default</span>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={settings.heroImageUrl}
                      onChange={(e) => {
                        setSettings({ ...settings, heroImageUrl: e.target.value });
                        setUploadBannerName(null);
                      }}
                      placeholder="Paste image URL (https://...)"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition font-mono"
                    />
                    {isCustomBanner && (
                      <button
                        type="button"
                        onClick={handleResetBanner}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Remove custom banner & restore default"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={bannerInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />

                  <div
                    onClick={() => bannerInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100/50 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 group"
                  >
                    <UploadCloud className="w-4 h-4 text-indigo-600 group-hover:scale-105 transition" />
                    <p className="text-xs font-bold text-slate-800">
                      {uploadBannerName ? `Selected: ${uploadBannerName}` : "Click to upload banner background image"}
                    </p>
                    <p className="text-[10px] text-slate-400">Auto-compressed safely for instant database synchronization</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Bundle Offer Card Settings */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Bundle Offer Card</h2>
                  <p className="text-[11px] text-slate-500">Prominent orange side card designed to upsell multi-product bundles.</p>
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
                <span>{settings.showBundle ? "Active" : "Hidden"}</span>
              </button>
            </div>

            {settings.showBundle && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Label</label>
                    <input
                      type="text"
                      value={settings.bundleBadge}
                      onChange={(e) => setSettings({ ...settings, bundleBadge: e.target.value })}
                      placeholder="Bundle Offer"
                      className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Button Action Text</label>
                    <input
                      type="text"
                      value={settings.bundleButtonText}
                      onChange={(e) => setSettings({ ...settings, bundleButtonText: e.target.value })}
                      placeholder="Get Complete Bundle"
                      className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bundle Headline Title</label>
                  <input
                    type="text"
                    value={settings.bundleTitle}
                    onChange={(e) => setSettings({ ...settings, bundleTitle: e.target.value })}
                    placeholder="Save Up to 60% on All Graphic Bundles"
                    className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bundle Description</label>
                  <textarea
                    rows={2}
                    value={settings.bundleDescription}
                    onChange={(e) => setSettings({ ...settings, bundleDescription: e.target.value })}
                    placeholder="Explain what is included in the package..."
                    className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition"
                  />
                </div>

                {/* Bundle Price & Auto-Locked Checkout Destination */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Bundle Checkout Destination</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-amber-900 border border-amber-200">
                      Gateway: {settings.payoutProvider ? settings.payoutProvider.toUpperCase() : "PAYPAL"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Bundle Package Price (USD $)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={bundlePrice}
                        onChange={(e) => setBundlePrice(e.target.value)}
                        placeholder="19.00"
                        className="w-full pl-8 pr-3 py-2 bg-white text-xs font-bold text-slate-900 rounded-xl border border-amber-200 focus:outline-none focus:border-slate-900 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Synchronized Checkout Link (Auto-Locked)
                    </label>
                    <input
                      type="url"
                      value={autoLockedBundlePaymentUrl}
                      onChange={(e) => setSettings({ ...settings, bundleUrl: e.target.value })}
                      placeholder="Auto-synchronized from Earnings or paste custom checkout URL"
                      className="w-full px-3 py-2 bg-white text-xs rounded-xl border border-amber-200 focus:outline-none focus:border-slate-900 transition font-mono text-emerald-800 font-bold"
                    />
                    <p className="text-[10px] text-amber-900/80 mt-1">
                      Directly wired to your creator account without platform holding periods.
                    </p>
                  </div>

                  {/* Private Bundle Asset Download Link */}
                  <div className="pt-2 border-t border-amber-200/60">
                    <label className="block text-[11px] font-bold text-amber-900 mb-1 flex items-center gap-1">
                      <Download className="w-3 h-3 text-amber-700" />
                      <span>Bundle Download File / Cloud Vault URL (Delivered to Buyer) *</span>
                    </label>
                    <input
                      type="url"
                      required={settings.showBundle}
                      value={settings.bundleDownloadUrl || ""}
                      onChange={(e) => setSettings({ ...settings, bundleDownloadUrl: e.target.value })}
                      placeholder="https://drive.google.com/... or https://dropbox.com/... or direct .zip link"
                      className="w-full px-3 py-2 bg-white text-xs rounded-xl border border-amber-200 focus:outline-none focus:border-slate-900 transition font-mono text-slate-800"
                    />
                    <p className="text-[10px] text-amber-900/80 mt-1">
                      This private link will be unlocked on the buyer's order confirmation screen immediately after payment completion.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Promotional Coupon Strip */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-800">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Discount Coupon Strip</h2>
                  <p className="text-[11px] text-slate-500">Bottom promotional banner offering instant promo codes.</p>
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
                <span>{settings.showPromoStrip ? "Active" : "Hidden"}</span>
              </button>
            </div>

            {settings.showPromoStrip && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Label</label>
                    <input
                      type="text"
                      value={settings.promoBadge}
                      onChange={(e) => setSettings({ ...settings, promoBadge: e.target.value })}
                      placeholder="Limited Time Offer"
                      className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code (Auto-Uppercase)</label>
                    <input
                      type="text"
                      value={settings.promoCode}
                      onChange={(e) => setSettings({ ...settings, promoCode: e.target.value.toUpperCase() })}
                      placeholder="CURIOLOT30"
                      className="w-full px-3 py-2 bg-slate-50 font-mono text-xs font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Promo Headline</label>
                  <input
                    type="text"
                    value={settings.promoTitle}
                    onChange={(e) => setSettings({ ...settings, promoTitle: e.target.value })}
                    placeholder="Get 30% Off Your First Order"
                    className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Instructions</label>
                  <input
                    type="text"
                    value={settings.promoDescription}
                    onChange={(e) => setSettings({ ...settings, promoDescription: e.target.value })}
                    placeholder="Apply this coupon code at checkout to claim your discount."
                    className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition shadow-md shadow-slate-900/10 cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Settings..." : "Save Store Appearance"}</span>
          </button>
        </form>

        {/* Right Column: Live Screen Mockup Preview */}
        <div className="lg:col-span-5 sticky top-20 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-500">Live preview of your store</span>
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  device === "desktop" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  device === "mobile" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Browser Window Frame */}
          <div className={`mx-auto bg-slate-900 rounded-3xl p-3 shadow-xl transition-all duration-300 ${
            device === "desktop" ? "w-full" : "w-[320px]"
          }`}>
            <div className="flex items-center gap-1.5 pb-2.5 px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[10px] text-slate-400 font-mono ml-2 truncate">
                store.curiolot.com/{username}
              </span>
            </div>

            {/* Inner Live Web Page */}
            <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden h-[540px] border border-slate-800 overflow-y-auto space-y-3">
              
              {/* Header Storefront */}
              <div className="bg-white px-3 py-2 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.logoUrl ? (
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 bg-white p-0.5 shrink-0">
                      <img src={settings.logoUrl} alt="" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-center text-[10px] shrink-0">
                      {getInitials(settings.storeTitle)}
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 truncate leading-tight max-w-[130px]">
                      {settings.storeTitle}
                    </p>
                    <p className="text-[8px] text-slate-400">Creator Storefront</p>
                  </div>
                </div>

                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                  Buy
                </span>
              </div>

              {/* Hero Banner Live Preview */}
              {settings.showHero && (
                <div className="px-3">
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 min-h-[110px] p-3 flex items-center shadow-xs">
                    <img 
                      src={settings.heroImageUrl} 
                      alt="" 
                      className={`absolute inset-0 w-full h-full object-cover ${hasAnyHeroText ? "opacity-35" : "opacity-100"}`} 
                    />
                    {hasAnyHeroText && (
                      <div className="relative z-10 space-y-1">
                        {settings.showHeroBadge && settings.heroBadge && (
                          <span className="inline-block px-1.5 py-0.5 rounded-full bg-white/20 text-[8px] font-bold text-white border border-white/20">
                            {settings.heroBadge}
                          </span>
                        )}
                        {settings.showHeroTitle && settings.heroTitle && (
                          <p className="text-xs font-black text-white leading-tight">
                            {settings.heroTitle}
                          </p>
                        )}
                        {settings.showHeroDescription && settings.heroDescription && (
                          <p className="text-[9px] text-slate-200 line-clamp-2 leading-tight">
                            {settings.heroDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bundle Card (If Enabled) */}
              {settings.showBundle && (
                <div className="px-3">
                  <div className="rounded-xl bg-linear-to-b from-amber-500 to-amber-600 p-3 text-white space-y-1 shadow-xs">
                    <span className="text-[8px] font-bold uppercase bg-black/20 px-1.5 py-0.5 rounded">
                      {settings.bundleBadge || "Bundle Offer"}
                    </span>
                    <p className="text-xs font-black leading-tight">
                      {settings.bundleTitle || "Save Up to 60% on All Graphic Bundles"}
                    </p>
                    <div className="w-full py-1 mt-1 bg-white text-amber-950 font-bold text-[9px] rounded-lg text-center truncate px-2">
                      {settings.bundleButtonText || "Get Complete Bundle"} (${parseFloat(bundlePrice || "19").toFixed(2)})
                    </div>
                  </div>
                </div>
              )}

              {/* Mockup Products Grid */}
              <div className="px-3">
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white rounded-xl p-2 border border-slate-200/80 space-y-1">
                    <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center text-[8px] font-bold text-white/80">
                      COVER ART
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 truncate">The Beast Whisperer</p>
                    <p className="text-[9px] font-black text-slate-900">$4.99</p>
                  </div>

                  <div className="bg-white rounded-xl p-2 border border-slate-200/80 space-y-1">
                    <div className="aspect-square bg-indigo-950 rounded-lg overflow-hidden flex items-center justify-center text-[8px] font-bold text-white/80">
                      3D ASSET
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 truncate">Floating Botanicals</p>
                    <p className="text-[9px] font-black text-slate-900">$19.00</p>
                  </div>
                </div>
              </div>

              {/* Promo Coupon Strip (If Enabled) */}
              {settings.showPromoStrip && (
                <div className="px-3 pb-3">
                  <div className="rounded-xl bg-amber-400 p-2.5 flex items-center justify-between text-amber-950 shadow-xs">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider">{settings.promoBadge || "PROMO"}</p>
                      <p className="text-[10px] font-extrabold leading-tight">{settings.promoTitle || "30% Off Discount"}</p>
                    </div>
                    <span className="font-mono text-[9px] font-black bg-white px-1.5 py-0.5 rounded border border-amber-600/30">
                      {settings.promoCode || "CURIOLOT30"}
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
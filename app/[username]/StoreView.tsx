"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ShoppingBag, 
  ArrowUpRight, 
  Download, 
  SlidersHorizontal, 
  Layers, 
  Box, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Percent, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  PackageOpen, 
  Heart,
  Store,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import type { Product } from "@/lib/products";
import type { StoreSettings } from "@/lib/storeSettings";

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80";
const DEFAULT_PRODUCT_COVER = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";

interface StoreViewProps {
  username: string;
}

const CATEGORIES = [
  { name: "All Assets", icon: Sparkles, match: [] as string[] },
  { name: "Vectors & Logos", icon: Layers, match: ["vector", "logo"] },
  { name: "3D Assets", icon: Box, match: ["3d"] },
  { name: "E-Books & Guides", icon: BookOpen, match: ["e-book", "guide", "book"] },
  { name: "Templates", icon: SlidersHorizontal, match: ["template"] },
  { name: "Special Deals", icon: Percent, match: [] as string[], highlight: true },
];

export default function StoreView({ username }: StoreViewProps) {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Status proteksi jika file gambar gagal decode / corrupt Base64
  const [logoFailed, setLogoFailed] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("All Assets");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "seller">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authStoreName, setAuthStoreName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Load public products and store customization from API & Local Persistence
  useEffect(() => {
    async function loadStoreData() {
      try {
        let localSettings: any = {};
        if (typeof window !== "undefined") {
          const keysToTry = [
            `curiolot_store_settings_${username}`,
            `store_settings_${username}`,
          ];
          for (const key of keysToTry) {
            const stored = localStorage.getItem(key);
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === "object") {
                  localSettings = { ...localSettings, ...parsed };
                }
              } catch (e) {}
            }
          }
        }

        const [settingsRes, productsRes] = await Promise.all([
          fetch(`/api/settings?username=${username}`),
          fetch(`/api/products?username=${username}&public=true`)
        ]);

        const settingsData: any = await settingsRes.json().catch(() => ({}));
        const productsData: any = await productsRes.json().catch(() => []);

        const mergedSettings: any = {
          ...localSettings,
          ...settingsData,
        };

        if (localSettings) {
          if (!settingsData.logoUrl && (localSettings.logoUrl || localSettings.storeLogo || localSettings.logo)) {
            mergedSettings.logoUrl = localSettings.logoUrl || localSettings.storeLogo || localSettings.logo;
          }
          if (!settingsData.bannerUrl && (localSettings.bannerUrl || localSettings.heroImageUrl || localSettings.bannerImageUrl)) {
            mergedSettings.bannerUrl = localSettings.bannerUrl || localSettings.heroImageUrl || localSettings.bannerImageUrl;
            mergedSettings.heroImageUrl = mergedSettings.bannerUrl;
          }
          if ((!settingsData.storeTitle || settingsData.storeTitle === "Digital Creator Studio") && (localSettings.storeTitle || localSettings.storeName)) {
            mergedSettings.storeTitle = localSettings.storeTitle || localSettings.storeName;
          }
          if (localSettings.heroHeadline || localSettings.mainHeadline) {
            mergedSettings.heroTitle = localSettings.heroHeadline || localSettings.mainHeadline;
          }
          if (localSettings.subHeadline || localSettings.heroDescription) {
            mergedSettings.heroDescription = localSettings.subHeadline || localSettings.heroDescription;
          }
          if (localSettings.badgeTag || localSettings.heroBadge) {
            mergedSettings.heroBadge = localSettings.badgeTag || localSettings.heroBadge;
          }
        }

        setSettings(mergedSettings as StoreSettings);

        if (Array.isArray(productsData)) {
          setProducts(productsData as Product[]);
        }
      } catch (err) {
        console.error("Failed to load storefront data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoreData();
  }, [username]);

  const openAuth = (mode: "login" | "signup" | "seller") => {
    setAuthMode(mode);
    setAuthError("");
    setShowAuthModal(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmittingAuth(true);

    try {
      if (authMode === "seller") {
        alert(`Welcome to Curiolot Creators! Redirecting to setup store for "${authStoreName || "Your Store"}".`);
        setShowAuthModal(false);
        router.push("/dashboard");
        return;
      }

      if (authMode === "signup") {
        if (!agreeTerms) {
          setAuthError("You must agree to the Terms of Service and Privacy Policy to create an account.");
          setIsSubmittingAuth(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
          }),
        });

        const data: any = await res.json();

        if (!res.ok) {
          setAuthError(data?.error || "Failed to create account. Please try again.");
          return;
        }

        alert("Account registered successfully! Redirecting to your dashboard...");
        setShowAuthModal(false);
        router.push("/dashboard");
        return;
      }

      // Log In Flow
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: authEmail,
          password: authPassword,
        }),
      });

      const data: any = await res.json();

      if (!res.ok) {
        setAuthError(data?.error || "Invalid email or password. Please verify your credentials.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("curiolot_session", JSON.stringify(data?.user || { email: authEmail }));
      }

      alert(`Welcome back, ${data?.user?.name || authEmail}!`);
      setShowAuthModal(false);
      router.push("/dashboard");
    } catch (err) {
      setAuthError("Network connection error. Please try again.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const getInitials = (title?: string) => {
    const raw = (title || username || "CR").trim();
    const words = raw.split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return raw.slice(0, 2).toUpperCase();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      let matchesCat = true;
      if (selectedCategory === "Special Deals") {
        matchesCat = Boolean(
          (product.originalPrice && product.originalPrice > product.price) ||
          (product.badge && product.badge.toLowerCase().includes("sale"))
        );
      } else if (selectedCategory !== "All Assets") {
        const catConfig = CATEGORIES.find((c) => c.name === selectedCategory);
        if (catConfig && catConfig.match.length > 0) {
          matchesCat = catConfig.match.some((keyword) =>
            product.category.toLowerCase().includes(keyword)
          );
        } else {
          matchesCat = product.category.toLowerCase().includes(selectedCategory.toLowerCase());
        }
      }

      let matchesSearch = true;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        matchesSearch = 
          product.title.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q);
      }

      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Robust field normalization
  const formattedUsername = username 
    ? username.charAt(0).toUpperCase() + username.slice(1) 
    : "Creator";
  const defaultStoreName = `${formattedUsername} Store`;

  const rawLogo = 
    settings?.logoUrl || 
    (settings as any)?.logo_url || 
    (settings as any)?.storeLogo || 
    (settings as any)?.store_logo || 
    (settings as any)?.avatarUrl || 
    (settings as any)?.logo;

  // Abaikan Base64 korup yang terlalu panjang langsung dari state
  const storeLogo = (rawLogo && rawLogo.startsWith("data:") && rawLogo.length > 30000) 
    ? "" 
    : rawLogo;

  const storeTitleText = 
    settings?.storeTitle || 
    (settings as any)?.store_title || 
    (settings as any)?.storeName || 
    (settings as any)?.store_name || 
    defaultStoreName;

  const rawHeroBanner = 
    settings?.heroImageUrl || 
    (settings as any)?.bannerUrl || 
    (settings as any)?.hero_image_url || 
    (settings as any)?.banner_url || 
    (settings as any)?.bannerImageUrl || 
    (settings as any)?.banner_image_url || 
    (settings as any)?.heroImage ||
    (settings as any)?.banner;

  const heroBannerImage = (rawHeroBanner && rawHeroBanner.startsWith("data:") && rawHeroBanner.length > 50000)
    ? DEFAULT_BANNER
    : (rawHeroBanner || DEFAULT_BANNER);

  const heroHeadlineText = 
    settings?.heroTitle || 
    (settings as any)?.hero_title || 
    (settings as any)?.heroHeadline || 
    (settings as any)?.hero_headline || 
    (settings as any)?.mainHeadline || 
    (settings as any)?.headline || 
    "Original Digital Assets & Creative Works";

  const heroDescriptionText = 
    settings?.heroDescription || 
    (settings as any)?.hero_description || 
    (settings as any)?.subHeadline || 
    (settings as any)?.sub_headline || 
    "Supercharge your creative workflow with production-ready assets.";

  const heroBadgeText = 
    settings?.heroBadge || 
    (settings as any)?.hero_badge || 
    (settings as any)?.badgeTag || 
    (settings as any)?.badgeTagText || 
    "Featured Release";

  const checkIsActive = (val: any, fallback = true) => {
    if (val === undefined || val === null) return fallback;
    if (val === true || val === 1 || val === "1" || val === "active" || val === "visible" || val === "true") return true;
    if (val === false || val === 0 || val === "0" || val === "hidden" || val === "false") return false;
    return fallback;
  };

  const isHeroVisible = checkIsActive(
    (settings as any)?.showHero ??
    (settings as any)?.showHeroBanner ??
    (settings as any)?.bannerActive ??
    (settings as any)?.isHeroActive,
    true
  );

  const showBundle = checkIsActive(
    (settings as any)?.showBundle ??
    (settings as any)?.showBundleCard ??
    (settings as any)?.isBundleActive ??
    (settings as any)?.bundleActive ??
    (settings as any)?.bundleStatus,
    true
  );

  const showPromoStrip = checkIsActive(
    (settings as any)?.showPromoStrip ??
    (settings as any)?.showDiscountCoupon ??
    (settings as any)?.isCouponActive ??
    (settings as any)?.showPromo ??
    (settings as any)?.promoActive ??
    (settings as any)?.couponStatus ??
    (settings as any)?.promoStatus,
    true
  );

  const showBadge = Boolean(heroBadgeText);
  const showTitle = Boolean(heroHeadlineText);
  const showDesc = Boolean(heroDescriptionText);
  const hasHeroText = showBadge || showTitle || showDesc;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 font-sans antialiased">
      {/* 1. Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between gap-4">
          
          {/* Brand Identity & Logo with Anti-Broken Guard */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="shrink-0">
              {storeLogo && !logoFailed ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xs p-1 flex items-center justify-center">
                  <img
                    src={storeLogo}
                    alt={storeTitleText}
                    onError={() => setLogoFailed(true)}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm tracking-wider">
                  {getInitials(storeTitleText)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg sm:text-xl capitalize tracking-tight">
                  {storeTitleText}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">Official Creator Storefront</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md items-center relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search digital assets, templates, or guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm rounded-full border border-transparent focus:border-slate-300 focus:outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openAuth("seller")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-2 rounded-xl hover:bg-slate-100 transition tracking-tight cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sell on Curiolot</span>
            </button>

            <button
              type="button"
              onClick={() => openAuth("login")}
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Log In
            </button>

            <button
              type="button"
              onClick={() => openAuth("signup")}
              className="hidden sm:inline-flex text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition shadow-xs active:scale-95 cursor-pointer"
            >
              Sign Up
            </button>

            <div className="hidden sm:block h-5 w-px bg-slate-200 mx-1" />

            <button
              type="button"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer relative"
              title="Saved Items / Wishlist"
            >
              <Heart className={`w-4 h-4 transition ${isWishlisted ? "text-rose-600 fill-rose-600" : ""}`} />
            </button>

            <div
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer relative transition"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </div>

            <a
              href={`https://link.curiolot.com/${username}`}
              target="_self"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full transition ml-1"
            >
              <span>Bio Link</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

        </div>
      </header>

      {/* 2. Interactive Category Highlights */}
      <section className="bg-white border-b border-slate-200/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="flex flex-col items-center gap-2 group shrink-0 focus:outline-none transition active:scale-95 cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isSelected 
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/15 ring-2 ring-slate-900 ring-offset-2" 
                      : cat.highlight
                      ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}>
                    <Icon className="w-6 h-6 transition group-hover:scale-110" />
                  </div>
                  <span className={`text-xs transition ${
                    isSelected ? "font-bold text-slate-900" : "font-medium text-slate-600 group-hover:text-slate-900"
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Hero Showcase Banner */}
      {isHeroVisible && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[300px] sm:min-h-[340px] flex items-center shadow-xl">
            <img
              src={heroBannerImage}
              alt="Hero Visual"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_BANNER;
              }}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                hasHeroText ? "opacity-60" : "opacity-100"
              }`}
            />
            {hasHeroText && (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent z-0" />
            )}
            {hasHeroText && (
              <div className="relative z-10 p-8 sm:p-12 max-w-2xl space-y-4">
                {showBadge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {heroBadgeText}
                  </span>
                )}
                {showTitle && (
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                    {heroHeadlineText}
                  </h1>
                )}
                {showDesc && (
                  <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
                    {heroDescriptionText}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Product Catalog & Promo Grid */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {selectedCategory === "All Assets" ? "New Arrivals" : selectedCategory}
              </h2>
              {selectedCategory !== "All Assets" && (
                <button
                  onClick={() => setSelectedCategory("All Assets")}
                  className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery ? `Showing results for "${searchQuery}"` : "Authentic original assets freshly published by the creator"}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filteredProducts.length} Products Found
          </span>
        </div>

        <div className={`grid grid-cols-1 ${showBundle ? "lg:grid-cols-4" : "lg:grid-cols-1"} gap-8`}>
          
          {/* Side Promo Card (Bundle Offer) */}
          {showBundle && (
            <div className="lg:col-span-1 rounded-3xl bg-linear-to-b from-amber-500 to-amber-600 p-8 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-3 py-1 rounded-full bg-black/20 text-xs font-bold tracking-wider uppercase">
                    {settings?.bundleBadge || "Bundle Offer"}
                  </span>
                  <PackageOpen className="w-5 h-5 text-amber-200" />
                </div>

                <h3 className="text-2xl font-extrabold leading-snug">
                  {settings?.bundleTitle || "Save Up to 60% on All Graphic Bundles"}
                </h3>

                <p className="text-amber-100 text-xs leading-relaxed">
                  {settings?.bundleDescription || "Unlock instant access to the complete digital asset library."}
                </p>

                <div className="pt-2">
                  <div className="p-3 rounded-2xl bg-black/15 border border-white/10 text-[11px] text-amber-100 space-y-1">
                    <p className="font-semibold text-white">Why choose the bundle?</p>
                    <p className="text-amber-200/90 leading-tight">
                      Get full commercial licenses for every asset in this store at a single discounted rate.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 relative z-10">
                <a
                  href={settings?.bundleUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-white text-amber-950 rounded-2xl text-xs font-bold hover:bg-amber-50 transition shadow-md flex items-center justify-center gap-1.5 active:scale-95 text-center"
                >
                  <span>{settings?.bundleButtonText || "Get Complete Bundle"}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </div>
          )}

          {/* Product Cards Grid with Anti-Broken Fallback */}
          <div className={showBundle ? "lg:col-span-3" : "lg:col-span-1"}>
            {isLoading ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-xs">
                <p className="text-xs text-slate-400">Loading catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-xs">
                <p className="text-base font-bold text-slate-800">No products match your selection</p>
                <p className="text-xs text-slate-400 mt-1">
                  Try selecting another category or clear your search keyword.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All Assets");
                    setSearchQuery("");
                  }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${showBundle ? "md:grid-cols-3" : "md:grid-cols-4"} gap-6`}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white rounded-3xl border border-slate-200/70 overflow-hidden transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50"
                  >
                    <div className="relative aspect-4/3 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                      <img
                        src={product.coverUrl || DEFAULT_PRODUCT_COVER}
                        alt={product.title}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_PRODUCT_COVER;
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.badge && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-xs bg-slate-900/90 backdrop-blur-xs text-white">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {product.category}
                        </span>
                        <h3 className="mt-1 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          {product.price === 0 ? (
                            <span className="text-base font-extrabold text-emerald-600">FREE</span>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-extrabold text-slate-900">
                                ${product.price.toFixed(2)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                  ${product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <Link
                          href={`/${username}/${product.slug}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition active:scale-95 shadow-xs"
                        >
                          {product.price === 0 ? (
                            <>
                              <Download className="w-3.5 h-3.5" /> Download
                            </>
                          ) : (
                            <>
                              <span>Buy Now</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Promotional Discount Strip */}
      {showPromoStrip && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
          <div className="bg-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                {settings?.promoBadge || "Limited Time Offer"}
              </span>
              <h4 className="text-xl sm:text-2xl font-extrabold text-amber-950 mt-0.5">
                {settings?.promoTitle || "Get 30% Off Your First Order"}
              </h4>
              <p className="text-xs text-amber-900/80 mt-1">
                {settings?.promoDescription || "Apply this coupon code at checkout to claim your launch discount."}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyCode(settings?.promoCode || "CURIOLOT30")}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-amber-500/80 shadow-xs transition active:scale-95 cursor-pointer group"
                title="Click to copy coupon code"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Coupon Code</span>
                  <span className="font-mono text-sm font-extrabold text-slate-900">
                    {settings?.promoCode || "CURIOLOT30"}
                  </span>
                </div>

                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                  copiedCoupon ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800"
                }`}>
                  {copiedCoupon ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>
              </button>

              <span className="text-[10px] text-amber-950/80 font-medium px-1">
                {copiedCoupon ? "✓ Code copied to clipboard!" : "Click coupon to copy code"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 6. AUTH & CREATOR POP-UP MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-left">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-3 shadow-sm">
                {authMode === "seller" ? <Store className="w-6 h-6 text-indigo-400" /> : <Lock className="w-6 h-6" />}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {authMode === "seller" && "Start Selling on Curiolot"}
                {authMode === "login" && "Welcome Back to Curiolot"}
                {authMode === "signup" && "Create Your Free Account"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === "seller" && "Open your own digital storefront and monetize your creativity."}
                {authMode === "login" && "Enter your credentials to access your library and purchases."}
                {authMode === "signup" && "Join millions of creators and digital asset collectors."}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex rounded-xl bg-slate-100 p-1 mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                  authMode === "login" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                }}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                  authMode === "signup" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("seller");
                  setAuthError("");
                }}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                  authMode === "seller" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Open Store
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              {authMode === "seller" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Proposed Store Name</label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pixel Crafters Studio"
                      value={authStoreName}
                      onChange={(e) => setAuthStoreName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                  />
                </div>
              </div>

              {authMode === "signup" && (
                <div className="flex items-start gap-2.5 text-left pt-1">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    required
                  />
                  <label htmlFor="agreeTerms" className="text-xs text-slate-500 leading-snug cursor-pointer select-none">
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" className="font-semibold text-slate-900 underline hover:text-slate-700">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" target="_blank" className="font-semibold text-slate-900 underline hover:text-slate-700">
                      Privacy Policy
                    </Link>.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingAuth || (authMode === "signup" && !agreeTerms)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95 shadow-md shadow-slate-900/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>
                  {isSubmittingAuth 
                    ? "Processing..." 
                    : authMode === "seller" 
                    ? "Create Creator Store" 
                    : authMode === "login" 
                    ? "Log In" 
                    : "Create Account"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Looking for admin portal?</span>
              <Link
                href="/dashboard"
                onClick={() => setShowAuthModal(false)}
                className="font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
              >
                <span>Go to Inventory Dashboard</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
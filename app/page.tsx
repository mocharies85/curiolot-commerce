"use client";

export const runtime = "edge";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ShoppingBag, 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  Box, 
  BookOpen, 
  SlidersHorizontal, 
  Percent, 
  Store, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  Heart, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Globe2, 
  FileCheck, 
  Compass 
} from "lucide-react";
import CuriolotLogo from "@/components/CuriolotLogo";

const MARKETPLACE_CATEGORIES = [
  { name: "All Assets", icon: Sparkles, match: [] as string[] },
  { name: "Vectors & Logos", icon: Layers, match: ["vector", "logo"] },
  { name: "3D Assets", icon: Box, match: ["3d"] },
  { name: "E-Books & Guides", icon: BookOpen, match: ["e-book", "guide", "book"] },
  { name: "Templates", icon: SlidersHorizontal, match: ["template"] },
  { name: "Special Deals", icon: Percent, match: [] as string[], highlight: true },
];

const INITIAL_FALLBACK_PRODUCTS: any[] = [
  {
    id: "item_1",
    title: "The Beast Whisperer: Agent of Shadows",
    category: "E-Books & Guides",
    price: 4.99,
    originalPrice: 9.99,
    badge: "Bestseller",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    username: "aries",
    slug: "the-beast-whisperer",
    description: "In a world filled with mystery and danger, there lives a young man named Lucius.",
    isActive: true,
  },
  {
    id: "item_2",
    title: "Floating Botanicals 3D Element Pack",
    category: "3D Assets",
    price: 19.00,
    originalPrice: 35.00,
    badge: "Staff Pick",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    username: "aries",
    slug: "floating-botanicals",
    description: "4K ultra-detailed floating 3D botanical assets with alpha transparency.",
    isActive: true,
  },
  {
    id: "item_3",
    title: "Cyberpunk Vector Icons & Linocut Stamps",
    category: "Vectors & Logos",
    price: 8.50,
    originalPrice: 15.00,
    badge: "Trending",
    coverUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    username: "aries",
    slug: "cyberpunk-vector-icons",
    description: "High-contrast monochrome linocut illustrations for digital creators.",
    isActive: true,
  },
  {
    id: "item_4",
    title: "Creator Economy Storefront Boilerplate",
    category: "Templates",
    price: 29.00,
    originalPrice: 49.00,
    badge: "Featured",
    coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    username: "aries",
    slug: "creator-boilerplate",
    description: "Zero-commission storefront engine built with Next.js and Cloudflare D1.",
    isActive: true,
  }
];

export default function LandingHomePage() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>(INITIAL_FALLBACK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Assets");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "seller">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  useEffect(() => {
    fetch("/api/products?all=true")
      .then((res) => res.json())
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => console.error("Failed to load marketplace catalog:", err))
      .finally(() => setIsLoading(false));
  }, []);

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
        setShowAuthModal(false);
        router.push("/dashboard");
        return;
      }

      if (authMode === "signup") {
        if (!agreeTerms) {
          setAuthError("You must agree to the Terms of Service to register.");
          setIsSubmittingAuth(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: authName, email: authEmail, password: authPassword }),
        });

        const data: any = await res.json().catch(() => ({}));
        if (!res.ok) {
          setAuthError(data?.error || "Registration failed. Please try again.");
          return;
        }

        setShowAuthModal(false);
        router.push("/dashboard");
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: authEmail, password: authPassword }),
      });

      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data?.error || "Invalid email or password.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("curiolot_session", JSON.stringify(data?.user || { email: authEmail }));
      }

      setShowAuthModal(false);
      router.push("/dashboard");
    } catch (err) {
      setAuthError("Network connection error. Please try again.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
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
        const catConfig = MARKETPLACE_CATEGORIES.find((c) => c.name === selectedCategory);
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
          (product.description && product.description.toLowerCase().includes(q)) ||
          product.category.toLowerCase().includes(q);
      }

      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-24">
      
      {/* 1. Global Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <CuriolotLogo size="md" variant="dark" />

            <div className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-600">
              <a href="#catalog" className="hover:text-slate-950 transition flex items-center gap-1">
                <span>Marketplace</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-50 text-indigo-600 font-extrabold">Discover</span>
              </a>
              <a href="#comparison" className="hover:text-slate-950 transition">
                0% Fee Model
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md items-center relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search across all creators & digital assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs rounded-full border border-transparent focus:border-slate-300 focus:outline-none transition font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
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
              Sign In
            </button>

            <button
              type="button"
              onClick={() => openAuth("signup")}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-24 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>0% Platform Commission • Direct Payout to Your Gateway</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-[1.1] max-w-4xl mx-auto">
            Sell Digital Products. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600">
              Keep 100% of Your Revenue.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The independent creator marketplace for e-books, vector graphics, 3D elements, and templates. Connect your own payment gateway with zero holding periods and instant automated delivery.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              onClick={() => openAuth("seller")}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition shadow-xl shadow-slate-950/15 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Store for Free</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>

            <a
              href="#catalog"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-800 font-extrabold text-xs rounded-2xl transition shadow-2xs flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Explore Marketplace</span>
            </a>
          </div>

          <p className="text-[11px] text-slate-400 font-medium pt-1">
            No credit card required to start • Encrypted Cloudflare R2 Vault included
          </p>
        </div>
      </section>

      {/* 3. Metrics Strip */}
      <section className="border-y border-slate-200/80 bg-white py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-0.5">
              <p className="text-2xl sm:text-3xl font-black text-slate-950">0%</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Take Rate</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">Instant</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Settlement Speed</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl sm:text-3xl font-black text-slate-950">200+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Countries Supported</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">Cloudflare R2</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Encrypted File Vault</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Category Bar */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-2">
          {MARKETPLACE_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat.name)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : cat.highlight
                    ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mt-8 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {selectedCategory === "All Assets" ? "Trending Digital Works" : selectedCategory}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? `Showing results for "${searchQuery}"` : "Discover original creative assets published by independent creators"}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filteredProducts.length} Assets Found
          </span>
        </div>

        {/* Dynamic Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const productUsername = product.username || "aries";
            const isSaved = wishlist[product.id] || false;

            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className="relative aspect-4/3 w-full bg-black overflow-hidden flex items-center justify-center">
                  <img
                    src={product.coverUrl}
                    alt={product.title}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-white shadow-xs">
                      {product.badge}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-rose-600 transition shadow-xs cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? "text-rose-600 fill-rose-600" : ""}`} />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      <span>{product.category}</span>
                      <Link href={`/${productUsername}`} className="hover:text-slate-900 hover:underline">
                        @{productUsername}
                      </Link>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                      {product.title}
                    </h3>

                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {product.price === 0 ? (
                        <span className="text-base font-extrabold text-emerald-600">FREE</span>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-slate-900">
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
                      href={`/${productUsername}/${product.slug || product.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition active:scale-95 shadow-xs"
                    >
                      <span>View</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Comparison Table */}
      <section id="comparison" className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-10">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            Why Creators Switch to Curiolot
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare transparent direct selling against legacy fee-heavy platforms.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
              <tr>
                <th className="p-4 sm:p-5">Feature</th>
                <th className="p-4 sm:p-5 text-emerald-700 bg-emerald-50/50">Curiolot Commerce</th>
                <th className="p-4 sm:p-5 text-slate-400">Gumroad / Etsy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-800">Platform Commission</td>
                <td className="p-4 sm:p-5 font-extrabold text-emerald-700 bg-emerald-50/30">0% Cut</td>
                <td className="p-4 sm:p-5 text-slate-500">10% + $0.30 per sale</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-800">Payout Settlement</td>
                <td className="p-4 sm:p-5 font-extrabold text-emerald-700 bg-emerald-50/30">Instant Direct to Wallet</td>
                <td className="p-4 sm:p-5 text-slate-500">7 to 21 Days Holding</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-800">Payment Gateway Choice</td>
                <td className="p-4 sm:p-5 font-extrabold text-emerald-700 bg-emerald-50/30">PayPal, Stripe, Lemon, Paddle</td>
                <td className="p-4 sm:p-5 text-slate-500">Locked to platform processor</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-800">Custom Bio-Link Handle</td>
                <td className="p-4 sm:p-5 font-extrabold text-emerald-700 bg-emerald-50/30">store.curiolot.com/aries</td>
                <td className="p-4 sm:p-5 text-slate-500">Generic shop link</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Built-in Global Legal Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">Curiolot Commerce</span>
            <span>• Independent Digital Infrastructure</span>
          </div>
          <div className="flex items-center gap-5 text-slate-600 font-medium">
            <Link href="/terms" className="hover:text-slate-950 transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-950 transition">Privacy Policy</Link>
            <Link href="/dashboard" className="hover:text-slate-950 transition">Creator Dashboard</Link>
          </div>
        </div>
      </footer>

      {/* 7. Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-left">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
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
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${authMode === "login" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500"}`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${authMode === "signup" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500"}`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("seller")}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${authMode === "seller" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500"}`}
              >
                Open Store
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
                />
              </div>

              {authMode === "signup" && (
                <div className="flex items-start gap-2 text-left pt-1">
                  <input
                    type="checkbox"
                    id="termsCheck"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5"
                    required
                  />
                  <label htmlFor="termsCheck" className="text-[11px] text-slate-500">
                    I agree to the Terms of Service & Privacy Policy.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                {isSubmittingAuth ? "Processing..." : authMode === "login" ? "Log In" : "Continue"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
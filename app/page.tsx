"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  Layers, 
  Globe2, 
  CheckCircle2, 
  ShoppingBag, 
  Star, 
  Lock, 
  ArrowUpRight,
  TrendingUp,
  Percent,
  FileCheck
} from "lucide-react";
import Footer from "@/components/Footer";
import CuriolotLogo from "@/components/CuriolotLogo";

const TRENDING_PREVIEWS = [
  {
    id: "item_1",
    title: "The Beast Whisperer: Agent of Shadows",
    category: "E-Books & Guides",
    price: 4.99,
    originalPrice: 9.99,
    badge: "Bestseller",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    username: "aries",
    creator: "Aries Studio",
    rating: 4.9
  },
  {
    id: "item_2",
    title: "Floating Botanicals 3D Element Pack",
    category: "3D Assets",
    price: 19.00,
    originalPrice: 35.00,
    badge: "Staff Pick",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    username: "vanth",
    creator: "Vanth Underground",
    rating: 5.0
  },
  {
    id: "item_3",
    title: "Cyberpunk Vector Icons & Linocut Stamps",
    category: "Vectors & Logos",
    price: 8.50,
    originalPrice: 15.00,
    badge: "Trending",
    coverUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    username: "tokyoneo",
    creator: "Neo Design Lab",
    rating: 4.8
  },
  {
    id: "item_4",
    title: "Creator Economy Micro-SaaS Boilerplate",
    category: "Templates",
    price: 29.00,
    originalPrice: 49.00,
    badge: "Featured",
    coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    username: "devcuriolot",
    creator: "Curiolot Labs",
    rating: 4.9
  }
];

export default function LandingHomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* 1. Global Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo Resmi (Ikon Tas Belanja Rantai Curiolot) */}
          <CuriolotLogo size="md" variant="dark" />

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <Link href="/discover" className="hover:text-slate-950 transition flex items-center gap-1">
              <span>Marketplace</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-50 text-indigo-600">Discover</span>
            </Link>
            <Link href="/terms" className="hover:text-slate-950 transition">
              0% Fee Model
            </Link>
            <Link href="/terms" className="hover:text-slate-950 transition">
              Trust & Safety
            </Link>
          </div>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5"
            >
              <span>Start Selling</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>0% Platform Commission • Direct-to-Wallet Payout</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-[1.1] max-w-4xl mx-auto">
            Sell Digital Products. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600">
              Keep 100% of Your Revenue.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The independent creator infrastructure for e-books, vector packs, 3D assets, and templates. Connect your own payment gateway with zero holding periods and automated file delivery.
          </p>

          {/* Quick CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition shadow-xl shadow-slate-950/15 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Create Store for Free</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>

            <Link
              href="/discover"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-800 font-extrabold text-xs rounded-2xl transition shadow-2xs flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Explore Marketplace</span>
            </Link>
          </div>

          <p className="text-[11px] text-slate-400 font-medium pt-1">
            No credit card required to start • Free 50 MB Cloudflare R2 Vault included
          </p>
        </div>
      </section>

      {/* 3. Metrics Trust Strip */}
      <section className="border-y border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-950">0%</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Take Rate</p>
            </div>

            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">Instant</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Settlement Speed</p>
            </div>

            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-950">200+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Countries Supported</p>
            </div>

            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">Cloudflare R2</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Encrypted File Vault</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Core Pillars / Why Curiolot */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full inline-block">
            Engineered For Creators
          </h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            A frictionless shop built for zero financial lock-in.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Traditional marketplaces withhold your revenue for weeks and take 10% to 30% cuts. Curiolot eliminates the middleman entirely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Percent className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Zero-Escrow & 0% Fees</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We never touch your funds. Buyers transfer money directly to your PayPal, Stripe, Lemon Squeezy, or Paddle account.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Keep 100% of every sale
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Globe2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Multi-Gateway Freedom</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Works worldwide. Whether you prefer Stripe in the US, Lemon Squeezy in Europe for EU VAT handling, or local gateways in Asia.
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 6 Global gateway integrations
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Instant Automated Delivery</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Single-use download links are delivered to the buyer's screen immediately upon payment confirmation. Zero manual emails required.
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 24/7 autonomous fulfillment
            </span>
          </div>

        </div>
      </section>

      {/* 5. Live Marketplace Preview (Discover Teaser) */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold border border-white/15 text-slate-300 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Featured Digital Assets</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Trending on Curiolot Market
              </h3>
            </div>

            <Link
              href="/discover"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Explore all collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRENDING_PREVIEWS.map((item) => (
              <div 
                key={item.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden hover:border-slate-500 transition duration-300 flex flex-col justify-between"
              >
                <div className="aspect-4/3 bg-slate-950 relative overflow-hidden">
                  <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-black/80 border border-white/20 text-white uppercase">
                    {item.badge}
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{item.category}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 mt-0.5">{item.title}</h4>
                    <p className="text-[11px] text-indigo-400 font-semibold mt-1">@{item.username}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                    <span className="text-sm font-black text-white">${item.price.toFixed(2)}</span>
                    <Link
                      href={`/${item.username}`}
                      className="px-3 py-1 bg-white/10 hover:bg-white text-white hover:text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Comparison Table (Curiolot vs Others) */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
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

      {/* 7. Final Call to Action Strip */}
      <section className="bg-slate-950 text-white py-16 px-4 sm:px-6 text-center border-t border-slate-800">
        <div className="max-w-3xl mx-auto space-y-5">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to claim your storefront?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Join independent authors, 3D modelers, and graphic artists publishing their digital works with 0% commission.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-extrabold text-xs rounded-2xl transition shadow-lg shadow-emerald-500/25 inline-flex items-center gap-2"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Global Legal Footer */}
      <Footer />

    </div>
  );
}
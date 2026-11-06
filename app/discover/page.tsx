"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  Tag, 
  ArrowUpRight, 
  ShoppingBag, 
  Star,
  ExternalLink,
  Layers,
  Flame,
  Clock
} from "lucide-react";

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  badge?: string;
  coverUrl: string;
  username: string;
  creatorName: string;
  rating?: number;
  salesCount?: number;
}

// Mock showcase items to make the marketplace look vibrant immediately
const INITIAL_MARKETPLACE_PRODUCTS: ProductItem[] = [
  {
    id: "prod_1",
    title: "The Beast Whisperer: Agent of Shadows",
    slug: "the-beast-whisperer",
    category: "E-Books & Guides",
    price: 4.99,
    originalPrice: 9.99,
    badge: "Bestseller",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    username: "aries",
    creatorName: "Aries Studio",
    rating: 4.9,
    salesCount: 142
  },
  {
    id: "prod_2",
    title: "Floating Botanicals 3D Element Pack",
    slug: "floating-botanicals-3d",
    category: "3D Assets",
    price: 19.00,
    originalPrice: 35.00,
    badge: "Trending",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    username: "vanth",
    creatorName: "Vanth Underground",
    rating: 5.0,
    salesCount: 89
  },
  {
    id: "prod_3",
    title: "Cyberpunk Vector Icons & Linocut Stamps",
    slug: "cyberpunk-vector-icons",
    category: "Vectors & Logos",
    price: 8.50,
    originalPrice: 15.00,
    badge: "Hot",
    coverUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    username: "tokyoneo",
    creatorName: "Neo Design Lab",
    rating: 4.8,
    salesCount: 230
  },
  {
    id: "prod_4",
    title: "Creator Economy Micro-SaaS Boilerplate",
    slug: "microsaas-starter-kit",
    category: "Templates",
    price: 29.00,
    originalPrice: 49.00,
    badge: "Featured",
    coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    username: "devcuriolot",
    creatorName: "Curiolot Labs",
    rating: 4.9,
    salesCount: 310
  },
  {
    id: "prod_5",
    title: "Cinematic Dark Ambient Sound Library",
    slug: "cinematic-dark-ambient",
    category: "Digital Artwork",
    price: 12.00,
    originalPrice: 20.00,
    badge: "New",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    username: "soundforge",
    creatorName: "Aether Sound",
    rating: 4.7,
    salesCount: 64
  },
  {
    id: "prod_6",
    title: "Minimalist Notion Life OS & Goal Planner",
    slug: "notion-life-os",
    category: "Templates",
    price: 9.99,
    originalPrice: 18.00,
    badge: "Popular",
    coverUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
    username: "zenproductivity",
    creatorName: "Zen Space",
    rating: 5.0,
    salesCount: 412
  }
];

const CATEGORIES = [
  "All Categories",
  "E-Books & Guides",
  "Vectors & Logos",
  "3D Assets",
  "Templates",
  "Digital Artwork"
];

export default function DiscoverMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState<"trending" | "newest" | "price-asc" | "price-desc">("trending");
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_MARKETPLACE_PRODUCTS);

  // Fetch live products from user creation API
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const userProducts = data.map((item: any) => ({
            id: item.id || `prod_${Math.random()}`,
            title: item.title,
            slug: item.slug,
            category: item.category || "E-Books & Guides",
            price: Number(item.price) || 0,
            originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
            badge: item.badge || "Creator Pick",
            coverUrl: item.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
            username: item.username || "aries",
            creatorName: item.username === "aries" ? "Aries Studio" : (item.username || "Independent Creator"),
            rating: 5.0,
            salesCount: 12
          }));

          // Merge distinct items
          setProducts((prev) => {
            const combined = [...userProducts, ...prev.filter(p => p.username !== "aries")];
            return combined;
          });
        }
      })
      .catch((err) => console.error("Could not load dynamic products:", err));
  }, []);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const matchesCategory = 
          selectedCategory === "All Categories" || item.category === selectedCategory;
        const matchesQuery = 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "newest") return b.id.localeCompare(a.id);
        return (b.salesCount || 0) - (a.salesCount || 0); // Trending default
      });
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24 antialiased">
      
      {/* Top Global Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                C
              </div>
              <span className="font-extrabold tracking-tight text-slate-900 text-lg">
                curiolot <span className="text-indigo-600 font-medium text-xs">market</span>
              </span>
            </Link>

            <span className="hidden md:inline-block text-xs font-semibold text-slate-400 border-l border-slate-200 pl-4">
              Global Creator Discovery
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/new"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Start Selling</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Showcase Billboard Header (Redbubble/Gumroad style) */}
      <section className="bg-linear-to-b from-slate-900 to-slate-950 text-white py-14 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Discover Top Digital Works Worldwide</span>
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Explore Original Assets, E-Books & Design Works
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Direct from verified independent creators. Download production-ready templates, graphic packs, and novels with 0% platform tax.
          </p>

          {/* Large Central Search Input */}
          <div className="pt-3 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates, 3D vectors, novels, audio packs..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm font-medium shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filter Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Category Pills & Sort Tabs Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
          
          {/* Scrollable Categories List */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Filter Dropdown / Tabs */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="trending">🔥 Trending Now</option>
              <option value="newest">✨ New Arrivals</option>
              <option value="price-asc">💵 Price: Low to High</option>
              <option value="price-desc">💎 Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Showing <strong>{filteredProducts.length}</strong> creative digital items</span>
          {selectedCategory !== "All Categories" && (
            <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
              Filter: {selectedCategory}
            </span>
          )}
        </div>

        {/* Product Grid Showcase (Gumroad/Redbubble Layout) */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Product Cover Thumbnail */}
                <Link href={`/${product.username}`} className="block relative aspect-4/3 overflow-hidden bg-slate-900">
                  <img
                    src={product.coverUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-md uppercase tracking-wider border border-white/20">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/75 text-white text-[10px] font-mono rounded">
                    {product.category}
                  </span>
                </Link>

                {/* Details Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Creator Identity */}
                    <Link 
                      href={`/${product.username}`}
                      className="text-[11px] font-bold text-indigo-600 hover:underline truncate block"
                    >
                      @{product.username} • {product.creatorName}
                    </Link>

                    {/* Title */}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 line-clamp-2 leading-snug group-hover:text-indigo-600 transition">
                      {product.title}
                    </h3>
                  </div>

                  {/* Rating & Pricing Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 font-normal">({product.salesCount})</span>
                      </div>
                    </div>

                    <div className="text-right">
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[10px] text-slate-400 line-through mr-1 font-medium">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-sm font-black text-slate-900">
                        {product.price === 0 ? "FREE" : `$${product.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Direct Buy / View Button */}
                  <Link
                    href={`/${product.username}`}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                  >
                    <span>View Storefront</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No products found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No matching assets for "{searchQuery}". Try searching for another keyword or select All Categories.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
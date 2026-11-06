"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  ExternalLink, 
  Flame, 
  Sparkles, 
  ArrowUpRight, 
  Star,
  Eye,
  Store
} from "lucide-react";

export default function DashboardDiscoverPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Marketplace Discover</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse published digital assets across all creators on Curiolot to benchmark pricing and trends.
          </p>
        </div>

        <Link
          href="/discover"
          target="_blank"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <span>Open Public Marketplace</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Benchmark Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Catalogued Assets</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{products.length || 6}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Available across all creator stores</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Price Benchmark</p>
          <p className="mt-2 text-2xl font-black text-slate-900">$12.50</p>
          <p className="text-[10px] text-slate-400 mt-1">Highest sales conversion range ($4 - $19)</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Top Trending Format</p>
          <p className="mt-2 text-2xl font-black text-slate-900">ZIP & PDF</p>
          <p className="text-[10px] text-indigo-600 font-semibold mt-1">Bundles & Novel Guides</p>
        </div>
      </div>

      {/* Catalog Search & Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">All Creator Products</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore how other sellers package and price their assets.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search collective library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition"
            />
          </div>
        </div>

        {/* Mini Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((item: any) => (
            <div key={item.id} className="border border-slate-200 rounded-2xl p-3.5 space-y-3 bg-slate-50/50 hover:bg-white hover:shadow-md transition">
              <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden relative">
                <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/70 text-white px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </div>

              <div>
                <Link href={`/${item.username || "aries"}`} className="text-[10px] font-bold text-indigo-600 hover:underline">
                  @{item.username || "aries"}
                </Link>
                <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5">{item.title}</h3>
                <p className="text-xs font-black text-slate-900 mt-1">${Number(item.price).toFixed(2)}</p>
              </div>

              <Link
                href={`/${item.username || "aries"}`}
                target="_blank"
                className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
              >
                <span>Inspect Storefront</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
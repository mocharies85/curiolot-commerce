"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package
} from "lucide-react";
import type { Product } from "@/lib/products";

export default function YourProductsPage() {
  const username = "aries";
  const [products, setProducts] = useState<Product[]>([]);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "hidden">("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?username=${username}`);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: nextStatus } : p));
    await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: nextStatus }),
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const filtered = products.filter((p) => {
    const matchesTab = 
      filterTab === "all" ? true : filterTab === "active" ? p.isActive : !p.isActive;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Products</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your digital downloads, pricing, licenses, and visibility status.</p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2">
          {(["all", "active", "hidden"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                filterTab === tab
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading product inventory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No products found</p>
            <p className="text-[11px] text-slate-400">Add your first digital product to start selling.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-6">Product Type</th>
                <th className="py-3 px-6">Channel</th>
                <th className="py-3 px-6">Price</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-black overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                      <img src={item.coverUrl} alt={item.title} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-400">/{item.slug}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{item.category}</td>
                  <td className="py-4 px-6 text-slate-500">Curiolot Storefront</td>
                  <td className="py-4 px-6 font-bold text-slate-900">
                    {item.price === 0 ? "FREE" : `$${item.price.toFixed(2)}`}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id, item.isActive)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                      <span>{item.isActive ? "Active" : "Hidden"}</span>
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/${username}/${item.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title="View Live Product Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  ShoppingBag, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Edit3,
  HardDrive,
  DownloadCloud
} from "lucide-react";
import type { Product } from "@/lib/products";

export default function DashboardPage() {
  const username = "aries";
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data produk terbaru dari server saat halaman dimuat
  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?username=${username}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Hapus produk secara permanen
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    // Optimistic UI update
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("Failed to delete product:", err);
      fetchProducts(); // Rollback jika gagal
    }
  };

  // Toggle status visibility (Active / Hidden)
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: nextStatus } : p))
    );

    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      fetchProducts();
    }
  };

  const totalDownloads = products.reduce((acc, p) => acc + (p.downloads || 0), 0);
  const activeProducts = products.filter((p) => p.isActive).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 font-sans antialiased">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              CS
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">
              Curiolot Store Manager
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Mode: ★ Pro User
            </span>

            <Link
              href={`/${username}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full transition"
            >
              <span>View Public Store</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        
        {/* Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products & Inventory</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your digital downloads, pricing, and visibility status.
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-slate-800 transition active:scale-95 shadow-md shadow-slate-900/10 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Products</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{products.length}</span>
              <span className="text-xs font-medium text-emerald-600">{activeProducts} visible live</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Downloads</span>
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{totalDownloads}</span>
              <span className="text-xs text-slate-400 font-medium">lifetime accesses</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Plan Status</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">Pro</span>
              <span className="text-xs text-slate-400 font-medium">0% Platform Fee</span>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">All Products</h2>
            <span className="text-xs text-slate-400 font-medium">{products.length} items</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading inventory...
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Your inventory is empty</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All sample products have been removed. Click below to add your first real digital asset.
              </p>
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-6">Product</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Price</th>
                    <th className="py-3 px-6">Downloads</th>
                    <th className="py-3 px-6 text-center">Visibility</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img
                          src={p.coverUrl}
                          alt={p.title}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{p.title}</p>
                          <p className="text-[11px] text-slate-400">store.curiolot.com/{username}/{p.slug}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{p.category}</td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {p.price === 0 ? "Free" : `$${p.price.toFixed(2)}`}
                      </td>
                      <td className="py-4 px-6 text-slate-500">{p.downloads || 0} downloads</td>
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p.id, p.isActive)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                            p.isActive 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {p.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{p.isActive ? "Active" : "Hidden"}</span>
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/${username}/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Preview Public Page"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
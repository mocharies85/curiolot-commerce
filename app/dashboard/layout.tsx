"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  LayoutDashboard,
  Package,
  Compass,
  Image as ImageIcon,
  Store,
  DollarSign,
  Share2,
  ExternalLink,
  Bell,
  Sparkles,
  Link2,
  LogOut,
} from "lucide-react";
import CuriolotLogo from "@/components/CuriolotLogo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    name: "",
    username: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("curiolot_session");

      // Tolak pengunjung tanpa sesi aktif dan arahkan ke halaman login
      if (!stored) {
        router.replace("/login");
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        const resolvedUsername =
          parsed.username ||
          (parsed.email ? parsed.email.split("@")[0].toLowerCase() : "");

        if (!resolvedUsername) {
          localStorage.removeItem("curiolot_session");
          router.replace("/login");
          return;
        }

        const resolvedName =
          parsed.name ||
          resolvedUsername.charAt(0).toUpperCase() + resolvedUsername.slice(1);

        setCurrentUser({
          name: resolvedName,
          username: resolvedUsername,
        });
        setIsCheckingAuth(false);
      } catch (e) {
        localStorage.removeItem("curiolot_session");
        router.replace("/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("curiolot_session");
    router.replace("/login");
  };

  // Tahan tampilan dasbor selama pengecekan sesi belum lolos
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Verifying creator session...</p>
        </div>
      </div>
    );
  }

  // Sidebar navigation menu items
  const NAV_ITEMS = [
    { label: "Creator Hub", href: "/dashboard", icon: LayoutDashboard },
    { label: "Your Products", href: "/dashboard/products", icon: Package },
    { label: "Marketplace Discover", href: "/dashboard/discover", icon: Compass },
    { label: "Image Library", href: "/dashboard/library", icon: ImageIcon },
    { label: "Your Store", href: "/dashboard/store", icon: Store },
    { label: "Sales Channels", href: "/dashboard/channels", icon: Share2 },
    { label: "Earnings & Payout", href: "/dashboard/earnings", icon: DollarSign },
  ];

  const initials = (currentUser.name || currentUser.username || "CR")
    .split(/\s+/)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-50">
        <div>
          {/* Brand Logo & Header */}
          <div className="h-16 px-6 flex items-center border-b border-slate-100">
            <CuriolotLogo size="sm" variant="dark" />
          </div>

          <div className="p-4 space-y-4">
            {/* Primary Action Button: Create Product */}
            <Link
              href="/dashboard/new"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-emerald-600/15"
            >
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
              <span>Create Product</span>
            </Link>

            {/* Navigation Menu List */}
            <nav className="space-y-1 pt-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-emerald-600" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Cross-App Shortcut: Curiolot Link Dashboard */}
              <div className="pt-2 mt-2 border-t border-slate-100">
                <a
                  href="https://link.curiolot.com/admin"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/70 transition"
                >
                  <Link2 className="w-4 h-4 text-emerald-600" />
                  <span>Curiolot Link</span>
                </a>
              </div>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer: Storefront Link & Account Profile */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <Link
            href={`/${currentUser.username}`}
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold flex items-center justify-between transition"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                store.curiolot.com/{currentUser.username}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Store Dashboard</span>
            <span>/</span>
            <span className="text-slate-900 font-bold capitalize">
              {pathname === "/dashboard"
                ? "Creator Hub"
                : pathname.split("/").pop()?.replace("-", " ")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Pro Plan Active</span>
            </div>

            <button
              type="button"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
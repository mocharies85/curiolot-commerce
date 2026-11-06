export const runtime = "edge";

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Share2, 
  ExternalLink,
  Check
} from "lucide-react";

interface ProductData {
  slug: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  fileFormat?: string;
  fileSize?: string;
  license?: string;
  description: string;
  features: string[];
  coverUrl: string;
  paymentUrl?: string;
  sellerCheckoutUrl?: string;
  badge?: string;
}

// Fallback database untuk produk demo/bawaan
const FALLBACK_PRODUCTS: ProductData[] = [
  {
    slug: "linocut-animal-pack",
    title: "Minimalist Linocut Animal Pack",
    category: "Vector Assets",
    price: 9.00,
    originalPrice: 15.00,
    fileFormat: "ZIP (AI, EPS, SVG, High-Res PNG)",
    fileSize: "65.4 MB",
    license: "Standard Commercial License Included",
    description: `A collection of 30 handcrafted minimalist linocut animal illustrations designed for modern branding, apparel prints, packaging, and digital merchandise.

Every illustration is crafted as a clean vector path, allowing infinite scaling without quality degradation. Color fills and line weights are fully customizable in Adobe Illustrator, Affinity Designer, or Figma.`,
    features: [
      "30 Unique Hand-Drawn Animal Vector Illustrations",
      "Master files in .AI (Adobe Illustrator CC) & .EPS (Vector standard)",
      "Individual SVG files for web and direct vector drag-and-drop",
      "High-resolution transparent PNG files (4000 × 4000 px, 300 DPI)",
      "Commercial use allowed for unlimited client and commercial projects"
    ],
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    sellerCheckoutUrl: "https://buy.stripe.com/test_demo"
  },
  {
    slug: "3d-floating-botanical",
    title: "3D Floating Botanical Objects",
    category: "3D Assets",
    price: 19.00,
    originalPrice: 25.00,
    fileFormat: "ZIP (BLEND, 4K Transparent PNG)",
    fileSize: "320.5 MB",
    license: "Commercial Royalty-Free License",
    description: `A high-end 3D visual pack featuring 20 floating botanical elements and modern abstract flora renders. 

Rendered natively in 4K resolution with realistic subsurface scattering and soft studio lighting. Includes ready-to-use PNG cutouts and complete Blender project scenes for full material adjustment.`,
    features: [
      "20 Pre-rendered 4K Transparent PNG files (3840 × 2160 px)",
      "Complete Blender 4.x scene files (.blend) with shader trees",
      "Cycles & Eevee render engine ready setups",
      "High-resolution roughness and displacement maps included",
      "Royalty-free for digital apps, websites, and commercial campaigns"
    ],
    coverUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80",
    sellerCheckoutUrl: "https://buy.stripe.com/test_demo"
  },
  {
    slug: "microstock-playbook-2026",
    title: "Microstock Research Playbook 2026",
    category: "E-Books & Guides",
    price: 0.00,
    originalPrice: 12.00,
    fileFormat: "PDF Document + Notion Tracker Template",
    fileSize: "18.2 MB",
    license: "Personal Learning & Implementation License",
    description: `A battle-tested playbook designed to help digital creators and microstock contributors identify high-demand, low-competition commercial niches across global marketplaces.

Learn the exact framework to research buyer search intent, spot quarterly trend cycles, and build high-converting metadata that ranks on Adobe Stock and Shutterstock.`,
    features: [
      "120-Page Comprehensive PDF Research Guide",
      "Microstock Annual Trend Calendar & Demand Forecasting",
      "High-Converting Metadata & Tagging Formulas",
      "Curated Niche Inspiration Notion Database",
      "Direct instant download without subscription lock"
    ],
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80",
    sellerCheckoutUrl: ""
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const username = (params?.username as string) || "aries";
  const slug = (params?.slug as string) || "";

  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!username || !slug) return;

    // 1. Coba ambil produk dari API backend
    fetch(`/api/products?username=${username}&slug=${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not in API");
        return res.json();
      })
      .then((data: ProductData) => {
        setProduct({
          ...data,
          license: data.license || "Standard Commercial License Included",
          fileSize: data.fileSize || "Digital Archive",
          features: Array.isArray(data.features) 
            ? data.features 
            : typeof data.features === "string" 
            ? (data.features as string).split("\n").filter((f: string) => f.trim() !== "")
            : []
        });
      })
      .catch(() => {
        // 2. Jika tidak ada di API, cocokkan dengan fallback database
        const fallback = FALLBACK_PRODUCTS.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
        setProduct(fallback || null);
      })
      .finally(() => setIsLoading(false));
  }, [username, slug]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-400 text-xs font-semibold">
        Loading product details...
      </div>
    );
  }

  // Jika produk benar-benar tidak ditemukan
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Product Not Found</h1>
        <p className="text-sm text-slate-500 mt-2">The digital product you are looking for does not exist.</p>
        <Link
          href={`/${username}`}
          className="mt-6 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  const checkoutLink = product.paymentUrl || product.sellerCheckoutUrl || "#";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 font-sans antialiased">
      {/* 1. Header Navigasi */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">store.curiolot.com/{username}</span>
            <button 
              type="button"
              onClick={handleShare}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer relative"
              title="Copy link to product"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Konten Detail Produk */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Kolom Kiri: Cover & Deskripsi */}
          <div className="lg:col-span-7 space-y-8">
            <div className="rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-xs">
              <div className="relative aspect-4/3 w-full bg-black overflow-hidden flex items-center justify-center">
                <img
                  src={product.coverUrl}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-md bg-slate-900/90 border border-white/20 text-white">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900">About This Product</h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                    What's Inside The Download
                  </h3>
                  <ul className="space-y-3">
                    {product.features.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Panel Checkout Sticky */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg shadow-slate-200/40 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  {product.category}
                </span>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {product.title}
                </h1>
              </div>

              {/* Harga Dinamis */}
              <div className="flex items-baseline gap-3 pb-6 border-b border-slate-100">
                {product.price === 0 ? (
                  <span className="text-3xl font-black text-emerald-600">FREE</span>
                ) : (
                  <>
                    <span className="text-3xl font-black text-slate-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <>
                        <span className="text-sm font-medium text-slate-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                        <span className="ml-auto px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60">
                          Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Tombol Aksi Beli / Unduh Gratis */}
              <div className="space-y-3">
                {product.price === 0 ? (
                  <button
                    type="button"
                    onClick={() => alert("Free download link generated!")}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition active:scale-95 shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Free Resource</span>
                  </button>
                ) : (
                  <a
                    href={checkoutLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition active:scale-95 shadow-md shadow-slate-900/10 cursor-pointer"
                  >
                    <span>Buy Now & Instant Download</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <p className="text-[11px] text-center text-slate-400">
                  {product.price === 0
                    ? "Direct instant access provided upon request"
                    : "Direct payment processed securely via creator's gateway"}
                </p>
              </div>

              {/* Detail Spesifikasi File */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">File Type:</span>
                  <span className="font-semibold text-slate-800">{product.fileFormat || "PDF"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Size:</span>
                  <span className="font-semibold text-slate-800">{product.fileSize || "Digital Archive"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">License:</span>
                  <span className="font-semibold text-slate-800">{product.license || "Standard Commercial License Included"}</span>
                </div>
              </div>

              {/* Keamanan */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Instant file download link delivered upon completion</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified clean & virus-scanned digital archive</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
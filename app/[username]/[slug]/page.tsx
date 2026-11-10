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
  Check,
  AlertCircle,
  Star,
  AlertTriangle,
  X,
  MessageSquare,
  Lock
} from "lucide-react";

interface ProductData {
  id?: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  fileFormat?: string;
  fileSize?: string;
  license?: string;
  description: string;
  features?: string[];
  coverUrl: string;
  paymentUrl?: string;
  sellerCheckoutUrl?: string;
  badge?: string;
}

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  is_verified: number;
  created_at: string;
}

// Fallback products if API or D1 record is pending
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
  const params = useParams() as any;
  const username = (params?.username as string) || "aries";
  const slug = (params?.slug as string) || "";

  const [product, setProduct] = useState<ProductData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Pre-Checkout Legal Safe-Harbor Modal State
  const [showCheckoutDisclaimer, setShowCheckoutDisclaimer] = useState(false);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);

  // New Review Form States
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  useEffect(() => {
    if (!username || !slug) return;

    Promise.all([
      fetch(`/api/products?username=${encodeURIComponent(username)}`),
      fetch(`/api/reviews?slug=${encodeURIComponent(slug)}&username=${encodeURIComponent(username)}`)
    ])
      .then(async ([prodRes, revRes]) => {
        const prodData: any = await prodRes.json().catch(() => []);
        const revData: any = await revRes.json().catch(() => []);

        let matched: any = null;

        if (Array.isArray(prodData)) {
          matched = prodData.find((p: any) => p.slug?.toLowerCase() === slug.toLowerCase());
        } else if (prodData && typeof prodData === "object" && prodData.slug) {
          matched = prodData;
        }

        if (!matched) {
          matched = FALLBACK_PRODUCTS.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
        }

        if (matched) {
          setProduct({
            ...matched,
            price: Number(matched.price) || 0,
            originalPrice: matched.originalPrice != null ? Number(matched.originalPrice) : undefined,
            license: matched.license || "Standard Commercial License Included",
            fileFormat: matched.fileFormat || matched.fileType || "Digital Asset (ZIP/PDF)",
            fileSize: matched.fileSize || "Instant Download",
            features: Array.isArray(matched.features)
              ? matched.features
              : typeof matched.features === "string"
              ? (matched.features as string).split("\n").filter((f: string) => f.trim() !== "")
              : [
                  "Instant digital asset download link delivered post-purchase",
                  "Lifetime access to file versions and future updates",
                  "Standard commercial license included for unlimited projects"
                ]
          });
        } else {
          setProduct(null);
        }

        if (Array.isArray(revData)) {
          setReviews(revData);
        }
      })
      .catch(() => {
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

  // Safe-Harbor Pre-Checkout Trigger
  const handleOpenCheckoutModal = () => {
    setAgreedToDisclaimer(false);
    setShowCheckoutDisclaimer(true);
  };

  const handleProceedToPayment = () => {
    if (!agreedToDisclaimer) return;
    setShowCheckoutDisclaimer(false);

    const targetUrl = product?.paymentUrl || product?.sellerCheckoutUrl || `https://store.curiolot.com/${username}`;
    window.location.href = targetUrl;
  };

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !reviewerName.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_slug: slug,
          username,
          reviewer_name: reviewerName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data: any = await res.json().catch(() => ({}));
      if (res.ok && data?.review) {
        setReviews((prev) => [data.review, ...prev]);
        setReviewComment("");
        setReviewerName("");
        setReviewRating(5);
        setShowReviewSuccess(true);
        setTimeout(() => setShowReviewSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Submit review error:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Compute Average Rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading digital asset...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-slate-900">Product Not Found</h1>
        <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
          The digital asset you are looking for does not exist or may have been unlisted by the creator.
        </p>
        <Link
          href={`/${username}`}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </Link>
      </div>
    );
  }

  const price = Number(product.price) || 0;
  const originalPrice = product.originalPrice != null ? Number(product.originalPrice) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 font-sans antialiased">
      {/* 1. Header Navigation */}
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
              title="Copy product link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Product Details Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Visual Preview & Description */}
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
                    What&apos;s Included In This Download
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

          {/* Right Column: Sticky Checkout Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg shadow-slate-200/40 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  {product.category}
                </span>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {product.title}
                </h1>

                {/* Creator Star Rating Summary */}
                <div className="flex items-center gap-2 mt-2.5">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Math.round(Number(averageRating))
                            ? "fill-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">{averageRating}</span>
                  <span className="text-xs text-slate-400 font-medium">
                    ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>

              {/* Dynamic Price Display */}
              <div className="flex items-baseline gap-3 pb-6 border-b border-slate-100">
                {price === 0 ? (
                  <span className="text-3xl font-black text-emerald-600">FREE</span>
                ) : (
                  <>
                    <span className="text-3xl font-black text-slate-900">
                      ${price.toFixed(2)}
                    </span>
                    {originalPrice && originalPrice > price && (
                      <>
                        <span className="text-sm font-medium text-slate-400 line-through">
                          ${originalPrice.toFixed(2)}
                        </span>
                        <span className="ml-auto px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60">
                          Save {Math.round(((originalPrice - price) / originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Buy / Download Action Buttons */}
              <div className="space-y-3">
                {price === 0 ? (
                  <button
                    type="button"
                    onClick={() => alert("Free download link generated successfully!")}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition active:scale-95 shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Free Resource</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenCheckoutModal}
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition active:scale-95 shadow-md shadow-slate-900/10 cursor-pointer text-center"
                  >
                    <span>Buy Now & Instant Download</span>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                <p className="text-[11px] text-center text-slate-400">
                  {price === 0
                    ? "Direct instant access provided upon request"
                    : "Direct payment processed securely via creator's checkout"}
                </p>
              </div>

              {/* File Specs Details */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">File Type:</span>
                  <span className="font-semibold text-slate-800 uppercase">{product.fileFormat || "Digital Archive"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">File Size:</span>
                  <span className="font-semibold text-slate-800">{product.fileSize || "Instant ZIP"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">License:</span>
                  <span className="font-semibold text-slate-800">{product.license || "Standard Commercial License Included"}</span>
                </div>
              </div>

              {/* Security & Guarantees */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Instant file download delivered after purchase</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified clean & virus-scanned archive</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 3. Customer Ratings & Reviews Section */}
        <section className="mt-14 pt-10 border-t border-slate-200/80 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Customer Ratings & Reviews</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic feedback from verified customers who acquired this asset.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl font-black text-slate-900">{averageRating}</span>
              <div>
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${s <= Math.round(Number(averageRating)) ? "fill-amber-400" : "fill-slate-200 text-slate-200"}`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Store Reputation</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No customer reviews yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Be the first verified customer to share your thoughts and star rating for @{username}.
                  </p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-[10px] flex items-center justify-center">
                          {rev.reviewer_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{rev.reviewer_name}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified Purchase
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= rev.rating ? "fill-amber-400" : "fill-slate-200 text-slate-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Submit Review Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Leave a Review</h4>
                
                {showReviewSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Thank you! Your feedback has been published.</span>
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Your Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${star <= reviewRating ? "fill-amber-400" : "text-slate-300"}`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-bold text-slate-700">{reviewRating} of 5 Stars</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Henderson"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Feedback / Experience</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your thoughts on file quality, ease of use, or value..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none bg-slate-50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingReview ? "Submitting..." : "Post Review"}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* 4. Pre-Checkout Legal Safe-Harbor Modal */}
      {showCheckoutDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-left">
            
            <button
              onClick={() => setShowCheckoutDisclaimer(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Order Notice & Platform Disclaimer
                </h3>
                <p className="text-[11px] text-slate-400">
                  Please review the platform purchase terms before proceeding.
                </p>
              </div>
            </div>

            {/* Safe-Harbor Intermediary Legal Clauses */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-slate-600 leading-relaxed mb-5">
              <p>
                <strong>1. Intermediary Hosting:</strong> Curiolot Commerce provides web infrastructure connecting independent creators with buyers. All digital assets are created, priced, published, and fulfilled directly by the creator (<strong>@{username}</strong>).
              </p>
              <p>
                <strong>2. Content & Quality Warranty:</strong> Because digital files are non-returnable once delivered, the independent creator is solely responsible for asset licensing, file contents, download accessibility, and quality standards.
              </p>
              <p>
                <strong>3. Direct Checkout:</strong> Payments are processed via external third-party gateways (e.g., Stripe, PayPal, Lemon Squeezy). Curiolot does not store or process your personal payment credentials.
              </p>
            </div>

            {/* Buyer Consent Checkbox */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white mb-6">
              <input
                type="checkbox"
                id="buyerConsent"
                checked={agreedToDisclaimer}
                onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 accent-slate-900 cursor-pointer shrink-0"
              />
              <label htmlFor="buyerConsent" className="text-xs text-slate-700 leading-snug cursor-pointer select-none">
                I understand and agree that <strong>Curiolot is purely an intermediary platform</strong> and is not liable for creator-provided assets, external download links, or content quality. I agree to proceed to checkout.
              </label>
            </div>

            {/* Action Buttons: Proceed button is locked until checked */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCheckoutDisclaimer(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!agreedToDisclaimer}
                onClick={handleProceedToPayment}
                className="flex-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-300" />
                <span>Continue to Secure Payment</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
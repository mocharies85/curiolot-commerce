"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  UploadCloud, 
  DollarSign, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Info, 
  Lock, 
  X, 
  FileCheck, 
  HardDrive, 
  Eye,
  Save,
  Loader2,
  AlertTriangle,
  Link2,
  Globe
} from "lucide-react";
import type { PayoutProvider } from "@/lib/storeSettings";

const DEFAULT_COVER_IMAGE = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";

export default function NewProductPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const storedSession = localStorage.getItem("curiolot_session");
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          if (parsed?.username) return parsed.username.toLowerCase();
          if (parsed?.name) return parsed.name.toLowerCase().replace(/\s+/g, "");
          if (parsed?.email) return parsed.email.split("@")[0].toLowerCase();
        } catch (e) {}
      }
    }
    return "aries";
  });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const [isPro, setIsPro] = useState(false);
  const [currentProductCount, setCurrentProductCount] = useState(0);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("E-Books & Guides");
  const [price, setPrice] = useState("4.99");
  const [originalPrice, setOriginalPrice] = useState("9.99");
  const [isFree, setIsFree] = useState(false);
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [uploadCoverName, setUploadCoverName] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [fileFormat, setFileFormat] = useState("PDF");
  const [badge, setBadge] = useState("New Release");
  
  // Custom Payment Link Toggle States
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [customProductUrl, setCustomProductUrl] = useState("");

  // Product archive file state & R2 Upload
  const [productFileName, setProductFileName] = useState<string | null>(null);
  const [productFileSize, setProductFileSize] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [isUploadingProductFile, setIsUploadingProductFile] = useState(false);

  const [showProModal, setShowProModal] = useState(false);
  const [modalReason, setModalReason] = useState<"storage" | "product_limit">("storage");
  const [attemptedFileSize, setAttemptedFileSize] = useState("");

  const [payoutProvider, setPayoutProvider] = useState<PayoutProvider>("paypal");
  const [paypalHandle, setPaypalHandle] = useState("sigaries85@gmail.com");
  const [stripeUrl, setStripeUrl] = useState("");
  const [lemonSqueezyUrl, setLemonSqueezyUrl] = useState("");
  const [paddleUrl, setPaddleUrl] = useState("");
  const [kofiUrl, setKofiUrl] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const FREE_MAX_SIZE_MB = 50;
  const PRO_MAX_SIZE_GB = 2;
  const FREE_PRODUCT_LIMIT = 5;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLocalHandle = localStorage.getItem("curiolot_paypal_handle");
      if (savedLocalHandle && savedLocalHandle !== "aries") {
        setPaypalHandle(savedLocalHandle);
      }
    }

    // Auto-ping status keaktifan kreator ke D1 database setiap kali halaman ini dibuka
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        lastActiveAt: new Date().toISOString(),
      }),
    }).catch(() => {});

    fetch(`/api/settings?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data) {
          const rawProvider = data.payoutProvider || data.payout_provider || data.provider;
          if (rawProvider) {
            setPayoutProvider(String(rawProvider).toLowerCase() as PayoutProvider);
          }
          
          const rawHandle = data.payoutPaypalHandle || data.paypalHandle || data.payout_paypal_handle || data.paypal_handle || data.paypalEmail || data.payout_paypal_email;
          if (rawHandle && rawHandle !== "aries") {
            setPaypalHandle(rawHandle);
            if (typeof window !== "undefined") {
              localStorage.setItem("curiolot_paypal_handle", rawHandle);
            }
          } else {
            setPaypalHandle("sigaries85@gmail.com");
          }

          const rawLemon = data.payoutLemonSqueezyUrl || data.lemonSqueezyUrl || data.payout_lemonsqueezy_url || data.lemonsqueezy_url;
          if (rawLemon) setLemonSqueezyUrl(rawLemon);

          const rawStripe = data.payoutStripeUrl || data.stripeUrl || data.payout_stripe_url;
          if (rawStripe) setStripeUrl(rawStripe);

          const rawPaddle = data.payoutPaddleUrl || data.paddleUrl || data.payout_paddle_url;
          if (rawPaddle) setPaddleUrl(rawPaddle);

          const rawKofi = data.payoutKofiUrl || data.kofiUrl || data.payout_kofi_url;
          if (rawKofi) setKofiUrl(rawKofi);

          const rawCustom = data.payoutCustomUrl || data.customUrl || data.payout_custom_url;
          if (rawCustom) setCustomUrl(rawCustom);

          if (typeof data.isPro !== "undefined") {
            setIsPro(Boolean(data.isPro));
          } else if (data.plan) {
            setIsPro(data.plan === "pro");
          } else if (typeof data.is_pro !== "undefined") {
            setIsPro(Boolean(data.is_pro));
          }
        }
      })
      .catch((err) => console.error("Failed to load payout settings:", err));

    fetch(`/api/products?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((products: any) => {
        if (Array.isArray(products)) {
          setCurrentProductCount(products.length);

          const params = new URLSearchParams(window.location.search);
          const targetId = params.get("edit");

          if (targetId) {
            setEditId(targetId);
            setIsLoadingProduct(true);
            const currentProduct = products.find((p: any) => p.id === targetId);
            if (currentProduct) {
              setTitle(currentProduct.title || "");
              setSlug(currentProduct.slug || "");
              setCategory(currentProduct.category || "E-Books & Guides");
              setPrice(currentProduct.price !== undefined ? String(currentProduct.price) : "4.99");
              setOriginalPrice(currentProduct.originalPrice ? String(currentProduct.originalPrice) : "");
              setIsFree(currentProduct.price === 0);
              setBadge(currentProduct.badge || "");
              setCoverUrl(currentProduct.coverUrl || "");
              setFileFormat(currentProduct.fileFormat || "PDF");
              setProductFileSize(currentProduct.fileSize || "4.5 MB");
              setProductFileName(currentProduct.title ? `${currentProduct.title}.${(currentProduct.fileFormat || "PDF").toLowerCase()}` : "Attached File");
              setDescription(currentProduct.description || "");

              if (currentProduct.fileUrl) {
                setFileUrl(currentProduct.fileUrl);
              }

              const existingPayUrl = currentProduct.paymentUrl || currentProduct.sellerCheckoutUrl || "";
              if (existingPayUrl) {
                setCustomProductUrl(existingPayUrl);
                if (
                  !existingPayUrl.includes("paypal.com/cgi-bin/webscr") && 
                  !existingPayUrl.includes("paypal.me/")
                ) {
                  setUseCustomUrl(true);
                }
              }

              const rawInside = currentProduct.whatsInside ?? currentProduct.whats_inside ?? currentProduct.features;
              if (typeof rawInside === "string") {
                try {
                  const parsed = JSON.parse(rawInside);
                  if (Array.isArray(parsed)) {
                    setFeatures(parsed.join("\n"));
                  } else {
                    setFeatures(rawInside);
                  }
                } catch {
                  setFeatures(rawInside);
                }
              } else if (Array.isArray(rawInside)) {
                setFeatures(rawInside.join("\n"));
              } else {
                setFeatures("");
              }
            }
            setIsLoadingProduct(false);
          } else {
            if (!isPro && products.length >= FREE_PRODUCT_LIMIT) {
              setModalReason("product_limit");
              setShowProModal(true);
            }
          }
        }
      })
      .catch((err) => console.error("Failed to load products count:", err));
  }, [username, isPro]);

  // GENERATOR LINK OTOMATIS: Mendukung PayPal Standard Checkout dengan Auto-Return ke /success
  const autoLockedPaymentUrl = useMemo(() => {
    if (isFree) return "";
    const numericPrice = parseFloat(price) || 0;
    const cleanProvider = String(payoutProvider || "paypal").toLowerCase().trim();

    switch (cleanProvider) {
      case "stripe":
        return stripeUrl || "https://buy.stripe.com";
      case "lemonsqueezy":
        return lemonSqueezyUrl || "https://lemonsqueezy.com";
      case "paddle":
        return paddleUrl || "https://paddle.com";
      case "kofi":
        return kofiUrl || "https://ko-fi.com/curiolot";
      case "custom":
        return customUrl || "#";
      case "paypal":
      default: {
        let cleanBusiness = (paypalHandle || "").trim();

        if (cleanBusiness.startsWith("http")) {
          cleanBusiness = cleanBusiness
            .replace(/^https?:\/\/paypal\.me\//i, "")
            .replace(/\/.*$/, "")
            .trim();
        }

        if (!cleanBusiness || cleanBusiness === "aries") {
          cleanBusiness = "sigaries85@gmail.com";
        }

        const returnSuccessUrl = `https://store.curiolot.com/${username}/success?product=${encodeURIComponent(slug || "product")}`;

        const baseUrl = "https://www.paypal.com/cgi-bin/webscr";
        const params = new URLSearchParams({
          cmd: "_xclick",
          business: cleanBusiness,
          item_name: title || "Digital Product Asset",
          amount: numericPrice.toFixed(2),
          currency_code: "USD",
          no_shipping: "1",
          return: returnSuccessUrl,
        });

        return `${baseUrl}?${params.toString()}`;
      }
    }
  }, [isFree, price, payoutProvider, paypalHandle, stripeUrl, lemonSqueezyUrl, paddleUrl, kofiUrl, customUrl, title, slug, username]);

  const resolvedFinalPaymentUrl = useMemo(() => {
    if (isFree) return "";
    if (useCustomUrl && customProductUrl.trim()) {
      return customProductUrl.trim();
    }
    return autoLockedPaymentUrl;
  }, [isFree, useCustomUrl, customProductUrl, autoLockedPaymentUrl]);

  const getGatewayLabel = () => {
    const cleanProvider = String(payoutProvider || "paypal").toLowerCase().trim();
    switch (cleanProvider) {
      case "paypal": return "PayPal Standard Checkout (Auto-Return to Download)";
      case "stripe": return "Stripe Checkout";
      case "lemonsqueezy": return "Lemon Squeezy Store";
      case "paddle": return "Paddle Checkout";
      case "kofi": return "Ko-fi / Buy Me a Coffee";
      case "custom": return "Custom / Regional Gateway";
      default: return "PayPal Standard Checkout (Auto-Return to Download)";
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size exceeds 10 MB limit. Please select a smaller image.");
      return;
    }

    setUploadCoverName(file.name);
    setIsUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("username", username);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to upload cover artwork to Cloudflare R2.");
      }

      setCoverUrl(data.url);
    } catch (err: any) {
      console.error("Cover artwork upload error:", err);
      alert("Cover artwork upload failed: " + (err.message || "Network error"));
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Upload file arsip produk digital ke Cloudflare R2
  const handleProductFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    if (fileExt) {
      setFileFormat(fileExt.toUpperCase());
    }

    const sizeInMB = file.size / (1024 * 1024);

    if (!isPro && sizeInMB > FREE_MAX_SIZE_MB) {
      setAttemptedFileSize(`${sizeInMB.toFixed(1)} MB`);
      setModalReason("storage");
      setShowProModal(true);
      if (productFileInputRef.current) productFileInputRef.current.value = "";
      return;
    }

    if (sizeInMB > PRO_MAX_SIZE_GB * 1024) {
      alert("File exceeds the maximum Pro account limit of 2 GB.");
      if (productFileInputRef.current) productFileInputRef.current.value = "";
      return;
    }

    setProductFileName(file.name);
    setProductFileSize(
      sizeInMB >= 1024 
        ? `${(sizeInMB / 1024).toFixed(2)} GB` 
        : `${sizeInMB.toFixed(1)} MB`
    );

    setIsUploadingProductFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("username", username);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to upload product file to Cloudflare R2.");
      }

      setFileUrl(data.url);
    } catch (err: any) {
      console.error("Product file upload error:", err);
      alert("Product file upload failed: " + (err.message || "Network error"));
    } finally {
      setIsUploadingProductFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      alert("Please provide a valid product title.");
      return;
    }

    if (!editId && !isPro && currentProductCount >= FREE_PRODUCT_LIMIT) {
      setModalReason("product_limit");
      setShowProModal(true);
      return;
    }

    setIsSubmitting(true);

    const productPayload = {
      id: editId || `prod_${Date.now()}`,
      title,
      slug: slug || `product-${Date.now()}`,
      category,
      price: isFree ? 0 : parseFloat(price) || 0,
      originalPrice: isFree || !originalPrice ? null : parseFloat(originalPrice) || null,
      badge: badge.trim() || undefined,
      coverUrl: coverUrl || DEFAULT_COVER_IMAGE,
      paymentUrl: resolvedFinalPaymentUrl,
      sellerCheckoutUrl: resolvedFinalPaymentUrl,
      fileFormat,
      fileSize: productFileSize || "4.5 MB",
      fileUrl: fileUrl || "",
      license: "Standard Commercial License Included",
      description,
      features: features.split("\n").filter((f) => f.trim() !== ""),
      whatsInside: features,
      whats_inside: features,
      username,
    };

    try {
      const res = await fetch("/api/products", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      if (res.ok) {
        alert(editId ? "Product updated successfully!" : "Product published successfully!");
        router.push("/dashboard/products");
      } else {
        const errorData: any = await res.json().catch(() => ({}));
        if (res.status === 403) {
          setModalReason("product_limit");
          setShowProModal(true);
        } else {
          alert(errorData.error || (editId ? "Failed to update product." : "Failed to publish product. Please check form inputs."));
        }
      }
    } catch (err) {
      console.error("Failed to persist product:", err);
      alert("An unexpected error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3 text-slate-500 font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
        <p className="text-xs font-semibold">Loading product data for editing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 font-sans antialiased">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Back</span>
          </Link>

          <div className="flex items-center gap-3">
            <div
              className={`text-[11px] font-semibold px-3.5 py-1.5 rounded-full border select-none ${
                isPro 
                  ? "bg-amber-50 text-amber-900 border-amber-200/80 font-bold" 
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
              title="Plan status is managed centrally via Curiolot Admin"
            >
              {isPro 
                ? "★ Pro Plan Active (Unlimited • 2 GB Vault)" 
                : `Free Plan (${currentProductCount}/${FREE_PRODUCT_LIMIT} Products • 50 MB Vault)`}
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              {editId ? "Editing Product" : "New Digital Asset"}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {editId ? "Edit Digital Product" : "Create New Digital Product"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {editId 
              ? "Modify your pricing, description, cover image, or download assets."
              : "Publish a new digital file, graphic resource, or e-book directly to your storefront."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section: Basic Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Beast Whisperer: Agent of Shadows"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  URL Slug {editId ? "(Preserved)" : "(Auto-generated)"}
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/70 px-4 py-2.5 text-xs text-slate-500">
                  <span>store.curiolot.com/{username}/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 bg-transparent text-slate-900 font-semibold focus:outline-none ml-1 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition cursor-pointer"
                  >
                    <option value="E-Books & Guides">E-Books & Guides</option>
                    <option value="Vectors & Logos">Vectors & Logos</option>
                    <option value="3D Assets">3D Assets</option>
                    <option value="Templates">Templates</option>
                    <option value="Digital Artwork">Digital Artwork</option>
                    <option value="Audio & Presets">Audio & Presets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Release, Sale -40%, Bestseller"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Pricing & Payment Settlement */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Pricing & Payment Settlement</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set product pricing and destination checkout routing.
                </p>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs font-semibold text-slate-700">Make this product free (Lead Magnet)</span>
              </label>
            </div>

            {!isFree ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Selling Price (USD $) *
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        step="0.01"
                        min="0.5"
                        required={!isFree}
                        placeholder="4.99"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm font-bold rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Original / Strike-through Price (USD $)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="9.99"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Pengaturan Gateway Pembayaran */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  
                  {/* Header Gateway & Toggle Switch Custom URL */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        {useCustomUrl ? <Link2 className="w-4 h-4 text-indigo-600" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {useCustomUrl ? "Mode: Custom Product Checkout URL" : `Active Gateway: ${getGatewayLabel()}`}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {useCustomUrl 
                            ? "Using a dedicated product-specific checkout link." 
                            : "Pre-configured globally via your central Earnings profile."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-600 select-none">
                        Custom Link
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={useCustomUrl}
                        onClick={() => setUseCustomUrl(!useCustomUrl)}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                          useCustomUrl ? "bg-indigo-600" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                            useCustomUrl ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {useCustomUrl ? (
                    <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700">
                          Direct Checkout / Payment Link for this Product *
                        </label>
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                          Override Active
                        </span>
                      </div>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          required={useCustomUrl && !isFree}
                          placeholder="https://curiolot.lemonsqueezy.com/buy/... or direct payment link"
                          value={customProductUrl}
                          onChange={(e) => setCustomProductUrl(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white text-xs font-mono rounded-xl border border-indigo-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition shadow-2xs text-slate-900 font-semibold"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Paste the exact product variant checkout link from your payment provider (e.g., Lemon Squeezy, Stripe, or personal merchant gateway).
                      </p>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono">
                        <span className="text-slate-400 text-[11px]">Auto-locked Checkout URL:</span>
                        <span className="font-bold text-emerald-700 truncate max-w-[280px] sm:max-w-md">
                          {autoLockedPaymentUrl}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>100% of customer funds route directly to your account.</span>
                        </span>
                        <Link
                          href="/dashboard/earnings"
                          className="font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                        >
                          <span>Manage Earnings</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Visitors can download this item instantly for free. No payment checkout link is required.
                </span>
              </div>
            )}
          </div>

          {/* Section: Digital Asset & Cover Artwork */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Digital Asset & Cover Artwork</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Product Cover Mockup *
                </label>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  <div className="md:col-span-7 space-y-3">
                    <div className="relative">
                      <ImageIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        required
                        placeholder="Direct image URL (https://pub-af30dd30344d4c978a0b58579942823d.r2.dev/...)"
                        value={coverUrl}
                        onChange={(e) => {
                          setCoverUrl(e.target.value);
                          setUploadCoverName(null);
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition font-mono"
                      />
                    </div>

                    <input
                      type="file"
                      ref={coverInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                    />

                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100/50 rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 group"
                    >
                      {isUploadingCover ? (
                        <>
                          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                          <p className="text-xs font-bold text-slate-800">Uploading cover artwork to Cloudflare R2...</p>
                          <p className="text-[11px] text-slate-400">Storing image into curiolot-media bucket</p>
                        </>
                      ) : (
                        <>
                          <div className="w-9 h-9 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-600 group-hover:scale-105 transition">
                            <UploadCloud className="w-4 h-4 text-indigo-600" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            {uploadCoverName
                              ? `Selected: ${uploadCoverName}`
                              : coverUrl
                              ? "Click to replace current cover image"
                              : "Click to upload product cover image"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Directly uploaded & hosted on Cloudflare R2 (curiolot-media)
                          </p>
                        </>
                      )}
                    </div>

                    <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 text-[11px] text-amber-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Adaptive Auto-Fit Preview Active</span>
                      </div>
                      <p className="text-amber-900/80 leading-relaxed pl-5">
                        Portrait images will feature elegant black side borders. Non-standard landscape images will display black top/bottom bars without clipping.
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mockup Preview</span>
                        </span>
                        <span className="text-[10px] bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                          4:3 Frame
                        </span>
                      </div>

                      <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-black border border-slate-900 shadow-inner flex items-center justify-center">
                        {coverUrl ? (
                          <>
                            <img
                              src={coverUrl}
                              alt="Mockup Preview"
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_COVER_IMAGE;
                              }}
                              className="w-full h-full object-contain"
                            />
                            {badge && (
                              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-md bg-slate-900/90 border border-white/20 text-white z-10">
                                {badge}
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500">
                            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mb-2 text-slate-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold text-slate-300">No Mockup Selected</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Upload an image or paste a URL to preview
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="px-1 pt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[140px] font-medium text-slate-600">
                          {title || "Untitled Product"}
                        </span>
                        <span className="font-bold text-slate-800">
                          {isFree ? "FREE" : `$${parseFloat(price || "0").toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product File Upload */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Upload Product File (ZIP, PDF, RAR, MP4, etc.) *
                  </label>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isPro 
                      ? "bg-amber-50 text-amber-800 border-amber-200" 
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {isPro ? "Pro Limit: Up to 2 GB" : "Free Limit: Max 50 MB"}
                  </span>
                </div>

                <input
                  type="file"
                  ref={productFileInputRef}
                  className="hidden"
                  onChange={handleProductFileUpload}
                />

                <div
                  onClick={() => productFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition group ${
                    productFileName
                      ? "border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50"
                      : "border-slate-200 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-100/50"
                  }`}
                >
                  {isUploadingProductFile ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                      <p className="text-xs font-bold text-slate-900">Uploading file to Cloudflare R2 Vault...</p>
                      <p className="text-[11px] text-slate-400">Encrypting & preparing single-use download link</p>
                    </div>
                  ) : productFileName ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">{productFileName}</p>
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                        {productFileSize} • Ready for Cloudflare R2 Vault
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">Click to replace file</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-600 group-hover:scale-105 transition mb-2">
                        <UploadCloud className="w-4 h-4 text-indigo-600" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to browse or drag and drop your product archive
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isPro 
                          ? "Pro account active: large vault storage up to 2 GB." 
                          : "Free plan limit: up to 50 MB."}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Uploaded files are encrypted in your private Cloudflare R2 bucket with secure single-use download links.
                  </span>
                </div>
              </div>

              {/* File Format Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      File Format Label
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Auto-detected from file
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. PDF, ZIP, MP4, PNG"
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm font-semibold text-slate-800 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition uppercase font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Description & Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Description & Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Product Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain what the product is and how buyers can use it..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  What&apos;s Inside (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder={"Full 46-Page Complete Novel (High-Quality PDF)\n4 Thrilling Story Chapters + Dramatic Epilogue\nInstant Direct Digital Download After Checkout"}
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none transition font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/dashboard/products"
              className="px-6 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingCover || isUploadingProductFile}
              className="px-8 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition active:scale-95 shadow-md shadow-slate-900/10 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editId ? (
                <Save className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>
                {isSubmitting 
                  ? (editId ? "Updating Product..." : "Publishing Product...") 
                  : (editId ? "Save Changes" : "Publish Product")}
              </span>
            </button>
          </div>

        </form>
      </main>

      {/* POP-UP MODAL: Upgrade to Pro */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-left">
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-5">
              {modalReason === "product_limit" ? <AlertTriangle className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              {modalReason === "product_limit" ? "Product Limit Reached (5/5)" : "Storage Limit Exceeded"}
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {modalReason === "product_limit" ? (
                <>
                  Free Creator accounts can publish up to <strong>5 digital products</strong>. You currently have {currentProductCount} products in your store. Upgrade to <strong>Curiolot Pro</strong> to publish unlimited digital assets.
                </>
              ) : (
                <>
                  Your selected file ({attemptedFileSize}) exceeds the <strong>50 MB limit</strong> for Free accounts. Upgrade to <strong>Curiolot Pro</strong> to upload large digital archives up to <strong>2 GB</strong>.
                </>
              )}
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Unlimited</strong> digital product listings (Free: Max 5)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>2 GB per file</strong> Cloudflare R2 vault storage (Free: 50 MB)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>0% platform transaction fee</strong> (keep 100% of your sales)</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="https://link.curiolot.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold text-center hover:bg-slate-800 transition shadow-sm active:scale-95"
              >
                Upgrade to Curiolot Pro
              </a>
              <button
                type="button"
                onClick={() => {
                  setShowProModal(false);
                  if (modalReason === "product_limit" && !editId) {
                    router.push("/dashboard/products");
                  }
                }}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                {modalReason === "product_limit" ? "Return to Products List" : "Cancel & Upload Smaller File (Under 50 MB)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
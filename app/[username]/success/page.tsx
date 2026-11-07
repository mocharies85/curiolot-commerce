"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  Download, 
  ArrowLeft, 
  FileArchive, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink 
} from "lucide-react";

function SuccessContent() {
  const params = useParams() as any;
  const searchParams = useSearchParams();

  const username = (params?.username as string) || "aries";
  const itemParam = searchParams.get("item") || "Digital Asset Bundle";
  const orderId = searchParams.get("order_id") || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  const [copiedKey, setCopiedKey] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const licenseKey = `CURIOLOT-LIC-${orderId}-VALID`;

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTriggerDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert("Your download has started! Check your browser's download manager.");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased pb-20">
      
      {/* Top Bar Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <span className="text-xs font-mono font-bold text-slate-400">
            {username}.curiolot.com
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 space-y-6 text-center">
        
        {/* Success Icon & Heading */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Payment Verified & Completed
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your payment was successfully settled directly with the creator. Your instant download access is ready below.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 text-left shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Reference</p>
              <p className="text-sm font-mono font-bold text-slate-900">{orderId}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivery Status</p>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 sm:justify-end">
                <Sparkles className="w-3.5 h-3.5" /> Instant Access Granted
              </span>
            </div>
          </div>

          {/* Product Download Block */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileArchive className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {itemParam === "bundle" ? "All-Access Creator Bundle (Complete Package)" : itemParam}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Secure Digital Archive • Lifetime Commercial License
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "Preparing File..." : "Download Files (ZIP)"}</span>
            </button>
          </div>

          {/* License & Verification Key */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Commercial License Authentication Key</label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs">
              <span className="text-slate-800 font-semibold truncate pr-2">{licenseKey}</span>
              <button
                type="button"
                onClick={handleCopyLicense}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Save this key for warranty coverage and proof of commercial licensing rights.
            </p>
          </div>

          {/* Security Notice */}
          <div className="pt-2 flex items-start gap-2.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Downloads are served directly from encrypted Cloudflare R2 storage. Single-use download links protect content integrity against unauthorized distribution.
            </p>
          </div>

        </div>

        {/* Assistance / Support Links */}
        <div className="text-xs text-slate-400 space-y-1">
          <p>
            Need assistance with your files or unzipping instructions?
          </p>
          <Link
            href={`/${username}`}
            className="text-slate-700 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>Return to {username}'s Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

      </main>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs text-slate-400">Loading order details...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
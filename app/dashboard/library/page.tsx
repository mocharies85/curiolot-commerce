"use client";

import { useState } from "react";
import { UploadCloud, Check, Copy } from "lucide-react";

export default function ImageLibraryPage() {
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const ASSETS: Array<{ id: number; title: string; tag: string; url: string; date: string }> = [];

  const handleCopyUrl = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Image Library</h1>
          <p className="text-xs text-slate-500 mt-1">Asset repository for book covers, promotional banners, and transparent product mockups.</p>
        </div>
        <button
          type="button"
          onClick={() => alert("Select an image from your computer to upload to the Cloudflare R2 Vault.")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        {["all", "uploaded", "covers", "transparent background"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
              filter === t ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {ASSETS.map((asset) => (
          <div key={asset.id} className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition">
            <div className="relative aspect-square bg-[#121212] overflow-hidden flex items-center justify-center p-3">
              <img
                src={asset.url}
                alt={asset.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white border border-white/10">
                {asset.tag}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 truncate">{asset.title}</h3>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{asset.date}</span>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(asset.id, asset.url)}
                  className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
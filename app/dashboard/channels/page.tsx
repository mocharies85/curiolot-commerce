"use client";

import { useState, useEffect } from "react";
import { 
  Globe, 
  ArrowUpRight, 
  Check, 
  Copy, 
  Share2, 
  ExternalLink,
  Sparkles,
  CheckCircle2
} from "lucide-react";

// Komponen SVG Ikon Brand Global (Aman dari error ts2305 lucide-react)
function XTwitterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 2C6.511 2 2.025 6.486 2.025 12.006a10.02 10.02 0 0 0 1.558 5.378L2 22l4.767-1.533a9.98 9.98 0 0 0 5.264 1.499h.005c5.518 0 10.005-4.486 10.005-10.006C22.041 6.486 17.553 2 12.031 2zm5.835 14.167c-.244.685-1.42 1.309-1.954 1.392-.505.078-1.157.111-3.73-.956-3.292-1.365-5.385-4.733-5.55-4.952-.162-.22-1.332-1.773-1.332-3.382 0-1.608.84-2.4 1.141-2.724.301-.325.656-.407.876-.407.218 0 .438.002.63.011.203.01.474-.077.74.563.277.669.946 2.308 1.03 2.477.083.17.139.37.027.59-.111.22-.166.357-.33.551-.166.195-.349.435-.498.585-.166.166-.339.347-.146.678.194.33 861 1.417 1.848 2.296 1.272 1.134 2.345 1.485 2.676 1.65.331.166.525.138.718-.083.194-.22.83-965 1.052-1.296.22-.331.443-.277.743-.166.301.111 1.908.9 2.235 1.065.328.166.547.248.629.387.083.138.083.805-.161 1.49z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.222 0h.003z" />
    </svg>
  );
}

function PinterestIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0a12 12 0 0 0-4.37 23.18c-.07-.94-.13-2.39.03-3.42.14-.94.94-3.98.94-3.98s-.24-.48-.24-1.19c0-1.12.65-1.95 1.46-1.95.69 0 1.02.52 1.02 1.14 0 .69-.44 1.73-.67 2.69-.19.81.41 1.47 1.21 1.47 1.45 0 2.57-1.53 2.57-3.74 0-1.95-1.4-3.32-3.41-3.32-2.32 0-3.68 1.74-3.68 3.53 0 .7.27 1.45.61 1.86.07.08.08.15.06.24-.07.28-.21.87-.24 1-.04.16-.13.2-.3.12-1.11-.52-1.81-2.14-1.81-3.45 0-2.81 2.04-5.39 5.88-5.39 3.09 0 5.49 2.2 5.49 5.14 0 3.07-1.94 5.54-4.63 5.54-.9 0-1.76-.47-2.05-1.03l-.56 2.13c-.2.78-.75 1.76-1.12 2.36A12 12 0 1 0 12 0z" />
    </svg>
  );
}

function TelegramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.83 1.039z" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function SalesChannelsPage() {
  const [username, setUsername] = useState("aries");
  const [copiedLink, setCopiedLink] = useState(false);

  // Ambil username dinamis dari pengaturan toko
  useEffect(() => {
    fetch("/api/settings?username=aries")
      .then((res) => res.json())
      .then((data) => {
        if (data?.username) {
          setUsername(data.username);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const storeUrl = `https://store.curiolot.com/${username}`;
  const bioLinkUrl = `https://link.curiolot.com/${username}`;
  const shareText = `Check out my official digital assets and e-books on Curiolot Store!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Intent Tautan Share Langsung ke Platform Global
  const SHARE_LINKS = [
    {
      name: "X (Twitter)",
      icon: XTwitterIcon,
      bgColor: "bg-black hover:bg-zinc-800 text-white",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(storeUrl)}`
    },
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      bgColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + storeUrl)}`
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      bgColor: "bg-blue-600 hover:bg-blue-700 text-white",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`
    },
    {
      name: "LinkedIn",
      icon: LinkedInIcon,
      bgColor: "bg-sky-700 hover:bg-sky-800 text-white",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storeUrl)}`
    },
    {
      name: "Pinterest",
      icon: PinterestIcon,
      bgColor: "bg-rose-600 hover:bg-rose-700 text-white",
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(storeUrl)}&description=${encodeURIComponent(shareText)}`
    },
    {
      name: "Telegram",
      icon: TelegramIcon,
      bgColor: "bg-sky-500 hover:bg-sky-600 text-white",
      href: `https://t.me/share/url?url=${encodeURIComponent(storeUrl)}&text=${encodeURIComponent(shareText)}`
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales Channels & Social Media</h1>
        <p className="text-xs text-slate-500 mt-1">
          Connect your sales endpoints and promote your digital storefront across global social networks.
        </p>
      </div>

      {/* Main Channels 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Channel 1: Curiolot Bio Link (Dinamis Sesuai Akun) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Curiolot Bio Link</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Your digital storefront is automatically linked to your primary profile handle at{" "}
                <code className="text-indigo-600 font-semibold bg-indigo-50/70 px-1.5 py-0.5 rounded">
                  link.curiolot.com/{username}
                </code>.
              </p>
            </div>
          </div>

          <a
            href={bioLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            <span>Open Bio Link</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Channel 2: YouTube Shopping & Shorts Embed */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
              <YoutubeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sell on YouTube</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Connect your YouTube channel to embed direct product checkout cards and discount links across YouTube Shorts and video descriptions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert(`Connect YouTube channel for @${username} to enable automated video product cards.`)}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer active:scale-95"
          >
            Connect YouTube Channel
          </button>
        </div>

        {/* Channel 3: Social Media Bio (TikTok & Instagram) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
              <InstagramIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Instagram & TikTok Bio</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Copy your vanity store URL to paste into your Instagram, TikTok, or Twitter bio for instant direct traffic.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              copiedLink 
                ? "bg-emerald-600 text-white" 
                : "border border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Store URL</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* GLOBAL 1-CLICK SOCIAL MEDIA SHARING PANEL */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span>Instant 1-Click Social Media Broadcast</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Broadcast your store link directly to the world's most widely used social media networks.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full truncate">
            {storeUrl}
          </span>
        </div>

        {/* Tombol Share Berfungsi Langsung (Opens official web share dialogs) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SHARE_LINKS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs font-bold transition shadow-2xs active:scale-95 ${item.bgColor}`}
                title={`Share on ${item.name}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </div>

        {/* Tips Promosi Lintas Medsos */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs text-slate-600">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Creator Tip:</strong> Sharing your store link immediately after publishing new digital assets drives high launch-day momentum. For Instagram and TikTok, placing <strong>store.curiolot.com/{username}</strong> in your bio converts profile visitors directly into customers.
          </p>
        </div>
      </div>
    </div>
  );
}
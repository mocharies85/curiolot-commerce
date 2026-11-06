"use client";

import Link from "next/link";
import { ShieldCheck, Globe2 } from "lucide-react";

// Komponen SVG Ikon Brand (Bebas dari error lucide-react ts2305)
function TwitterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white font-sans border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        {/* 4-Column Navigation Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80 text-xs">
          
          {/* Col 1: Marketplace */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">Shop & Discover</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/discover" className="hover:text-white transition">All Categories</Link></li>
              <li><Link href="/discover" className="hover:text-white transition">E-Books & Novels</Link></li>
              <li><Link href="/discover" className="hover:text-white transition">Vector Art & Logos</Link></li>
              <li><Link href="/discover" className="hover:text-white transition">3D Assets & Models</Link></li>
              <li><Link href="/discover" className="hover:text-white transition">Micro-SaaS Templates</Link></li>
            </ul>
          </div>

          {/* Col 2: About Platform */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/register" className="hover:text-white transition">Sell on Curiolot</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Creator Dashboard</Link></li>
              <li><Link href="/dashboard/earnings" className="hover:text-white transition">0% Fee Model</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Marketplace Guidelines</Link></li>
            </ul>
          </div>

          {/* Col 3: Help & Integrity */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">Trust & Safety</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/terms" className="hover:text-white transition">Intermediary Disclaimer</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">DMCA / Copyright Protection</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Refund & Dispute Terms</Link></li>
            </ul>
          </div>

          {/* Col 4: Channels */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">Ecosystem</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="https://link.curiolot.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Curiolot Link Hub ↗</a></li>
              <li><a href="https://store.curiolot.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Curiolot Commerce ↗</a></li>
            </ul>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <span className="p-2 rounded-lg bg-white/5 hover:text-white transition cursor-pointer" title="X (Twitter)">
                <TwitterIcon className="w-4 h-4" />
              </span>
              <span className="p-2 rounded-lg bg-white/5 hover:text-white transition cursor-pointer" title="Instagram">
                <InstagramIcon className="w-4 h-4" />
              </span>
              <span className="p-2 rounded-lg bg-white/5 hover:text-white transition cursor-pointer" title="Facebook">
                <FacebookIcon className="w-4 h-4" />
              </span>
              <span className="p-2 rounded-lg bg-white/5 hover:text-white transition cursor-pointer" title="GitHub">
                <GithubIcon className="w-4 h-4" />
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Mandatory Legal Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white text-slate-950 font-black flex items-center justify-center text-[10px]">
              C
            </div>
            <span className="font-bold text-slate-200">CURIOLOT COMMERCE</span>
            <span>• Independent Creator Infrastructure</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/terms" className="hover:text-slate-200 transition underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-slate-200 transition underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-200 transition underline underline-offset-4">
              Limitation of Liability
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
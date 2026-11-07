"use client";

import { useState } from "react";
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Globe,
  Settings
} from "lucide-react";

interface PayPalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
}

export default function PayPalGuideModal({ isOpen, onClose, username }: PayPalGuideModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const downloadUrl = `https://store.curiolot.com/${username || "{your-username}"}/success`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-left">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">PayPal Business Automation Guide</h2>
              <p className="text-xs text-slate-400 mt-0.5">Step-by-step setup for instant file delivery & card checkouts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed scrollbar-thin">
          
          {/* STEP 1: Copy Order Confirmation URL */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">1</span>
                Your Personal Return & Download URL
              </span>
              <span className="text-[10px] text-slate-500">From dashboard header</span>
            </div>
            
            <p className="text-slate-400 text-[11px]">
              Copy this URL now. You must paste it into your PayPal Website Preferences in Step 3.
            </p>

            <div className="flex items-center gap-2">
              <code className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sky-400 text-xs overflow-x-auto">
                {downloadUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* STEP 2: Navigate in PayPal */}
          <div className="space-y-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">2</span>
              Open Website Payment Preferences in PayPal
            </span>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 text-slate-300">
              <p>1. Log in to your <a href="https://www.paypal.com" target="_blank" rel="noreferrer" className="text-sky-400 font-semibold underline inline-flex items-center gap-0.5">PayPal Business Account <ExternalLink className="w-3 h-3" /></a>.</p>
              <p>2. Click the <strong>Settings (Gear Icon)</strong> in the top-right corner $\rightarrow$ <strong>Account Settings</strong>.</p>
              <p>3. In the left sidebar under <strong>PRODUCTS & SERVICES</strong>, click <strong>Website payments</strong>.</p>
              <p>4. Next to <strong>Website preferences</strong>, click the <strong>Update</strong> button.</p>
            </div>
          </div>

          {/* STEP 3: Configure Settings Table */}
          <div className="space-y-3">
            <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">3</span>
              Apply the Required Configuration
            </span>

            <div className="space-y-3">
              {/* Auto Return */}
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-xs">Auto Return for Website Payments: <span className="text-emerald-400">TURN ON</span></p>
                  <p className="text-slate-400 text-[11px]">Paste your copied Download URL into the <strong>Return URL</strong> field and click <strong>Save</strong>.</p>
                </div>
              </div>

              {/* PDT */}
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-xs">Payment Data Transfer (PDT): <span className="text-emerald-400">TURN ON</span></p>
                  <p className="text-slate-400 text-[11px]">Enables secure transmission of transaction confirmation tokens back to your store.</p>
                </div>
              </div>

              {/* Encrypted Payments Warning */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-200 text-xs">Block Non-Encrypted Website Payments: <span className="text-amber-400 underline">TURN OFF</span></p>
                  <p className="text-amber-200/80 text-[11px]">
                    <strong>CRITICAL:</strong> If this is kept Active, PayPal will reject all customer checkouts from your store. Keep it <strong>OFF (Nonaktif)</strong>.
                  </p>
                </div>
              </div>

              {/* PayPal Optional */}
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
                <Zap className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-xs">PayPal Account Optional: <span className="text-sky-400">TURN ON</span></p>
                  <p className="text-slate-400 text-[11px]">Allows global customers to pay via Credit/Debit card without creating a PayPal account.</p>
                </div>
              </div>

              {/* Phone & Express Checkout */}
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-xs">Contact Phone & Express Checkout: <span className="text-slate-400">TURN OFF</span></p>
                  <p className="text-slate-400 text-[11px]">Removes friction for buyers by skipping unnecessary phone and bank transfer prompts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: Curiolot Store Handle */}
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 space-y-2">
            <span className="font-bold text-sky-300 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">4</span>
              Final Step: Save Global Gateway
            </span>
            <p className="text-sky-200/80 text-[11px]">
              Ensure your clean PayPal.Me username (without https://) is saved in the input field above, then click <strong>Save Global Gateway Configuration</strong>.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">Settings save immediately inside PayPal.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer"
          >
            Done & Close
          </button>
        </div>

      </div>
    </div>
  );
}
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
  Settings,
  Mail
} from "lucide-react";

interface PayPalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
}

export default function PayPalGuideModal({ isOpen, onClose, username }: PayPalGuideModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanUsername = username?.trim().toLowerCase() || "aries";
  const downloadUrl = `https://store.curiolot.com/${cleanUsername}/success`;

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
              <p className="text-xs text-slate-400 mt-0.5">Setup instant payouts & automated redirect to customer download page</p>
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
              <span className="text-[10px] text-slate-500">Curiolot Success Route</span>
            </div>
            
            <p className="text-slate-400 text-[11px]">
              Salin URL ini. Anda wajib menempelkannya pada kolom <strong>Return URL</strong> di menu Website Preferences PayPal (Langkah 3).
            </p>

            <div className="flex items-center gap-2">
              <code className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sky-400 text-xs overflow-x-auto select-all">
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
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">2</span>
                Buka Website Payment Preferences di PayPal
              </span>
              <a
                href="https://www.paypal.com/businessprofile/settings/website"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Direct Link Preferensi</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 text-slate-300">
              <p>
                1. Login ke akun{" "}
                <a href="https://www.paypal.com" target="_blank" rel="noreferrer" className="text-sky-400 font-semibold underline inline-flex items-center gap-0.5">
                  PayPal Business <ExternalLink className="w-3 h-3" />
                </a> Anda.
              </p>
              <p>2. Klik ikon <strong>Settings (Gerigi)</strong> di pojok kanan atas &rarr; pilih <strong>Account Settings</strong>.</p>
              <p>3. Di menu bilah kiri, klik <strong>Website payments</strong>.</p>
              <p>4. Cari baris <strong>Website preferences</strong>, lalu klik tombol <strong>Update</strong>.</p>
            </div>
          </div>

          {/* STEP 3: Configure Settings Table */}
          <div className="space-y-3">
            <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">3</span>
              Konfigurasi Wajib di PayPal
            </span>

            <div className="space-y-3">
              {/* Auto Return */}
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-xs">Auto Return for Website Payments: <span className="text-emerald-400 font-extrabold">TURN ON (Aktifkan)</span></p>
                  <p className="text-slate-400 text-[11px]">Tempelkan URL dari Langkah 1 ke kolom <strong>Return URL</strong> lalu klik <strong>Save</strong>.</p>
                </div>
              </div>

              {/* PDT */}
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-xs">Payment Data Transfer (PDT): <span className="text-emerald-400 font-extrabold">TURN ON (Aktifkan)</span></p>
                  <p className="text-slate-400 text-[11px]">Memastikan token verifikasi transaksi terkirim otomatis kembali ke Curiolot.</p>
                </div>
              </div>

              {/* Encrypted Payments Warning */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-200 text-xs">Block Non-Encrypted Website Payments: <span className="text-amber-400 underline font-extrabold">TURN OFF (Nonaktifkan)</span></p>
                  <p className="text-amber-200/80 text-[11px]">
                    <strong>PENTING:</strong> Jika opsi ini tetap ON, PayPal akan memblokir link pembelian dari toko Anda. Pastikan posisinya <strong>OFF</strong>.
                  </p>
                </div>
              </div>

              {/* PayPal Optional */}
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3">
                <Zap className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-xs">PayPal Account Optional: <span className="text-sky-400 font-extrabold">TURN ON (Aktifkan)</span></p>
                  <p className="text-slate-400 text-[11px]">Mengizinkan pembeli luar negeri membayar menggunakan Kartu Kredit / Debit tanpa harus mendaftar akun PayPal.</p>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: PayPal Account Email */}
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 space-y-2">
            <span className="font-bold text-sky-300 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center">4</span>
              Langkah Terakhir: Masukkan Email PayPal di Dashboard Curiolot
            </span>
            <div className="flex items-start gap-2 pt-1">
              <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p className="text-sky-200/90 text-[11px] leading-relaxed">
                Pastikan Anda memasukkan <strong>Alamat Email PayPal Bisnis</strong> Anda (contoh: <code className="bg-sky-900/50 px-1 py-0.5 rounded text-white font-mono">nama@email.com</code>) pada menu <strong>Earnings / Settings</strong>, bukan username biasa. Pembayaran pembeli akan langsung disetorkan ke email tersebut secara instan.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">Perubahan di akun PayPal tersimpan secara instan.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer"
          >
            Selesai & Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
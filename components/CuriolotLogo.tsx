"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface CuriolotLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  showText?: boolean;
}

export default function CuriolotLogo({
  size = "md",
  variant = "dark",
  showText = true,
}: CuriolotLogoProps) {
  // Pengaturan proporsi ukuran ikon & teks
  const dimensions = {
    sm: { img: 30, textTitle: "text-base", textSub: "text-[10px]" },
    md: { img: 38, textTitle: "text-lg", textSub: "text-xs" },
    lg: { img: 48, textTitle: "text-2xl", textSub: "text-sm" },
  }[size];

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group select-none">
      {/* File Logo Baru */}
      <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/logo.png"
          alt="Curiolot Commerce"
          width={dimensions.img}
          height={dimensions.img}
          className="object-contain"
          priority
        />
      </div>

      {/* Tipografi Nama Brand */}
      {showText && (
        <div className="flex items-baseline gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${dimensions.textTitle} ${
              variant === "light" ? "text-white" : "text-slate-950"
            }`}
          >
            curiolot
          </span>
          <span
            className={`font-extrabold uppercase tracking-wider ${dimensions.textSub} bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent`}
          >
            commerce
          </span>
        </div>
      )}
    </Link>
  );
}
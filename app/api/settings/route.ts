import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// Inisialisasi tabel store_settings di Cloudflare D1 jika belum tersedia
async function ensureStoreSettingsTable(db: any) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS store_settings (
        username TEXT PRIMARY KEY,
        store_title TEXT,
        logo_url TEXT,
        banner_url TEXT,
        hero_badge TEXT,
        hero_title TEXT,
        hero_description TEXT,
        show_hero INTEGER DEFAULT 1,
        show_bundle INTEGER DEFAULT 0,
        show_promo INTEGER DEFAULT 0,
        bundle_badge TEXT,
        bundle_title TEXT,
        bundle_description TEXT,
        bundle_url TEXT,
        bundle_btn_text TEXT,
        promo_badge TEXT,
        promo_title TEXT,
        promo_description TEXT,
        promo_code TEXT,
        paypal_handle TEXT,
        payout_provider TEXT,
        updated_at TEXT
      )
    `).run();
  } catch (err) {
    console.warn("Table initialization check:", err);
  }
}

// 1. GET: Ambil seluruh konfigurasi toko, etalase, dan payout dari D1
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || "aries";

    const { env } = getRequestContext();
    const db = (env as any).DB;

    if (!db) {
      return NextResponse.json({
        username,
        storeTitle: "Digital Creator Studio",
        payoutProvider: "paypal",
        payoutPaypalHandle: "curiolot",
        isPro: true,
      });
    }

    await ensureStoreSettingsTable(db);

    // Ambil data dari tabel store_settings
    const settingsRow: any = await db
      .prepare("SELECT * FROM store_settings WHERE username = ? LIMIT 1")
      .bind(username)
      .first()
      .catch(() => null);

    // Ambil data akun dari tabel users (untuk fallback plan & payout)
    const userRow: any = await db
      .prepare("SELECT * FROM users WHERE username = ? LIMIT 1")
      .bind(username)
      .first()
      .catch(() => null);

    const isPro = Boolean(
      userRow?.is_pro === 1 ||
      userRow?.isPro === true ||
      userRow?.plan === "pro"
    );

    const rawHandle =
      settingsRow?.paypal_handle ||
      userRow?.paypal_handle ||
      "curiolot";
    const cleanPaypalHandle = (!rawHandle || rawHandle === "aries") ? "curiolot" : rawHandle;

    return NextResponse.json({
      username,
      storeTitle: settingsRow?.store_title || "Digital Creator Studio",
      storeName: settingsRow?.store_title || "Digital Creator Studio",
      
      // Logo & Banner
      logoUrl: settingsRow?.logo_url || "",
      storeLogo: settingsRow?.logo_url || "",
      bannerUrl: settingsRow?.banner_url || "",
      heroImageUrl: settingsRow?.banner_url || "",

      // Hero Showcase
      heroBadge: settingsRow?.hero_badge || "Featured Release",
      badgeTag: settingsRow?.hero_badge || "Featured Release",
      heroTitle: settingsRow?.hero_title || "Premium Vectors & 3D Design Assets",
      mainHeadline: settingsRow?.hero_title || "Premium Vectors & 3D Design Assets",
      heroDescription: settingsRow?.hero_description || "Supercharge your creative workflow with production-ready assets.",
      subHeadline: settingsRow?.hero_description || "Supercharge your creative workflow with production-ready assets.",
      showHero: Boolean(settingsRow?.show_hero ?? 1),
      showHeroBanner: Boolean(settingsRow?.show_hero ?? 1),

      // Toggles Promo Cards
      showBundle: Boolean(settingsRow?.show_bundle ?? 0),
      showBundleCard: Boolean(settingsRow?.show_bundle ?? 0),
      isBundleActive: Boolean(settingsRow?.show_bundle ?? 0),
      showPromoStrip: Boolean(settingsRow?.show_promo ?? 0),
      showDiscountCoupon: Boolean(settingsRow?.show_promo ?? 0),
      isCouponActive: Boolean(settingsRow?.show_promo ?? 0),

      // Detail Bundle & Promo
      bundleBadge: settingsRow?.bundle_badge || "Bundle Offer",
      bundleTitle: settingsRow?.bundle_title || "Save Up to 60% on All Graphic Bundles",
      bundleDescription: settingsRow?.bundle_description || "Unlock instant access to the complete vector collection and 3D asset library.",
      bundleUrl: settingsRow?.bundle_url || "#",
      bundleButtonText: settingsRow?.bundle_btn_text || "Get Complete Bundle",

      promoBadge: settingsRow?.promo_badge || "Limited Time Offer",
      promoTitle: settingsRow?.promo_title || "Get 30% Off Your First Order",
      promoDescription: settingsRow?.promo_description || "Apply this coupon code at checkout to claim your launch discount.",
      promoCode: settingsRow?.promo_code || "CURIOLOT30",

      // Payouts
      payoutProvider: settingsRow?.payout_provider || userRow?.payout_provider || "paypal",
      payoutPaypalHandle: cleanPaypalHandle,
      paypalHandle: cleanPaypalHandle,
      isPro,
      plan: isPro ? "pro" : "free",
    });
  } catch (err: any) {
    console.error("Failed to load store settings from D1:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. POST / PUT: Simpan logo, banner, headline, visibilitas, dan payout ke D1
export async function POST(req: Request) {
  try {
    const { env } = getRequestContext();
    const db = (env as any).DB;

    if (!db) {
      return NextResponse.json({ error: "DB binding not found." }, { status: 500 });
    }

    await ensureStoreSettingsTable(db);
    const body: any = await req.json();
    const username = body.username || "aries";

    // Ambil data yang ada saat ini agar field yang tidak dikirim tidak tertimpa kosong
    const existing: any = await db
      .prepare("SELECT * FROM store_settings WHERE username = ? LIMIT 1")
      .bind(username)
      .first()
      .catch(() => null);

    const storeTitle = body.storeTitle ?? body.storeName ?? existing?.store_title ?? "Digital Creator Studio";
    const logoUrl = body.logoUrl ?? body.storeLogo ?? body.avatarUrl ?? existing?.logo_url ?? "";
    const bannerUrl = body.bannerUrl ?? body.heroImageUrl ?? body.bannerImageUrl ?? existing?.banner_url ?? "";

    const heroBadge = body.heroBadge ?? body.badgeTag ?? existing?.hero_badge ?? "Featured Release";
    const heroTitle = body.heroTitle ?? body.mainHeadline ?? existing?.hero_title ?? "Premium Vectors & 3D Design Assets";
    const heroDescription = body.heroDescription ?? body.subHeadline ?? existing?.hero_description ?? "";
    
    // Konversi status visibilitas ke integer (0 atau 1)
    const showHero = (body.showHero === false || body.showHeroBanner === false || body.bannerActive === false) ? 0 : 1;
    const showBundle = (body.showBundle === false || body.showBundleCard === false || body.isBundleActive === false || body.bundleStatus === "hidden") ? 0 : 1;
    const showPromo = (body.showPromoStrip === false || body.showDiscountCoupon === false || body.isCouponActive === false || body.promoStatus === "hidden") ? 0 : 1;

    const bundleBadge = body.bundleBadge ?? existing?.bundle_badge ?? "Bundle Offer";
    const bundleTitle = body.bundleTitle ?? existing?.bundle_title ?? "Save Up to 60% on All Graphic Bundles";
    const bundleDescription = body.bundleDescription ?? existing?.bundle_description ?? "";
    const bundleUrl = body.bundleUrl ?? existing?.bundle_url ?? "#";
    const bundleBtnText = body.bundleButtonText ?? body.bundleBtnText ?? existing?.bundle_btn_text ?? "Get Complete Bundle";

    const promoBadge = body.promoBadge ?? existing?.promo_badge ?? "Limited Time Offer";
    const promoTitle = body.promoTitle ?? existing?.promo_title ?? "Get 30% Off Your First Order";
    const promoDescription = body.promoDescription ?? existing?.promo_description ?? "";
    const promoCode = body.promoCode ?? existing?.promo_code ?? "CURIOLOT30";

    const rawHandle = body.payoutPaypalHandle || body.paypalHandle || existing?.paypal_handle || "curiolot";
    const cleanPaypalHandle = (!rawHandle || rawHandle === "aries")
      ? "curiolot"
      : rawHandle.replace(/^https?:\/\/paypal\.me\//i, "").replace(/\/.*$/, "").trim();

    const payoutProvider = body.payoutProvider ?? existing?.payout_provider ?? "paypal";

    // Simpan ke database D1 menggunakan INSERT OR REPLACE
    await db.prepare(`
      INSERT INTO store_settings (
        username, store_title, logo_url, banner_url,
        hero_badge, hero_title, hero_description, show_hero,
        show_bundle, show_promo,
        bundle_badge, bundle_title, bundle_description, bundle_url, bundle_btn_text,
        promo_badge, promo_title, promo_description, promo_code,
        paypal_handle, payout_provider, updated_at
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      )
      ON CONFLICT(username) DO UPDATE SET
        store_title = excluded.store_title,
        logo_url = excluded.logo_url,
        banner_url = excluded.banner_url,
        hero_badge = excluded.hero_badge,
        hero_title = excluded.hero_title,
        hero_description = excluded.hero_description,
        show_hero = excluded.show_hero,
        show_bundle = excluded.show_bundle,
        show_promo = excluded.show_promo,
        bundle_badge = excluded.bundle_badge,
        bundle_title = excluded.bundle_title,
        bundle_description = excluded.bundle_description,
        bundle_url = excluded.bundle_url,
        bundle_btn_text = excluded.bundle_btn_text,
        promo_badge = excluded.promo_badge,
        promo_title = excluded.promo_title,
        promo_description = excluded.promo_description,
        promo_code = excluded.promo_code,
        paypal_handle = excluded.paypal_handle,
        payout_provider = excluded.payout_provider,
        updated_at = excluded.updated_at
    `).bind(
      username, storeTitle, logoUrl, bannerUrl,
      heroBadge, heroTitle, heroDescription, showHero,
      showBundle, showPromo,
      bundleBadge, bundleTitle, bundleDescription, bundleUrl, bundleBtnText,
      promoBadge, promoTitle, promoDescription, promoCode,
      cleanPaypalHandle, payoutProvider, new Date().toISOString()
    ).run();

    // Pastikan username PayPal juga tersinkron ke tabel users
    try {
      await db.prepare("UPDATE users SET paypal_handle = ?, payout_provider = ? WHERE username = ?")
        .bind(cleanPaypalHandle, payoutProvider, username)
        .run();
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Store settings saved successfully to D1 database.",
    });
  } catch (err: any) {
    console.error("Failed to save store settings to D1:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
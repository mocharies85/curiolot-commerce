import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// Helper: Ensure store_settings table and all required columns exist in D1
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
        show_bundle INTEGER DEFAULT 1,
        show_promo INTEGER DEFAULT 1,
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

    // Auto-migrate any missing columns if table was created in an earlier schema
    const { results } = await db
      .prepare("PRAGMA table_info(store_settings)")
      .all()
      .catch(() => ({ results: [] }));

    if (results && results.length > 0) {
      const existingCols = new Set(results.map((c: any) => c.name.toLowerCase()));
      const columnsToCheck = [
        { name: "store_title", type: "TEXT" },
        { name: "logo_url", type: "TEXT" },
        { name: "banner_url", type: "TEXT" },
        { name: "hero_badge", type: "TEXT" },
        { name: "hero_title", type: "TEXT" },
        { name: "hero_description", type: "TEXT" },
        { name: "show_hero", type: "INTEGER DEFAULT 1" },
        { name: "show_bundle", type: "INTEGER DEFAULT 1" },
        { name: "show_promo", type: "INTEGER DEFAULT 1" },
        { name: "bundle_badge", type: "TEXT" },
        { name: "bundle_title", type: "TEXT" },
        { name: "bundle_description", type: "TEXT" },
        { name: "bundle_url", type: "TEXT" },
        { name: "bundle_btn_text", type: "TEXT" },
        { name: "promo_badge", type: "TEXT" },
        { name: "promo_title", type: "TEXT" },
        { name: "promo_description", type: "TEXT" },
        { name: "promo_code", type: "TEXT" },
        { name: "paypal_handle", type: "TEXT" },
        { name: "payout_provider", type: "TEXT" },
        { name: "updated_at", type: "TEXT" },
      ];

      for (const col of columnsToCheck) {
        if (!existingCols.has(col.name.toLowerCase())) {
          try {
            await db.prepare(`ALTER TABLE store_settings ADD COLUMN ${col.name} ${col.type}`).run();
          } catch {
            // Column already present or migration skipped safely
          }
        }
      }
    }
  } catch (err) {
    console.warn("Table initialization check warning:", err);
  }
}

// Helper: Normalize multiple frontend visibility formats (boolean, string, number)
function parseVisibility(value: any, fallback: number = 1): number {
  if (value === undefined || value === null) return fallback;
  if (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "active" ||
    value === "visible" ||
    value === "true"
  ) {
    return 1;
  }
  if (
    value === false ||
    value === 0 ||
    value === "0" ||
    value === "hidden" ||
    value === "false"
  ) {
    return 0;
  }
  return fallback;
}

// 1. GET: Fetch complete storefront customization, branding, and payout configuration
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || "aries";

    const { env } = getRequestContext();
    const db = (env as any).DB;

    if (!db) {
      return NextResponse.json({
        username,
        storeTitle: "Aries Store",
        storeName: "Aries Store",
        payoutProvider: "paypal",
        payoutPaypalHandle: "curiolot",
        paypalHandle: "curiolot",
        isPro: true,
      });
    }

    await ensureStoreSettingsTable(db);

    const settingsRow: any = await db
      .prepare("SELECT * FROM store_settings WHERE username = ? LIMIT 1")
      .bind(username)
      .first()
      .catch(() => null);

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

    const storeTitle = settingsRow?.store_title || "Aries Store";
    const showHero = settingsRow ? Boolean(settingsRow.show_hero) : true;
    const showBundle = settingsRow ? Boolean(settingsRow.show_bundle) : true;
    const showPromo = settingsRow ? Boolean(settingsRow.show_promo) : true;

    return NextResponse.json({
      username,
      storeTitle,
      storeName: storeTitle,

      // Logo & Avatar
      logoUrl: settingsRow?.logo_url || "",
      storeLogo: settingsRow?.logo_url || "",

      // Hero Banner
      bannerUrl: settingsRow?.banner_url || "",
      heroImageUrl: settingsRow?.banner_url || "",

      // Hero Showcase Typography & Visibility
      heroBadge: settingsRow?.hero_badge || "Featured Release",
      badgeTag: settingsRow?.hero_badge || "Featured Release",
      heroTitle: settingsRow?.hero_title || "Premium Vectors & 3D Design Assets",
      mainHeadline: settingsRow?.hero_title || "Premium Vectors & 3D Design Assets",
      heroDescription: settingsRow?.hero_description || "Supercharge your creative workflow with production-ready assets.",
      subHeadline: settingsRow?.hero_description || "Supercharge your creative workflow with production-ready assets.",
      showHero,
      showHeroBanner: showHero,

      // Promotion & Bundle Card Visibility Flags
      showBundle,
      showBundleCard: showBundle,
      isBundleActive: showBundle,
      showPromoStrip: showPromo,
      showDiscountCoupon: showPromo,
      isCouponActive: showPromo,

      // Bundle Details
      bundleBadge: settingsRow?.bundle_badge || "Bundle Offer",
      bundleTitle: settingsRow?.bundle_title || "Save Up to 60% on All Graphic Bundles",
      bundleDescription: settingsRow?.bundle_description || "Unlock instant access to the complete vector collection and 3D asset library.",
      bundleUrl: settingsRow?.bundle_url || "#",
      bundleButtonText: settingsRow?.bundle_btn_text || "Get Complete Bundle",

      // Coupon Details
      promoBadge: settingsRow?.promo_badge || "Limited Time Offer",
      promoTitle: settingsRow?.promo_title || "Get 30% Off Your First Order",
      promoDescription: settingsRow?.promo_description || "Apply this coupon code at checkout to claim your launch discount.",
      promoCode: settingsRow?.promo_code || "CURIOLOT30",

      // Centralized Payout Routing
      payoutProvider: settingsRow?.payout_provider || userRow?.payout_provider || "paypal",
      payoutPaypalHandle: cleanPaypalHandle,
      paypalHandle: cleanPaypalHandle,
      isPro,
      plan: isPro ? "pro" : "free",
    });
  } catch (err: any) {
    console.error("Failed to load store settings from D1:", err);
    return NextResponse.json({ error: err.message || "Failed to load store settings" }, { status: 500 });
  }
}

// 2. POST: Save and persist branding, banners, visibility switches, and payout details
export async function POST(req: Request) {
  try {
    const { env } = getRequestContext();
    const db = (env as any).DB;

    if (!db) {
      return NextResponse.json({ error: "D1 Database binding 'DB' not found." }, { status: 500 });
    }

    await ensureStoreSettingsTable(db);
    const body: any = await req.json();
    const username = body.username || "aries";

    // Retrieve existing record to retain unchanged values
    const existing: any = await db
      .prepare("SELECT * FROM store_settings WHERE username = ? LIMIT 1")
      .bind(username)
      .first()
      .catch(() => null);

    const storeTitle = (
      body.storeTitle ||
      body.storeName ||
      body.title ||
      existing?.store_title ||
      "Aries Store"
    ).trim();

    // Safeguard base64 size to prevent D1 1MB SQLITE_TOOBIG statement crash
    let logoUrl = body.logoUrl || body.storeLogo || body.avatarUrl || "";
    if (logoUrl.startsWith("data:") && logoUrl.length > 500000) {
      console.warn("Logo base64 exceeds safe D1 packet size. Retaining existing logo to protect transaction.");
      logoUrl = existing?.logo_url || "";
    } else if (!logoUrl && existing?.logo_url) {
      logoUrl = existing.logo_url;
    }

    let bannerUrl = body.bannerUrl || body.heroImageUrl || body.bannerImageUrl || "";
    if (bannerUrl.startsWith("data:") && bannerUrl.length > 700000) {
      console.warn("Banner base64 exceeds safe D1 packet size. Retaining existing banner to protect transaction.");
      bannerUrl = existing?.banner_url || "";
    } else if (!bannerUrl && existing?.banner_url) {
      bannerUrl = existing.banner_url;
    }

    const heroBadge = body.heroBadge || body.badgeTag || existing?.hero_badge || "Featured Release";
    const heroTitle = body.heroTitle || body.mainHeadline || existing?.hero_title || "Premium Vectors & 3D Design Assets";
    const heroDescription = body.heroDescription || body.subHeadline || existing?.hero_description || "";

    // Resolve visibility states with multi-source fallback
    const rawHero = body.showHero ?? body.showHeroBanner ?? body.bannerActive ?? body.isHeroActive ?? existing?.show_hero;
    const showHero = parseVisibility(rawHero, 1);

    const rawBundle = body.showBundle ?? body.showBundleCard ?? body.isBundleActive ?? body.bundleActive ?? body.bundleStatus ?? existing?.show_bundle;
    const showBundle = parseVisibility(rawBundle, 1);

    const rawPromo = body.showPromoStrip ?? body.showDiscountCoupon ?? body.isCouponActive ?? body.showPromo ?? body.promoActive ?? body.promoStatus ?? existing?.show_promo;
    const showPromo = parseVisibility(rawPromo, 1);

    const bundleBadge = body.bundleBadge || existing?.bundle_badge || "Bundle Offer";
    const bundleTitle = body.bundleTitle || existing?.bundle_title || "Save Up to 60% on All Graphic Bundles";
    const bundleDescription = body.bundleDescription || existing?.bundle_description || "";
    const bundleUrl = body.bundleUrl || existing?.bundle_url || "#";
    const bundleBtnText = body.bundleButtonText || body.bundleBtnText || existing?.bundle_btn_text || "Get Complete Bundle";

    const promoBadge = body.promoBadge || existing?.promo_badge || "Limited Time Offer";
    const promoTitle = body.promoTitle || existing?.promo_title || "Get 30% Off Your First Order";
    const promoDescription = body.promoDescription || existing?.promo_description || "";
    const promoCode = body.promoCode || existing?.promo_code || "CURIOLOT30";

    const rawHandle = body.payoutPaypalHandle || body.paypalHandle || existing?.paypal_handle || "curiolot";
    const cleanPaypalHandle = (!rawHandle || rawHandle.toLowerCase() === "aries")
      ? "curiolot"
      : rawHandle.replace(/^https?:\/\/paypal\.me\//i, "").replace(/\/.*$/, "").trim();

    const payoutProvider = body.payoutProvider || existing?.payout_provider || "paypal";

    // Atomic upsert into D1
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
        logo_url = CASE WHEN excluded.logo_url != '' THEN excluded.logo_url ELSE store_settings.logo_url END,
        banner_url = CASE WHEN excluded.banner_url != '' THEN excluded.banner_url ELSE store_settings.banner_url END,
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

    // Synchronize paypal handle into users table as well
    try {
      await db.prepare("UPDATE users SET paypal_handle = ?, payout_provider = ? WHERE username = ?")
        .bind(cleanPaypalHandle, payoutProvider, username)
        .run();
    } catch {
      // Non-blocking fallback
    }

    return NextResponse.json({
      success: true,
      message: "Store settings saved successfully to D1 database.",
    });
  } catch (err: any) {
    console.error("Failed to save store settings to D1:", err);
    return NextResponse.json({ error: err.message || "Failed to persist store settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
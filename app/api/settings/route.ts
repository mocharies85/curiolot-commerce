import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// 1. GET: Ambil pengaturan payout & plan user dari D1
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || "aries";

    const { env } = getRequestContext();
    const db = (env as any).DB;

    if (!db) {
      return NextResponse.json({
        payoutProvider: "paypal",
        payoutPaypalHandle: "curiolot", // Default aman ke curiolot
        isPro: true,
      });
    }

    // Cek data user dari tabel users
    let userRow: any = null;
    try {
      userRow = await db
        .prepare("SELECT * FROM users WHERE username = ? LIMIT 1")
        .bind(username)
        .first();
    } catch (e) {
      console.warn("Table users lookup fallback");
    }

    // Cek apakah ada tabel khusus store_settings
    let settingsRow: any = null;
    try {
      settingsRow = await db
        .prepare("SELECT * FROM store_settings WHERE username = ? LIMIT 1")
        .bind(username)
        .first();
    } catch (e) {
      // Table store_settings belum dibuat, gunakan data user
    }

    const payoutPaypalHandle =
      settingsRow?.paypal_handle ||
      settingsRow?.payout_paypal_handle ||
      userRow?.paypal_handle ||
      userRow?.payout_paypal_handle ||
      "curiolot"; // Mengutamakan curiolot, bukan aries

    const payoutProvider =
      settingsRow?.payout_provider ||
      userRow?.payout_provider ||
      "paypal";

    const isPro = Boolean(
      userRow?.is_pro === 1 ||
      userRow?.isPro === true ||
      userRow?.plan === "pro" ||
      settingsRow?.is_pro === 1
    );

    return NextResponse.json({
      username,
      payoutProvider,
      payoutPaypalHandle,
      paypalHandle: payoutPaypalHandle,
      payoutStripeUrl: settingsRow?.stripe_url || "",
      payoutLemonSqueezyUrl: settingsRow?.lemonsqueezy_url || "",
      payoutPaddleUrl: settingsRow?.paddle_url || "",
      payoutKofiUrl: settingsRow?.kofi_url || "",
      payoutCustomUrl: settingsRow?.custom_url || "",
      isPro,
      plan: isPro ? "pro" : "free",
    });
  } catch (err: any) {
    console.error("Failed to load settings from D1:", err);
    return NextResponse.json(
      {
        payoutProvider: "paypal",
        payoutPaypalHandle: "curiolot",
        isPro: true,
      },
      { status: 200 }
    );
  }
}

// 2. POST / PUT: Simpan pengaturan rekening baru dari halaman Earnings
export async function POST(req: Request) {
  try {
    const { env } = getRequestContext();
    const db = (env as any).DB;

    if (!db) {
      return NextResponse.json({ error: "DB binding not found" }, { status: 500 });
    }

    const body: any = await req.json();
    const username = body.username || "aries";
    const rawHandle = body.payoutPaypalHandle || body.paypalHandle || body.paypal_handle || "curiolot";
    const cleanPaypalHandle = rawHandle
      .replace(/^https?:\/\/paypal\.me\//i, "")
      .replace(/\/.*$/, "")
      .trim();

    const payoutProvider = body.payoutProvider || "paypal";

    // Pastikan kolom paypal_handle ada di tabel users
    try {
      await db.prepare("ALTER TABLE users ADD COLUMN paypal_handle TEXT").run();
    } catch {}
    try {
      await db.prepare("ALTER TABLE users ADD COLUMN payout_provider TEXT").run();
    } catch {}

    // Simpan ke tabel users
    await db
      .prepare(
        "UPDATE users SET paypal_handle = ?, payout_provider = ? WHERE username = ?"
      )
      .bind(cleanPaypalHandle, payoutProvider, username)
      .run();

    return NextResponse.json({
      success: true,
      message: "Payout settings saved successfully",
      payoutPaypalHandle: cleanPaypalHandle,
    });
  } catch (err: any) {
    console.error("Failed to save settings to D1:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
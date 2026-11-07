import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || "aries";

    const { env } = getRequestContext();
    const db = (env as any).DB;

    if (!db) {
      console.warn("D1 Database binding 'DB' tidak terdeteksi.");
      return NextResponse.json([]);
    }

    // Query ke tabel store_products di biolink-db
    const { results } = await db
      .prepare(
        "SELECT * FROM store_products WHERE username = ? AND is_active = 1 ORDER BY created_at DESC"
      )
      .bind(username)
      .all();

    if (!results || results.length === 0) {
      return NextResponse.json([]);
    }

    // Mapping nama kolom database ke nama properti yang dibaca oleh StoreView
    const formattedProducts = results.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      category: row.category,
      description: row.description || "",
      price: Number(row.price) || 0,
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      currency: row.currency || "USD",
      fileFormat: row.file_format,
      fileSize: row.file_size,
      coverUrl: row.cover_image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      badge: row.badge || undefined,
      paymentUrl: row.payment_url || undefined,
    }));

    return NextResponse.json(formattedProducts);
  } catch (err: any) {
    console.error("Gagal mengambil data produk D1:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// 1. GET: Mengambil daftar produk aktif untuk etalase toko
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
      whatsInside: row.whats_inside || undefined,
      fileUrl: row.file_url || row.download_url || undefined,
    }));

    return NextResponse.json(formattedProducts);
  } catch (err: any) {
    console.error("Gagal mengambil data produk D1:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

// 2. POST: Menerima dan menyimpan produk digital baru ke Cloudflare D1
export async function POST(req: Request) {
  try {
    const { env } = getRequestContext();
    const db = (env as any).DB;

    if (!db) {
      return NextResponse.json(
        { error: "D1 Database binding 'DB' tidak ditemukan di Cloudflare environment." },
        { status: 500 }
      );
    }

    const body: any = await req.json();

    // Validasi data penting
    if (!body.title) {
      return NextResponse.json({ error: "Judul produk wajib diisi." }, { status: 400 });
    }

    const username = body.username || "aries";

    // Cari user_id dari tabel users untuk memenuhi syarat NOT NULL constraint
    let userId = body.userId || body.user_id;
    if (!userId) {
      try {
        const userRow: any = await db
          .prepare("SELECT id FROM users WHERE username = ? LIMIT 1")
          .bind(username)
          .first();
        userId = userRow?.id || username;
      } catch {
        userId = username;
      }
    }

    const id = body.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `prod_${Date.now()}`);
    const title = body.title.trim();
    const slug = (body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")).trim();
    const category = body.category || "E-Books & Guides";
    const description = body.description || "";
    const price = Number(body.price) || 0;
    const originalPrice = body.originalPrice ? Number(body.originalPrice) : (body.original_price ? Number(body.original_price) : null);
    const currency = body.currency || "USD";
    const fileFormat = body.fileFormat || body.file_format || "PDF";
    const fileSize = body.fileSize || body.file_size || "4.5 MB";
    const coverImageUrl = body.coverUrl || body.coverImageUrl || body.cover_image_url || "";
    const badge = body.badge || null;
    const paymentUrl = body.paymentUrl || body.payment_url || null;
    const whatsInside = typeof body.whatsInside === "string" 
      ? body.whatsInside 
      : (Array.isArray(body.whatsInside) ? body.whatsInside.join("\n") : (body.whats_inside || null));
    const fileUrl = body.fileUrl || body.downloadUrl || body.file_url || null;

    // Cek skema kolom tabel store_products agar query INSERT adaptif
    let colNames = new Set<string>();
    try {
      const { results: tableCols } = await db.prepare("PRAGMA table_info(store_products)").all();
      if (tableCols && tableCols.length > 0) {
        colNames = new Set(tableCols.map((c: any) => c.name.toLowerCase()));
      }
    } catch (e) {
      console.warn("Gagal mengecek PRAGMA table_info, menggunakan fallback kolom default.");
    }

    // Pasangkan kolom yang tersedia (termasuk user_id)
    const candidateData: Record<string, any> = {
      id,
      user_id: userId,
      userId: userId,
      username,
      title,
      slug,
      category,
      description,
      price,
      original_price: originalPrice,
      currency,
      file_format: fileFormat,
      file_size: fileSize,
      cover_image_url: coverImageUrl,
      badge,
      payment_url: paymentUrl,
      whats_inside: whatsInside,
      file_url: fileUrl,
      download_url: fileUrl,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Filter kolom yang benar-benar ada di tabel D1 Anda
    let validKeys: string[] = [];
    if (colNames.size > 0) {
      validKeys = Object.keys(candidateData).filter((k) => colNames.has(k.toLowerCase()));
    } else {
      validKeys = [
        "id", "user_id", "username", "title", "slug", "category", "description", 
        "price", "original_price", "currency", "file_format", "file_size", 
        "cover_image_url", "badge", "payment_url", "is_active", "created_at"
      ];
    }

    const placeholders = validKeys.map(() => "?").join(", ");
    const values = validKeys.map((k) => candidateData[k]);
    const sql = `INSERT INTO store_products (${validKeys.join(", ")}) VALUES (${placeholders})`;

    await db.prepare(sql).bind(...values).run();

    return NextResponse.json({
      success: true,
      message: "Product published successfully",
      product: { id, slug, title },
    }, { status: 201 });

  } catch (err: any) {
    console.error("Gagal menyimpan produk ke D1:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memproses penyimpanan produk" },
      { status: 500 }
    );
  }
}
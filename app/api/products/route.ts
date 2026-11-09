import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// Helper: Ensure store_products table exists in D1
async function ensureStoreProductsTable(db: any) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS store_products (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        username TEXT,
        title TEXT,
        slug TEXT,
        category TEXT,
        description TEXT,
        price REAL DEFAULT 0,
        original_price REAL,
        currency TEXT DEFAULT 'USD',
        file_format TEXT,
        file_size TEXT,
        cover_image_url TEXT,
        cover_url TEXT,
        badge TEXT,
        payment_url TEXT,
        whats_inside TEXT,
        file_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT
      )
    `).run();
  } catch (err) {
    console.warn("Table store_products creation warning:", err);
  }
}

// Helper: Ensure crucial columns exist in D1 store_products table
async function ensureRequiredColumns(db: any, colNames: Set<string>) {
  const columnsToAdd = [
    { name: "whats_inside", type: "TEXT" },
    { name: "updated_at", type: "TEXT" },
    { name: "username", type: "TEXT" },
    { name: "cover_image_url", type: "TEXT" },
    { name: "cover_url", type: "TEXT" },
    { name: "is_active", type: "INTEGER DEFAULT 1" },
  ];

  for (const col of columnsToAdd) {
    if (colNames.size > 0 && !colNames.has(col.name.toLowerCase())) {
      try {
        await db.prepare(`ALTER TABLE store_products ADD COLUMN ${col.name} ${col.type}`).run();
        colNames.add(col.name.toLowerCase());
      } catch {
        // Column might already exist or ALTER is restricted
      }
    }
  }
}

// 1. GET: Fetch product catalog for storefront, dashboard, and marketplace
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const usernameParam = searchParams.get("username");
    const isAll = searchParams.get("all") === "true";
    const isPublic = searchParams.get("public") === "true";
    const targetSlug = searchParams.get("slug");
    const targetId = searchParams.get("id");

    const { env } = getRequestContext();
    const db = (env as any)?.DB;

    if (!db) {
      console.warn("D1 Database binding 'DB' not detected.");
      return NextResponse.json([]);
    }

    await ensureStoreProductsTable(db);

    let query = "SELECT * FROM store_products";
    const params: any[] = [];
    const conditions: string[] = [];

    // Filter 1: Ambil produk berdasarkan ID spesifik
    if (targetId) {
      conditions.push("id = ?");
      params.push(targetId);
    } 
    // Filter 2: Ambil produk berdasarkan SLUG spesifik
    else if (targetSlug) {
      conditions.push("LOWER(slug) = LOWER(?)");
      params.push(targetSlug.trim());
      if (usernameParam) {
        conditions.push("LOWER(username) = LOWER(?)");
        params.push(usernameParam.trim());
      }
    } 
    // Filter 3: Marketplace publik (Semua produk aktif dari semua kreator)
    else if (isAll) {
      conditions.push("(is_active = 1 OR is_active IS NULL)");
    } 
    // Filter 4: Produk milik kreator tertentu (Dashboard atau Toko Publik)
    else if (usernameParam && usernameParam.trim() !== "") {
      conditions.push("LOWER(username) = LOWER(?)");
      params.push(usernameParam.trim());

      // Jika diakses oleh publik, hanya tampilkan produk aktif
      if (isPublic) {
        conditions.push("(is_active = 1 OR is_active IS NULL)");
      }
    } 
    // KUNCI PENGAMAN: Jika tidak ada username dan bukan all, JANGAN fallback ke "aries"! Kembalikan []
    else {
      return NextResponse.json([]);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY created_at DESC";

    const { results } = await db.prepare(query).bind(...params).all().catch(() => ({ results: [] }));

    if (!results || results.length === 0) {
      return NextResponse.json([]);
    }

    const formattedProducts = results.map((row: any) => {
      const insideText = row.whats_inside || row.features || "";
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        category: row.category,
        description: row.description || "",
        price: Number(row.price) || 0,
        originalPrice: row.original_price ? Number(row.original_price) : (row.originalPrice ? Number(row.originalPrice) : undefined),
        currency: row.currency || "USD",
        fileFormat: row.file_format || row.fileFormat || "PDF",
        fileSize: row.file_size || row.fileSize || "4.5 MB",
        coverUrl: row.cover_image_url || row.cover_url || row.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        badge: row.badge || undefined,
        paymentUrl: row.payment_url || row.paymentUrl || undefined,
        whatsInside: insideText,
        whats_inside: insideText,
        features: typeof insideText === "string" 
          ? insideText.split("\n").filter((item: string) => item.trim() !== "") 
          : (Array.isArray(insideText) ? insideText : []),
        fileUrl: row.file_url || row.download_url || row.fileUrl || undefined,
        username: row.username || "",
        userId: row.user_id || row.userId || undefined,
        isActive: Boolean(row.is_active === 1 || row.is_active === true || row.is_active === undefined),
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (err: any) {
    console.error("Failed to fetch products from D1:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

// 2. POST: Create a new digital product
export async function POST(req: Request) {
  try {
    const { env } = getRequestContext();
    const db = (env as any)?.DB;

    if (!db) {
      return NextResponse.json(
        { error: "D1 Database binding 'DB' not found." },
        { status: 500 }
      );
    }

    await ensureStoreProductsTable(db);
    const body: any = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: "Product title is required." }, { status: 400 });
    }

    // KUNCI PENGAMAN: Ambil username pembuat asli, jangan pernah fallback ke 'aries'
    const username = (body.username || "").trim().toLowerCase();
    if (!username) {
      return NextResponse.json({ error: "Username is required to create a product." }, { status: 400 });
    }

    let userId = body.userId || body.user_id;
    if (!userId) {
      try {
        const userRow: any = await db
          .prepare("SELECT username FROM users WHERE LOWER(username) = ? LIMIT 1")
          .bind(username)
          .first();
        userId = userRow?.username || username;
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
    const originalPrice = body.originalPrice !== undefined && body.originalPrice !== null && body.originalPrice !== ""
      ? Number(body.originalPrice)
      : (body.original_price ? Number(body.original_price) : null);
    const currency = body.currency || "USD";
    const fileFormat = body.fileFormat || body.file_format || "PDF";
    const fileSize = body.fileSize || body.file_size || "4.5 MB";
    const coverImageUrl = body.coverUrl || body.coverImageUrl || body.cover_image_url || "";
    const badge = body.badge || null;
    const paymentUrl = body.paymentUrl || body.payment_url || null;

    const whatsInside = typeof body.whatsInside === "string" 
      ? body.whatsInside 
      : (typeof body.whats_inside === "string" 
          ? body.whats_inside 
          : (Array.isArray(body.features) ? body.features.join("\n") : null));

    const fileUrl = body.fileUrl || body.downloadUrl || body.file_url || null;

    let colNames = new Set<string>();
    try {
      const { results: tableCols } = await db.prepare("PRAGMA table_info(store_products)").all();
      if (tableCols && tableCols.length > 0) {
        colNames = new Set(tableCols.map((c: any) => c.name.toLowerCase()));
      }
    } catch (e) {
      console.warn("PRAGMA fallback active for POST");
    }

    await ensureRequiredColumns(db, colNames);

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
      originalPrice: originalPrice,
      currency,
      file_format: fileFormat,
      fileFormat: fileFormat,
      file_size: fileSize,
      fileSize: fileSize,
      cover_image_url: coverImageUrl,
      cover_url: coverImageUrl,
      coverUrl: coverImageUrl,
      badge,
      payment_url: paymentUrl,
      paymentUrl: paymentUrl,
      whats_inside: whatsInside,
      features: whatsInside,
      file_url: fileUrl,
      download_url: fileUrl,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

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
    console.error("Failed to insert product into D1:", err);
    return NextResponse.json(
      { error: err.message || "Failed to publish product" },
      { status: 500 }
    );
  }
}

// 3. PUT: Update an existing product
export async function PUT(req: Request) {
  try {
    const { env } = getRequestContext();
    const db = (env as any)?.DB;

    if (!db) {
      return NextResponse.json(
        { error: "D1 Database binding 'DB' not found." },
        { status: 500 }
      );
    }

    const body: any = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Product ID is required for updating." }, { status: 400 });
    }

    const title = (body.title || "").trim();
    const slug = (body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
    const category = body.category || "E-Books & Guides";
    const description = body.description || "";
    const price = Number(body.price) || 0;
    const originalPrice = body.originalPrice !== undefined && body.originalPrice !== null && body.originalPrice !== ""
      ? Number(body.originalPrice)
      : (body.original_price ? Number(body.original_price) : null);
    const fileFormat = body.fileFormat || body.file_format || "PDF";
    const fileSize = body.fileSize || body.file_size || "4.5 MB";
    const coverImageUrl = body.coverUrl || body.coverImageUrl || body.cover_image_url || "";
    const badge = body.badge || null;
    const paymentUrl = body.paymentUrl || body.payment_url || null;

    const whatsInside = typeof body.whatsInside === "string" 
      ? body.whatsInside 
      : (typeof body.whats_inside === "string" 
          ? body.whats_inside 
          : (Array.isArray(body.features) ? body.features.join("\n") : null));

    let colNames = new Set<string>();
    try {
      const { results: tableCols } = await db.prepare("PRAGMA table_info(store_products)").all();
      if (tableCols && tableCols.length > 0) {
        colNames = new Set(tableCols.map((c: any) => c.name.toLowerCase()));
      }
    } catch (e) {
      console.warn("PRAGMA fallback active for PUT");
    }

    await ensureRequiredColumns(db, colNames);

    const candidateUpdates: Record<string, any> = {
      title,
      slug,
      category,
      description,
      price,
      original_price: originalPrice,
      file_format: fileFormat,
      file_size: fileSize,
      cover_image_url: coverImageUrl,
      cover_url: coverImageUrl,
      badge,
      payment_url: paymentUrl,
      whats_inside: whatsInside,
      features: whatsInside,
    };

    if (colNames.has("updated_at")) {
      candidateUpdates.updated_at = new Date().toISOString();
    }

    let validKeys: string[] = [];
    if (colNames.size > 0) {
      validKeys = Object.keys(candidateUpdates).filter((k) => colNames.has(k.toLowerCase()));
    } else {
      validKeys = [
        "title", "slug", "category", "description", "price", "original_price", 
        "file_format", "file_size", "cover_image_url", "badge", "payment_url", "whats_inside"
      ];
    }

    const setClauses = validKeys.map((k) => `${k} = ?`).join(", ");
    const values = validKeys.map((k) => candidateUpdates[k]);
    values.push(body.id);

    const sql = `UPDATE store_products SET ${setClauses} WHERE id = ?`;
    await db.prepare(sql).bind(...values).run();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    });

  } catch (err: any) {
    console.error("Failed to update product in D1:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// 4. PATCH: Toggle Active / Hidden product visibility status
export async function PATCH(req: Request) {
  try {
    const { env } = getRequestContext();
    const db = (env as any)?.DB;

    if (!db) {
      return NextResponse.json({ error: "DB binding not found." }, { status: 500 });
    }

    const body: any = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    await db
      .prepare("UPDATE store_products SET is_active = ? WHERE id = ?")
      .bind(body.isActive ? 1 : 0, body.id)
      .run();

    return NextResponse.json({ success: true, message: "Status updated successfully" });
  } catch (err: any) {
    console.error("Failed to patch product status:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 5. DELETE: Permanently remove product record
export async function DELETE(req: Request) {
  try {
    const { env } = getRequestContext();
    const db = (env as any)?.DB;

    if (!db) {
      return NextResponse.json({ error: "DB binding not found." }, { status: 500 });
    }

    let id: string | null = null;
    try {
      const body: any = await req.json();
      id = body?.id;
    } catch {}

    if (!id) {
      const { searchParams } = new URL(req.url);
      id = searchParams.get("id");
    }

    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    await db
      .prepare("DELETE FROM store_products WHERE id = ?")
      .bind(id)
      .run();

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (err: any) {
    console.error("Failed to delete product:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// Helper: Ensure crucial columns exist in D1 store_products table
async function ensureRequiredColumns(db: any, colNames: Set<string>) {
  if (colNames.size > 0 && !colNames.has("whats_inside")) {
    try {
      await db.prepare("ALTER TABLE store_products ADD COLUMN whats_inside TEXT").run();
      colNames.add("whats_inside");
    } catch {
      // Column might already exist or ALTER is restricted
    }
  }
  if (colNames.size > 0 && !colNames.has("updated_at")) {
    try {
      await db.prepare("ALTER TABLE store_products ADD COLUMN updated_at TEXT").run();
      colNames.add("updated_at");
    } catch {
      // Ignore fallback
    }
  }
}

// 1. GET: Fetch product catalog for storefront and dashboard
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || "aries";

    const { env } = getRequestContext();
    const db = (env as any).DB;

    if (!db) {
      console.warn("D1 Database binding 'DB' not detected.");
      return NextResponse.json([]);
    }

    const { results } = await db
      .prepare(
        "SELECT * FROM store_products WHERE username = ? ORDER BY created_at DESC"
      )
      .bind(username)
      .all();

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
        originalPrice: row.original_price ? Number(row.original_price) : undefined,
        currency: row.currency || "USD",
        fileFormat: row.file_format,
        fileSize: row.file_size,
        coverUrl: row.cover_image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        badge: row.badge || undefined,
        paymentUrl: row.payment_url || undefined,
        whatsInside: insideText,
        whats_inside: insideText,
        features: insideText ? insideText.split("\n").filter((item: string) => item.trim() !== "") : [],
        fileUrl: row.file_url || row.download_url || undefined,
        isActive: Boolean(row.is_active === 1 || row.is_active === true),
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
    const db = (env as any).DB;

    if (!db) {
      return NextResponse.json(
        { error: "D1 Database binding 'DB' not found." },
        { status: 500 }
      );
    }

    const body: any = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: "Product title is required." }, { status: 400 });
    }

    const username = body.username || "aries";

    // Satisfy user_id NOT NULL constraint
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

    // Resolve multiline What's Inside content
    const whatsInside = typeof body.whatsInside === "string" 
      ? body.whatsInside 
      : (typeof body.whats_inside === "string" 
          ? body.whats_inside 
          : (Array.isArray(body.features) ? body.features.join("\n") : null));

    const fileUrl = body.fileUrl || body.downloadUrl || body.file_url || null;

    // Detect and dynamically adapt to D1 table columns
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
      currency,
      file_format: fileFormat,
      file_size: fileSize,
      cover_image_url: coverImageUrl,
      badge,
      payment_url: paymentUrl,
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

// 3. PUT: Update an existing product (Edit Mode)
export async function PUT(req: Request) {
  try {
    const { env } = getRequestContext();
    const db = (env as any).DB;

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

    // Resolve multiline What's Inside content
    const whatsInside = typeof body.whatsInside === "string" 
      ? body.whatsInside 
      : (typeof body.whats_inside === "string" 
          ? body.whats_inside 
          : (Array.isArray(body.features) ? body.features.join("\n") : null));

    // Detect and dynamically adapt to D1 table columns
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
    const db = (env as any).DB;

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
    const db = (env as any).DB;

    if (!db) {
      return NextResponse.json({ error: "DB binding not found." }, { status: 500 });
    }

    const body: any = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    await db
      .prepare("DELETE FROM store_products WHERE id = ?")
      .bind(body.id)
      .run();

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (err: any) {
    console.error("Failed to delete product:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
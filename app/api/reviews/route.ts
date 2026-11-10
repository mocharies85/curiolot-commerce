export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

// Helper: Auto-create tabel reviews jika belum ada
async function ensureReviewsTable(db: any) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id TEXT PRIMARY KEY,
        product_slug TEXT NOT NULL,
        username TEXT NOT NULL,
        reviewer_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        is_verified INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
      )
    `).run();
  } catch (err) {
    console.warn("Reviews table init notice:", err);
  }
}

// GET: Ambil daftar ulasan berdasarkan slug produk
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const username = searchParams.get("username");

    if (!slug) {
      return NextResponse.json({ error: "Product slug is required." }, { status: 400 });
    }

    const { env } = getRequestContext();
    const db = (env as any)?.DB;

    if (!db) {
      return NextResponse.json([]);
    }

    await ensureReviewsTable(db);

    const { results } = await db
      .prepare(
        "SELECT id, reviewer_name, rating, comment, is_verified, created_at FROM product_reviews WHERE product_slug = ? ORDER BY created_at DESC"
      )
      .bind(slug)
      .all();

    return NextResponse.json(results || []);
  } catch (err: any) {
    console.error("GET Reviews error:", err);
    return NextResponse.json([]);
  }
}

// POST: Simpan ulasan baru dari pembeli
export async function POST(req: Request) {
  try {
    const body: any = await req.json();
    const { product_slug, username, reviewer_name, rating, comment } = body;

    if (!product_slug || !reviewer_name || !rating || !comment) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));

    const { env } = getRequestContext();
    const db = (env as any)?.DB;

    if (!db) {
      return NextResponse.json({ error: "Database service unavailable." }, { status: 500 });
    }

    await ensureReviewsTable(db);

    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    await db
      .prepare(`
        INSERT INTO product_reviews (id, product_slug, username, reviewer_name, rating, comment, is_verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `)
      .bind(
        reviewId,
        product_slug,
        username || "creator",
        reviewer_name.trim(),
        numericRating,
        comment.trim(),
        createdAt
      )
      .run();

    return NextResponse.json({
      success: true,
      review: {
        id: reviewId,
        reviewer_name,
        rating: numericRating,
        comment,
        is_verified: 1,
        created_at: createdAt,
      },
    });
  } catch (err: any) {
    console.error("POST Review error:", err);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
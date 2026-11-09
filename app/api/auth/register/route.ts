export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

declare global {
  var globalUsersDb: Record<string, any> | undefined;
}

if (!globalThis.globalUsersDb) {
  globalThis.globalUsersDb = {
    aries: {
      username: "aries",
      email: "mocharies85@gmail.com",
      name: "Moch Aries",
      password: "password123",
      isActivated: true,
    },
  };
}

// Helper: Ensure users table and auto-migrate all missing columns in D1
async function ensureUsersTable(db: any) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        is_pro INTEGER DEFAULT 1,
        paypal_handle TEXT,
        payout_provider TEXT DEFAULT 'paypal',
        created_at TEXT
      )
    `).run();

    // Auto-migrate missing columns if the table was created in an older schema
    const { results } = await db
      .prepare("PRAGMA table_info(users)")
      .all()
      .catch(() => ({ results: [] }));

    if (results && results.length > 0) {
      const existingCols = new Set(results.map((c: any) => c.name.toLowerCase()));
      const columnsToCheck = [
        { name: "password", type: "TEXT" },
        { name: "name", type: "TEXT" },
        { name: "email", type: "TEXT" },
        { name: "is_pro", type: "INTEGER DEFAULT 1" },
        { name: "paypal_handle", type: "TEXT" },
        { name: "payout_provider", type: "TEXT DEFAULT 'paypal'" },
        { name: "created_at", type: "TEXT" },
      ];

      for (const col of columnsToCheck) {
        if (!existingCols.has(col.name.toLowerCase())) {
          try {
            await db.prepare(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`).run();
          } catch (e) {
            console.warn(`Column migration skipped for ${col.name}:`, e);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Users table initialization warning:", err);
  }
}

export async function POST(request: Request) {
  try {
    const body: any = await request.json();
    const { username, email, password, agreedToTerms, agreeTerms, terms, name } = body;

    // 1. Validasi Terms of Service
    const isAgreed = Boolean(agreedToTerms || agreeTerms || terms || body.agree);
    if (!isAgreed) {
      return NextResponse.json(
        { error: "You must accept the Terms of Service." },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 2. Generate username otomatis dari nama lengkap atau email jika username kosong
    const rawName = (name || body.fullName || username || email.split("@")[0]).trim();
    const resolvedUsername = (
      username ||
      rawName.toLowerCase().replace(/[^a-z0-9_]/g, "") ||
      email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
    ).toLowerCase();

    // 3. Simpan akun ke Database Cloudflare D1
    let db: any = null;
    try {
      const { env } = getRequestContext();
      db = (env as any)?.DB;
    } catch (e) {}

    if (db) {
      await ensureUsersTable(db);

      // Periksa apakah username atau email sudah pernah terdaftar
      const existingUser: any = await db
        .prepare("SELECT username, email FROM users WHERE username = ? OR email = ? LIMIT 1")
        .bind(resolvedUsername, email)
        .first()
        .catch(() => null);

      if (existingUser) {
        const isEmailMatch = existingUser.email?.toLowerCase() === email.toLowerCase();
        return NextResponse.json(
          { error: isEmailMatch ? "Email already registered. Please sign in." : "Username already taken." },
          { status: 400 }
        );
      }

      // Masukkan akun baru ke tabel users di D1
      await db
        .prepare(`
          INSERT INTO users (username, email, password, name, is_pro, created_at)
          VALUES (?, ?, ?, ?, 1, ?)
        `)
        .bind(resolvedUsername, email, password, rawName, new Date().toISOString())
        .run();
    }

    // Fallback cadangan ke global memory
    if (!globalThis.globalUsersDb) {
      globalThis.globalUsersDb = {};
    }
    globalThis.globalUsersDb[resolvedUsername] = {
      username: resolvedUsername,
      name: rawName,
      email,
      password,
      isActivated: true,
    };

    const userData = {
      username: resolvedUsername,
      name: rawName,
      email,
    };

    return NextResponse.json({
      success: true,
      user: userData,
      message: "Account registered successfully.",
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process registration." },
      { status: 500 }
    );
  }
}
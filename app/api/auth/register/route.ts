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
      isActivated: true, // Akun admin utama tetap aktif
    },
  };
}

// Helper: Memastikan kolom aktivasi dan kredensial tersedia di D1 users
async function ensureUsersTable(db: any) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        password_hash TEXT,
        name TEXT,
        is_pro INTEGER DEFAULT 1,
        is_activated INTEGER DEFAULT 0,
        verification_token TEXT,
        paypal_handle TEXT,
        payout_provider TEXT DEFAULT 'paypal',
        created_at TEXT
      )
    `).run();

    const { results } = await db
      .prepare("PRAGMA table_info(users)")
      .all()
      .catch(() => ({ results: [] }));

    if (results && results.length > 0) {
      const existingCols = new Set(results.map((c: any) => c.name.toLowerCase()));
      const columnsToCheck = [
        { name: "password_hash", type: "TEXT" },
        { name: "password", type: "TEXT" },
        { name: "name", type: "TEXT" },
        { name: "is_pro", type: "INTEGER DEFAULT 1" },
        { name: "is_activated", type: "INTEGER DEFAULT 0" },
        { name: "verification_token", type: "TEXT" },
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

    // 1. Validasi persetujuan Terms of Service
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

    // 2. Generate username unik dari nama atau email jika username kosong
    const rawName = (name || body.fullName || username || email.split("@")[0]).trim();
    const resolvedUsername = (
      username ||
      rawName.toLowerCase().replace(/[^a-z0-9_]/g, "") ||
      email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
    ).toLowerCase();

    // 3. Generate token verifikasi email unik
    const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 4. Simpan akun baru ke Cloudflare D1
    let db: any = null;
    try {
      const { env } = getRequestContext();
      db = (env as any)?.DB;
    } catch (e) {}

    if (db) {
      await ensureUsersTable(db);

      // Cek duplikasi email atau username
      const existingUser: any = await db
        .prepare("SELECT username, email FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1")
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

      // Deteksi struktur kolom tabel D1
      const { results } = await db
        .prepare("PRAGMA table_info(users)")
        .all()
        .catch(() => ({ results: [] }));

      const existingCols = new Set(
        (results || []).map((col: any) => col.name.toLowerCase())
      );

      const fields: string[] = ["username", "email"];
      const values: any[] = [resolvedUsername, email];

      // Kredensial password (isi password_hash & password)
      if (existingCols.has("password_hash")) {
        fields.push("password_hash");
        values.push(password);
      }
      if (existingCols.has("password")) {
        fields.push("password");
        values.push(password);
      }

      if (existingCols.has("name")) {
        fields.push("name");
        values.push(rawName);
      }

      if (existingCols.has("is_pro")) {
        fields.push("is_pro");
        values.push(1);
      }

      // WAJIB: Status aktivasi 0 (Belum Aktif) & Token Verifikasi
      if (existingCols.has("is_activated")) {
        fields.push("is_activated");
        values.push(0);
      }
      if (existingCols.has("verification_token")) {
        fields.push("verification_token");
        values.push(verificationToken);
      }

      if (existingCols.has("created_at")) {
        fields.push("created_at");
        values.push(new Date().toISOString());
      }

      const placeholders = fields.map(() => "?").join(", ");
      const insertSql = `INSERT INTO users (${fields.join(", ")}) VALUES (${placeholders})`;

      await db.prepare(insertSql).bind(...values).run();
    }

    // 5. Simpan ke memori fallback dengan status isActivated: false
    if (!globalThis.globalUsersDb) {
      globalThis.globalUsersDb = {};
    }
    globalThis.globalUsersDb[resolvedUsername] = {
      username: resolvedUsername,
      name: rawName,
      email,
      password,
      isActivated: false, // Menunggu klik link verifikasi email
      verificationToken,
    };

    // 6. Respon ke frontend: Menahan sesi agar TIDAK auto-login
    return NextResponse.json({
      success: true,
      requiresActivation: true,
      email,
      message: `Verification link dispatched to ${email}. Please verify your email before signing in.`,
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process registration." },
      { status: 500 }
    );
  }
}
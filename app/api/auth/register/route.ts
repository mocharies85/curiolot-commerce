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

    // 2. Generate username otomatis dari nama atau email jika username kosong
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

      // 4. Deteksi struktur kolom tabel users di D1
      const { results } = await db
        .prepare("PRAGMA table_info(users)")
        .all()
        .catch(() => ({ results: [] }));

      const existingCols = new Set(
        (results || []).map((col: any) => col.name.toLowerCase())
      );

      const fields: string[] = ["username", "email"];
      const values: any[] = [resolvedUsername, email];

      // PENGAMAN UTAMA: Isi password_hash agar lolos dari aturan NOT NULL constraint
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

      if (existingCols.has("created_at")) {
        fields.push("created_at");
        values.push(new Date().toISOString());
      }

      const placeholders = fields.map(() => "?").join(", ");
      const insertSql = `INSERT INTO users (${fields.join(", ")}) VALUES (${placeholders})`;

      await db.prepare(insertSql).bind(...values).run();
    }

    // Fallback memori lokal
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
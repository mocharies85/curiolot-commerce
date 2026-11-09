export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

// 1. Helper Auto-Migrate Tabel D1 Users
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
          } catch (e) {}
        }
      }
    }
  } catch (err) {
    console.warn("Users table init warning:", err);
  }
}

// 2. Helper Kirim Email Aktivasi Resmi Curiolot via Resend API
async function sendActivationEmail(email: string, username: string, token: string) {
  const activationUrl = `https://store.curiolot.com/api/verify?token=${token}`;

  const emailHtml = `
    <div style="background-color: #0b0f19; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 24px; padding: 36px 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #10b981; font-size: 24px; font-weight: 800; margin: 0 0 12px 0;">Welcome to Curiolot Commerce!</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0;">
            Hi <strong style="color: #ffffff;">@${username}</strong>, thank you for joining. Please verify your email address to activate your digital storefront and start selling.
          </p>
        </div>

        <div style="margin: 32px 0;">
          <a href="${activationUrl}" style="display: inline-block; background-color: #10b981; color: #022c22; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
            Activate My Account
          </a>
        </div>

        <div style="border-top: 1px solid #1f2937; padding-top: 20px; font-size: 11px; color: #64748b; line-height: 1.6;">
          <p style="margin: 0 0 10px 0;">
            By clicking "Activate My Account" above, you confirm your registration and agree to be bound by Curiolot's 
            <a href="https://store.curiolot.com/terms" style="color: #10b981; text-decoration: underline;">Terms of Service</a> and 
            <a href="https://store.curiolot.com/privacy" style="color: #10b981; text-decoration: underline;">Privacy Policy</a>.
          </p>
          <p style="margin: 0;">
            Or copy and paste this link into your browser:<br />
            <a href="${activationUrl}" style="color: #38bdf8; word-break: break-all;">${activationUrl}</a>
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    let apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      try {
        const { env } = getRequestContext();
        apiKey = (env as any)?.RESEND_API_KEY;
      } catch (e) {}
    }

    if (!apiKey) {
      console.error("RESEND_API_KEY is missing from environment variables.");
      return;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Curiolot Commerce <noreply@curiolot.com>",
        to: [email],
        subject: "Verify your Curiolot Commerce Account",
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.warn("Resend API response error:", res.status, errBody);
    }
  } catch (err) {
    console.error("Resend API dispatch error:", err);
  }
}

// 3. POST Endpoint Registrasi
export async function POST(request: Request) {
  try {
    const body: any = await request.json();
    const { username, email, password, agreedToTerms, agreeTerms, terms, name } = body;

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

    const rawName = (name || body.fullName || username || email.split("@")[0]).trim();
    const resolvedUsername = (
      username ||
      rawName.toLowerCase().replace(/[^a-z0-9_]/g, "") ||
      email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
    ).toLowerCase();

    const verificationToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    let db: any = null;
    try {
      const { env } = getRequestContext();
      db = (env as any)?.DB;
    } catch {}

    if (db) {
      await ensureUsersTable(db);

      const existingUser: any = await db
        .prepare(
          "SELECT username, email, is_activated FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?) LIMIT 1"
        )
        .bind(email, resolvedUsername)
        .first()
        .catch(() => null);

      if (existingUser) {
        if (existingUser.is_activated === 1 || existingUser.is_activated === true) {
          return NextResponse.json(
            { error: "Email already registered and active. Please sign in." },
            { status: 400 }
          );
        }

        // Perbarui token aktivasi & kirim ulang email via Resend
        await db
          .prepare(
            "UPDATE users SET verification_token = ?, password_hash = ?, password = ? WHERE LOWER(email) = LOWER(?)"
          )
          .bind(verificationToken, password, password, email)
          .run();

        await sendActivationEmail(email, existingUser.username, verificationToken);

        return NextResponse.json({
          success: true,
          requiresActivation: true,
          message: `Verification link sent to ${email}. Please check your inbox or spam folder.`,
        });
      }

      // Deteksi kolom tabel users di D1
      const { results: cols } = await db
        .prepare("PRAGMA table_info(users)")
        .all()
        .catch(() => ({ results: [] }));
      const existingCols = new Set((cols || []).map((c: any) => c.name.toLowerCase()));

      const fields = ["username", "email", "is_activated", "verification_token"];
      const values = [resolvedUsername, email, 0, verificationToken];

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
      await db
        .prepare(`INSERT INTO users (${fields.join(", ")}) VALUES (${placeholders})`)
        .bind(...values)
        .run();
    }

    // Kirim email aktivasi resmi via Resend
    await sendActivationEmail(email, resolvedUsername, verificationToken);

    return NextResponse.json({
      success: true,
      requiresActivation: true,
      message: `Verification link sent to ${email}. Please check your inbox or spam folder.`,
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process registration." },
      { status: 500 }
    );
  }
}
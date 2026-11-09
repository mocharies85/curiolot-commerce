export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

// Helper Mandiri: Kirim email via Resend langsung saat login diblokir
async function sendResendActivation(email: string, username: string, token: string) {
  const activationUrl = `https://store.curiolot.com/api/verify?token=${token}`;

  const emailHtml = `
    <div style="background-color: #0b0f19; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 24px; padding: 36px 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #10b981; font-size: 24px; font-weight: 800; margin: 0 0 12px 0;">Welcome to Curiolot Commerce!</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0;">
            Hi <strong style="color: #ffffff;">@${username}</strong>, please verify your email address to activate your digital storefront.
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
      console.error("RESEND_API_KEY is not defined in Cloudflare Pages environment.");
      return;
    }

    await fetch("https://api.resend.com/emails", {
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
  } catch (err) {
    console.error("Failed to dispatch Resend email:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body: any = await req.json().catch(() => ({}));
    const identifier = (body.identifier || body.email || body.username || "").trim();
    const password = (body.password || "").trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.toLowerCase();

    // Bypass Akun Testing Admin (Aries)
    if (
      (cleanIdentifier === "aries" || cleanIdentifier === "mocharies85@gmail.com") &&
      password === "password123"
    ) {
      const adminUser = {
        id: "usr_aries",
        username: "aries",
        name: "Moch Aries",
        email: "mocharies85@gmail.com",
      };

      const response = NextResponse.json({ success: true, user: adminUser });
      response.cookies.set({
        name: "curiolot_session",
        value: "aries",
        domain: ".curiolot.com",
        path: "/",
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }

    const { env } = getRequestContext();
    const db = (env as any)?.DB;

    if (!db) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 500 }
      );
    }

    // Cari akun di D1
    const user: any = await db
      .prepare(
        "SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1"
      )
      .bind(cleanIdentifier, cleanIdentifier)
      .first()
      .catch(() => null);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    // Verifikasi Password
    const storedPassword = user.password_hash || user.password;
    if (storedPassword && storedPassword !== password) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    // Cek Status Aktivasi
    const isActivated =
      user.username?.toLowerCase() === "aries" ||
      user.is_activated === 1 ||
      user.is_activated === true ||
      user.isActivated === 1 ||
      user.isActivated === true;

    if (!isActivated) {
      // Buat token baru & LANGSUNG tembakkan email via Resend
      const newToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      await db
        .prepare("UPDATE users SET verification_token = ? WHERE username = ?")
        .bind(newToken, user.username)
        .run()
        .catch(() => {});

      await sendResendActivation(user.email, user.username, newToken);

      return NextResponse.json(
        {
          error:
            "Please verify your email address before signing in. We just dispatched a fresh activation link to your inbox. Check your inbox or spam folder.",
        },
        { status: 403 }
      );
    }

    // Login Sukses
    const resolvedUsername = user.username || cleanIdentifier;
    const resolvedName = user.name || resolvedUsername;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id || `usr_${resolvedUsername}`,
        username: resolvedUsername,
        name: resolvedName,
        email: user.email,
      },
    });

    response.cookies.set({
      name: "curiolot_session",
      value: String(resolvedUsername),
      domain: ".curiolot.com",
      path: "/",
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: any) {
    console.error("Login API Error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
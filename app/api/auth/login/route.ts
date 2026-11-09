import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { sendActivationEmail } from "@/app/api/auth/register/route";

export const runtime = "edge";

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

    // 1. Bypass Akun Testing Admin (Aries)
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

    // 2. Query Pengguna di D1
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

    // 3. Verifikasi Password
    const storedPassword = user.password_hash || user.password;
    if (storedPassword && storedPassword !== password) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    // 4. Validasi Status Aktivasi
    const isActivated =
      user.username?.toLowerCase() === "aries" ||
      user.is_activated === 1 ||
      user.is_activated === true ||
      user.isActivated === 1 ||
      user.isActivated === true;

    if (!isActivated) {
      // Buat token baru & kirim ulang email aktivasi otomatis
      const newToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      await db
        .prepare("UPDATE users SET verification_token = ? WHERE username = ?")
        .bind(newToken, user.username)
        .run()
        .catch(() => {});

      await sendActivationEmail(user.email, user.username, newToken);

      return NextResponse.json(
        {
          error:
            "Please verify your email address before signing in. Check your inbox or spam folder.",
        },
        { status: 403 }
      );
    }

    // 5. Login Berhasil
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
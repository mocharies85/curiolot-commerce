import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/username and password are required" }, { status: 400 });
    }

    const { env } = getRequestContext();
    const db = (env as any).DB;

    if (!db) {
      return NextResponse.json({ error: "Database service unavailable" }, { status: 500 });
    }

    // Cari pengguna berdasarkan email atau username
    const user = await db
      .prepare("SELECT id, username, email, password_hash, role FROM users WHERE email = ? OR username = ?")
      .bind(identifier, identifier)
      .first();

    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 401 });
    }

    // Catatan: Jika bio-link menggunakan hashing (misalnya bcrypt/web-crypto), sesuaikan verifikasinya di sini.
    // Jika masih teks polos atau hash sederhana:
    if (user.password_hash !== password) {
      // return NextResponse.json({ error: "Password salah." }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

    // Pasang cookie sesi lintas subdomain (.curiolot.com)
    response.cookies.set({
      name: "curiolot_session",
      value: String(user.username),
      domain: ".curiolot.com",
      path: "/",
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return response;
  } catch (err: any) {
    console.error("Login API Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server saat login." }, { status: 500 });
  }
}
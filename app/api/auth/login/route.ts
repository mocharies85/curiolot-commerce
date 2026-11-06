export const runtime = "edge";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { identifier, password } = await request.json();
  const users = globalThis.globalUsersDb || {};

  // Cari berdasarkan username atau email
  const user = Object.values(users).find(
    (u: any) => u.username === identifier || u.email === identifier
  );

  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid username/email or password." }, { status: 401 });
  }

  // BLOKIR LOGIN JIKA BELUM KLIK AKTIVASI EMAIL (Sesuai Gambar 5)
  if (!user.isActivated) {
    return NextResponse.json(
      { error: "Account not activated. Please verify your email address before logging in." },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, username: user.username });
}
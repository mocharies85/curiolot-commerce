import { NextResponse } from "next/server";

declare global {
  var globalUsersDb: Record<string, any> | undefined;
}

if (!globalThis.globalUsersDb) {
  globalThis.globalUsersDb = {
    aries: {
      username: "aries",
      email: "mocharies85@gmail.com",
      password: "password123",
      isActivated: true, // Akun testing utama sudah aktif
    }
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const { username, email, password, agreedToTerms } = body;

  if (!agreedToTerms) {
    return NextResponse.json({ error: "You must accept the Terms of Service." }, { status: 400 });
  }

  if (globalThis.globalUsersDb?.[username]) {
    return NextResponse.json({ error: "Username already taken." }, { status: 400 });
  }

  // Simpan akun baru dengan status isActivated: false (Wajib klik email aktivasi)
  globalThis.globalUsersDb![username] = {
    username,
    email,
    password,
    isActivated: false, // Menunggu verifikasi email
    verificationToken: `token_${Date.now()}`
  };

  return NextResponse.json({ success: true, message: "Verification email dispatched." });
}
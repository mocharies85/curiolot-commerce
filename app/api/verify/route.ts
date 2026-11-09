export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new Response("Invalid or missing verification token.", { status: 400 });
    }

    const { env } = getRequestContext();
    const db = (env as any)?.DB;

    if (db) {
      const user = await db
        .prepare("SELECT username FROM users WHERE verification_token = ? LIMIT 1")
        .bind(token)
        .first();

      if (!user) {
        return new Response("Activation token is invalid or has already been used.", { status: 400 });
      }

      // Aktifkan akun
      await db
        .prepare("UPDATE users SET is_activated = 1, verification_token = NULL WHERE username = ?")
        .bind(user.username)
        .run();
    }

    // Arahkan ke halaman utama dengan tanda sukses terverifikasi
    return NextResponse.redirect(new URL("/?verified=true", req.url));
  } catch (err: any) {
    console.error("Verification error:", err);
    return new Response("An error occurred during account activation.", { status: 500 });
  }
}
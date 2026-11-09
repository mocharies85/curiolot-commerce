import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// URL Publik R2 curiolot-media milik Anda
const R2_PUBLIC_DOMAIN = "https://pub-af30dd30344d4c978a0b58579942823d.r2.dev";

export async function POST(req: Request) {
  try {
    const { env } = getRequestContext();
    const bucket = (env as any).MEDIA_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { error: "Binding 'MEDIA_BUCKET' belum dipasang di Settings Cloudflare Pages." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const username = (formData.get("username") as string) || "user";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    // Nama file rapi: username_timestamp_random.ext (misal: aries_1794191248_73abde31.png)
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const randomHash = Math.random().toString(36).substring(2, 9);
    const fileName = `${username}_${Date.now()}_${randomHash}.${ext}`;

    // Simpan buffer file langsung ke Cloudflare R2
    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || "image/jpeg",
        cacheControl: "public, max-age=31536000",
      },
    });

    const publicUrl = `${R2_PUBLIC_DOMAIN}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (err: any) {
    console.error("Gagal upload ke R2:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memproses upload ke R2" },
      { status: 500 }
    );
  }
}
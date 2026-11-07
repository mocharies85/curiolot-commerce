export const runtime = "edge";

import { NextResponse } from "next/server";
import { getStoreSettings, updateStoreSettings } from "@/lib/storeSettings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "aries";
  const settings = getStoreSettings(username);
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  try {
    const body: any = await request.json();
    const username = body?.username || "aries";
    const updated = updateStoreSettings(username, body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { verifyPin, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  if (!verifyPin(pin)) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

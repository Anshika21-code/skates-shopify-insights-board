// app/api/login/route.js
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const rawSecret =
  process.env.JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "replace_this_secret";

const JWT_SECRET = new TextEncoder().encode(rawSecret);

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Future me yaha se tenant mapping / DB lookup kar sakti ho
  const tenantId = "skates-8743";

  const token = await new SignJWT({ email, tenantId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const res = NextResponse.json({ ok: true });

  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}

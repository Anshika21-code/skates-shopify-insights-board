// middleware.js
import { NextResponse } from "next/server";

// Public routes where no auth needed
const PUBLIC_PATHS = [
  "/login",
  "/api/login",          // ⬅️ ye line ensure karo
  "/api/auth",
  "/api/auth/install",
  "/api/auth/callback",
  "/api/public",
];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1) Allow all public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2) Allow Shopify embed (iframe inside admin.shopify.com)
  const referer = req.headers.get("referer") || "";
  if (referer.includes("admin.shopify.com")) {
    // Because Shopify iframe cannot send cookies (blocked)
    return NextResponse.next();
  }

  // 3) Email-auth protection for normal dashboard access
  const token = req.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4) Future: decode token & validate tenantId if required
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
  ],
};

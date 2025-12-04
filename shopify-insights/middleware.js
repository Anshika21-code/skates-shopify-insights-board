import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'replace_this_secret';

// Routes that do NOT require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
];

// API routes that MUST stay public (e.g. Shopify webhooks)
const webhookRoutes = ['/api/webhooks', '/api/webhooks/orders', '/api/webhooks/products', '/api/webhooks/customers'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1️⃣ Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2️⃣ Allow Shopify webhooks (no auth)
  if (webhookRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 3️⃣ Get token from cookie
  const token = req.cookies.get('token')?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 4️⃣ Validate JWT
  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    console.error('Invalid token:', err);
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

// 5️⃣ Define which routes the middleware applies to
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/',
  ],
};

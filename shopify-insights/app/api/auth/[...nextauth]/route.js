// app/api/auth/[...nextauth]/route.js
import { NextResponse } from "next/server";

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || "";
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || "";
const APP_URL = process.env.APP_URL || "http://localhost:3001";
const SCOPES = (process.env.SHOPIFY_SCOPES || "read_orders,read_customers,read_products").replace(/,/g, " ");

// add near top of your route.js (temporary debug)
console.log("=== SHOPIFY AUTH ROUTE LOADED ===");
console.log("ENV APP_URL:", process.env.APP_URL);
console.log("ENV SHOPIFY_API_KEY:", !!process.env.SHOPIFY_API_KEY);
console.log("ENV SHOPIFY_API_SECRET:", !!process.env.SHOPIFY_API_SECRET);


async function exchangeCodeForToken(shop, code) {
  const url = `https://${shop}/admin/oauth/access_token`;
  const body = {
    client_id: SHOPIFY_API_KEY,
    client_secret: SHOPIFY_API_SECRET,
    code,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export async function GET(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const search = url.searchParams;
  const segments = pathname.split("/").filter(Boolean);
  const action = segments[segments.length - 1];

  if (action === "install" || action === "signin") {
    const shop = search.get("shop");
    if (!shop) {
      return NextResponse.json({ error: "Missing shop query param. Example: ?shop=your-store.myshopify.com" }, { status: 400 });
    }
    const params = new URLSearchParams({
      client_id: SHOPIFY_API_KEY,
      scope: SCOPES,
      redirect_uri: `${APP_URL}/api/auth/callback`,
      state: Math.random().toString(36).slice(2),
    });
    const authUrl = `https://${shop}/admin/oauth/authorize?${params.toString()}`;
    return NextResponse.redirect(authUrl);
  }

  if (action === "callback") {
    const shop = search.get("shop");
    const code = search.get("code");

    if (!shop || !code) {
      return NextResponse.json({ error: "Missing shop or code in callback" }, { status: 400 });
    }

    try {
      const tokenResp = await exchangeCodeForToken(shop, code);
      const accessToken = tokenResp.access_token;
      if (!accessToken) throw new Error("No access_token in token response");

      const res = NextResponse.redirect(`${APP_URL}/dashboard`);
      res.cookies.set({
        name: "shopify_access_token",
        value: accessToken,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      res.cookies.set({
        name: "shopify_shop",
        value: shop,
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    } catch (err) {
      console.error("OAuth callback error:", err);
      return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
  }

  return NextResponse.json({ msg: "Shopify auth route. Use /install?shop=... or /callback" });
}

export async function POST(req) {
  return GET(req);
}

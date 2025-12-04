import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Shopify webhook: customers/create & customers/update
 * Verifies HMAC and upserts customer into DB.
 *
 * Requires env: SHOPIFY_API_SECRET
 */
export async function POST(req) {
  const SHOPIFY_SECRET = process.env.SHOPIFY_API_SECRET;
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256') || '';

    // verify HMAC
    const hmac = crypto.createHmac('sha256', SHOPIFY_SECRET || '');
    hmac.update(rawBody, 'utf8');
    const digest = hmac.digest('base64');

    if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader))) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Minimal mapping - adapt to your Prisma schema
    const customerData = {
      shopifyId: payload.id ? String(payload.id) : undefined,
      firstName: payload.first_name ?? null,
      lastName: payload.last_name ?? null,
      email: payload.email ? String(payload.email).toLowerCase() : null,
      phone: payload.phone ?? null,
      acceptsMarketing: payload.accepts_marketing ?? false,
      createdAtShopify: payload.created_at ? new Date(payload.created_at) : null,
      updatedAtShopify: payload.updated_at ? new Date(payload.updated_at) : null,
      // you can add more fields (addresses, tags) as needed
    };

    // upsert by shopifyId or email fallback
    const where = customerData.shopifyId
      ? { shopifyId: customerData.shopifyId }
      : customerData.email
      ? { email: customerData.email }
      : null;

    if (!where) {
      return NextResponse.json({ error: 'Insufficient customer identifiers' }, { status: 400 });
    }

    const upsert = await prisma.customer.upsert({
      where,
      update: {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        acceptsMarketing: customerData.acceptsMarketing,
        updatedAtShopify: customerData.updatedAtShopify,
        // keep createdAtShopify unchanged on update
      },
      create: {
        shopifyId: customerData.shopifyId,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        acceptsMarketing: customerData.acceptsMarketing,
        createdAtShopify: customerData.createdAtShopify,
        updatedAtShopify: customerData.updatedAtShopify,
      },
    });

    return NextResponse.json({ ok: true, customer: { id: upsert.id } }, { status: 200 });
  } catch (err) {
    console.error('customers webhook error:', err);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Shopify webhook: products/create & products/update & products/delete
 * Verifies HMAC and upserts (or deletes) product in DB.
 *
 * Requires env: SHOPIFY_API_SECRET
 */
export async function POST(req) {
  const SHOPIFY_SECRET = process.env.SHOPIFY_API_SECRET;
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256') || '';
    const topic = req.headers.get('x-shopify-topic') || '';

    // verify HMAC
    const hmac = crypto.createHmac('sha256', SHOPIFY_SECRET || '');
    hmac.update(rawBody, 'utf8');
    const digest = hmac.digest('base64');

    if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader))) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const shopifyProductId = String(payload.id);

    if (topic.includes('products/delete') || payload.deleted_at) {
      // Soft or hard delete - attempt to remove product
      await prisma.product.deleteMany({ where: { shopifyId: shopifyProductId } });
      return NextResponse.json({ ok: true, deleted: true }, { status: 200 });
    }

    // Map product fields - adapt to your schema
    const productData = {
      shopifyId: shopifyProductId,
      title: payload.title ?? null,
      bodyHtml: payload.body_html ?? null,
      vendor: payload.vendor ?? null,
      productType: payload.product_type ?? null,
      createdAtShopify: payload.created_at ? new Date(payload.created_at) : null,
      updatedAtShopify: payload.updated_at ? new Date(payload.updated_at) : null,
      handle: payload.handle ?? null,
      publishedAt: payload.published_at ? new Date(payload.published_at) : null,
      // You may want to store images, variants separately
    };

    // Upsert product
    const upsert = await prisma.product.upsert({
      where: { shopifyId: productData.shopifyId },
      update: {
        title: productData.title,
        bodyHtml: productData.bodyHtml,
        vendor: productData.vendor,
        productType: productData.productType,
        updatedAtShopify: productData.updatedAtShopify,
        handle: productData.handle,
        publishedAt: productData.publishedAt,
      },
      create: {
        shopifyId: productData.shopifyId,
        title: productData.title,
        bodyHtml: productData.bodyHtml,
        vendor: productData.vendor,
        productType: productData.productType,
        createdAtShopify: productData.createdAtShopify,
        updatedAtShopify: productData.updatedAtShopify,
        handle: productData.handle,
        publishedAt: productData.publishedAt,
      },
    });

    // Optionally, sync variants & images - simplified example: replace variants
    if (Array.isArray(payload.variants) && payload.variants.length > 0) {
      // delete old variants
      await prisma.variant.deleteMany({ where: { productId: upsert.id } });

      const variantsToCreate = payload.variants.map((v) => ({
        productId: upsert.id,
        shopifyVariantId: v.id ? String(v.id) : undefined,
        shopifyProductId: shopifyProductId,
        title: v.title ?? null,
        sku: v.sku ?? null,
        price: v.price ? Number(v.price) : null,
        inventoryQuantity: typeof v.inventory_quantity === 'number' ? v.inventory_quantity : null,
      }));

      if (variantsToCreate.length > 0) {
        await prisma.variant.createMany({ data: variantsToCreate, skipDuplicates: true });
      }
    }

    return NextResponse.json({ ok: true, productId: upsert.id }, { status: 200 });
  } catch (err) {
    console.error('products webhook error:', err);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

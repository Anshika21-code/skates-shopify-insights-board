import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Shopify webhook: orders/create & orders/updated
 * Verifies HMAC and upserts order + line items + links to customer.
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

    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const shopifyOrderId = String(payload.id);
    const orderNumericId = payload.order_number ?? null;

    // Find or create customer reference (shopify customer may be null for guest checkouts)
    let customerId = null;
    if (payload.customer && payload.customer.id) {
      const shopifyCustomerId = String(payload.customer.id);
      const customer = await prisma.customer.findUnique({
        where: { shopifyId: shopifyCustomerId },
        select: { id: true },
      });
      if (customer) customerId = customer.id;
      else {
        // create minimal customer record
        const created = await prisma.customer.create({
          data: {
            shopifyId: shopifyCustomerId,
            firstName: payload.customer.first_name ?? null,
            lastName: payload.customer.last_name ?? null,
            email: payload.customer.email ? String(payload.customer.email).toLowerCase() : null,
            createdAtShopify: payload.customer.created_at ? new Date(payload.customer.created_at) : null,
            updatedAtShopify: payload.customer.updated_at ? new Date(payload.customer.updated_at) : null,
          },
        });
        customerId = created.id;
      }
    }

    // Upsert order
    const totalPrice = payload.total_price ? Number(payload.total_price) : null;
    const createdAt = payload.created_at ? new Date(payload.created_at) : null;
    const updatedAt = payload.updated_at ? new Date(payload.updated_at) : null;
    const financialStatus = payload.financial_status ?? null;
    const fulfillmentStatus = payload.fulfillment_status ?? null;
    const currency = payload.currency ?? null;

    // Upsert order header
    const upsertedOrder = await prisma.order.upsert({
      where: { shopifyId: shopifyOrderId },
      update: {
        orderNumber: orderNumericId,
        totalPrice,
        currency,
        financialStatus,
        fulfillmentStatus,
        updatedAtShopify: updatedAt,
        customerId: customerId,
      },
      create: {
        shopifyId: shopifyOrderId,
        orderNumber: orderNumericId,
        totalPrice,
        currency,
        financialStatus,
        fulfillmentStatus,
        createdAtShopify: createdAt,
        updatedAtShopify: updatedAt,
        customerId: customerId,
      },
    });

    // Replace line items: delete existing line items for this order then recreate (simple approach)
    if (payload.line_items && Array.isArray(payload.line_items)) {
      // delete existing
      await prisma.lineItem.deleteMany({ where: { orderId: upsertedOrder.id } });

      const itemsToCreate = payload.line_items.map((li) => ({
        orderId: upsertedOrder.id,
        shopifyLineItemId: li.id ? String(li.id) : undefined,
        productShopifyId: li.product_id ? String(li.product_id) : null,
        variantShopifyId: li.variant_id ? String(li.variant_id) : null,
        title: li.title ?? null,
        quantity: li.quantity ?? 1,
        price: li.price ? Number(li.price) : null,
        sku: li.sku ?? null,
      }));

      // bulk create
      if (itemsToCreate.length > 0) {
        await prisma.lineItem.createMany({
          data: itemsToCreate,
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json({ ok: true, orderId: upsertedOrder.id }, { status: 200 });
  } catch (err) {
    console.error('orders webhook error:', err);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

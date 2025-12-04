import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/insights/orders
 * Query params:
 *  - page (default 1), limit (default 20)
 *  - start, end (ISO dates optional)
 *  - group (optional) = 'date' to return grouped counts by day
 *
 * If group=date, returns array [{ date: 'YYYY-MM-DD', orders: N, revenue: X }]
 * Else returns paginated orders with basic fields.
 */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.max(1, Number(url.searchParams.get('limit')) || 20);
    const group = url.searchParams.get('group') || null;
    const startQ = url.searchParams.get('start');
    const endQ = url.searchParams.get('end');
    const start = startQ ? new Date(startQ) : null;
    const end = endQ ? new Date(endQ) : null;

    if (group === 'date') {
      // fetch orders in range and aggregate in JS by day
      const where = {};
      if (start || end) {
        where.createdAtShopify = {};
        if (start) where.createdAtShopify.gte = start;
        if (end) where.createdAtShopify.lte = end;
      }

      const orders = await prisma.order.findMany({
        where,
        select: { id: true, createdAtShopify: true, totalPrice: true },
        orderBy: { createdAtShopify: 'asc' },
      });

      const buckets = {};
      for (const o of orders) {
        const d = o.createdAtShopify ? new Date(o.createdAtShopify) : null;
        const key = d ? d.toISOString().slice(0, 10) : 'unknown';
        if (!buckets[key]) buckets[key] = { orders: 0, revenue: 0 };
        buckets[key].orders += 1;
        buckets[key].revenue += o.totalPrice ? Number(o.totalPrice) : 0;
      }

      const result = Object.keys(buckets)
        .sort()
        .map((date) => ({ date, orders: buckets[date].orders, revenue: Number(buckets[date].revenue.toFixed(2)) }));

      return NextResponse.json({ data: result });
    }

    // Paginated orders
    const where = {};
    if (start || end) {
      where.createdAtShopify = {};
      if (start) where.createdAtShopify.gte = start;
      if (end) where.createdAtShopify.lte = end;
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAtShopify: 'desc' },
        select: {
          id: true,
          shopifyId: true,
          orderNumber: true,
          totalPrice: true,
          currency: true,
          financialStatus: true,
          fulfillmentStatus: true,
          createdAtShopify: true,
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    const mapped = orders.map((o) => ({
      id: o.id,
      shopifyId: o.shopifyId,
      orderNumber: o.orderNumber,
      totalPrice: o.totalPrice ? Number(o.totalPrice) : 0,
      currency: o.currency,
      financialStatus: o.financialStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      createdAt: o.createdAtShopify,
      customer: o.customer ? {
        id: o.customer.id,
        name: [o.customer.firstName, o.customer.lastName].filter(Boolean).join(' ') || null,
        email: o.customer.email,
      } : null,
    }));

    return NextResponse.json({
      meta: { total, page, limit },
      data: mapped,
    });
  } catch (err) {
    console.error('insights/orders error:', err);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

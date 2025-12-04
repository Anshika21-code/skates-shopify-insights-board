import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/insights/revenue
 * Query params:
 *  - start (ISO) required for sensible result (defaults to 30 days)
 *  - end   (ISO) defaults to now
 *  - interval = 'day'|'month' (default 'day')
 *
 * Returns array of { period: 'YYYY-MM-DD' or 'YYYY-MM', revenue: number }
 */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const interval = url.searchParams.get('interval') || 'day';
    const endQ = url.searchParams.get('end');
    const startQ = url.searchParams.get('start');

    const end = endQ ? new Date(endQ) : new Date();
    const start = startQ ? new Date(startQ) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 30); // last 30 days default

    // fetch orders in range
    const orders = await prisma.order.findMany({
      where: {
        createdAtShopify: {
          gte: start,
          lte: end,
        },
      },
      select: { createdAtShopify: true, totalPrice: true },
      orderBy: { createdAtShopify: 'asc' },
    });

    const buckets = {};
    for (const o of orders) {
      const d = o.createdAtShopify ? new Date(o.createdAtShopify) : null;
      if (!d) continue;
      let key;
      if (interval === 'month') key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      else key = d.toISOString().slice(0, 10); // day
      if (!buckets[key]) buckets[key] = 0;
      buckets[key] += o.totalPrice ? Number(o.totalPrice) : 0;
    }

    const result = Object.keys(buckets)
      .sort()
      .map((period) => ({ period, revenue: Number(buckets[period].toFixed(2)) }));

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error('insights/revenue error:', err);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

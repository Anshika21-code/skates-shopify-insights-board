import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/insights/overview
 * Query params (optional):
 *  - start (ISO date)
 *  - end   (ISO date)
 *
 * Returns totals: customers, orders, revenue, avgOrderValue
 */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const startQ = url.searchParams.get('start');
    const endQ = url.searchParams.get('end');

    const start = startQ ? new Date(startQ) : null;
    const end = endQ ? new Date(endQ) : null;

    // Build where clause for orders date filter
    const orderWhere = {};
    if (start || end) {
      orderWhere.createdAtShopify = {};
      if (start) orderWhere.createdAtShopify.gte = start;
      if (end) orderWhere.createdAtShopify.lte = end;
    }

    // totals
    const [totalCustomers, totalOrders, revenueAgg] = await Promise.all([
      prisma.customer.count(),
      prisma.order.count({ where: orderWhere }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: orderWhere,
      }),
    ]);

    const totalRevenue = (revenueAgg._sum && revenueAgg._sum.totalPrice) ? Number(revenueAgg._sum.totalPrice) : 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return NextResponse.json({
      totals: {
        customers: totalCustomers,
        orders: totalOrders,
        revenue: totalRevenue,
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
      },
    });
  } catch (err) {
    console.error('insights/overview error:', err);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

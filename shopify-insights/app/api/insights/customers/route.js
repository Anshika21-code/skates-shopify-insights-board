import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/insights/customers
 * Query params:
 *  - limit (default 10)
 *  - page  (default 1)
 *  - start, end (optional ISO dates to restrict orders considered)
 *
 * Returns top customers (by totalSpent) with: id, name, email, totalSpent, ordersCount
 */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const limit = Math.max(1, Number(url.searchParams.get('limit')) || 10);
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const startQ = url.searchParams.get('start');
    const endQ = url.searchParams.get('end');
    const start = startQ ? new Date(startQ) : null;
    const end = endQ ? new Date(endQ) : null;

    // Fetch customers + their orders in given range
    // Strategy: fetch customers and aggregate orders in JS for portability
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        orders: {
          where: start || end ? {
            ...(start && { createdAtShopify: { gte: start } }),
            ...(end && { createdAtShopify: { lte: end } }),
          } : {},
          select: { id: true, totalPrice: true },
        },
      },
    });

    // compute aggregates
    const aggregated = customers.map((c) => {
      const totalSpent = c.orders.reduce((s, o) => s + (o.totalPrice ? Number(o.totalPrice) : 0), 0);
      const ordersCount = c.orders.length;
      const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || null;
      return {
        id: c.id,
        name,
        email: c.email,
        totalSpent,
        ordersCount,
      };
    });

    // sort by totalSpent desc then ordersCount
    aggregated.sort((a, b) => {
      if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
      return b.ordersCount - a.ordersCount;
    });

    const startIndex = (page - 1) * limit;
    const paged = aggregated.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      meta: {
        totalCustomers: aggregated.length,
        page,
        limit,
      },
      data: paged,
    });
  } catch (err) {
    console.error('insights/customers error:', err);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

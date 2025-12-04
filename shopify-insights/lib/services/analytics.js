export class AnalyticsService {
  constructor(tenantId) {
    this.tenantId = tenantId;
  }

  async getOverview() {
    const [
      totalCustomers,
      totalOrders,
      totalRevenue,
      avgOrderValue,
    ] = await Promise.all([
      prisma.customer.count({
        where: { tenantId: this.tenantId },
      }),
      prisma.order.count({
        where: { tenantId: this.tenantId },
      }),
      prisma.order.aggregate({
        where: { tenantId: this.tenantId },
        _sum: { totalPrice: true },
      }),
      prisma.order.aggregate({
        where: { tenantId: this.tenantId },
        _avg: { totalPrice: true },
      }),
    ]);

    return {
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      avgOrderValue: avgOrderValue._avg.totalPrice || 0,
    };
  }

  async getTopCustomers(limit = 5) {
    return prisma.customer.findMany({
      where: { tenantId: this.tenantId },
      orderBy: { totalSpent: 'desc' },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalSpent: true,
        ordersCount: true,
      },
    });
  }

  async getOrdersByDate(startDate, endDate) {
    return prisma.order.groupBy({
      by: ['shopifyCreatedAt'],
      where: {
        tenantId: this.tenantId,
        shopifyCreatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalPrice: true,
      },
      _count: true,
    });
  }

  async getRevenueByMonth() {
    const orders = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "shopifyCreatedAt") as month,
        SUM("totalPrice") as revenue,
        COUNT(*) as order_count
      FROM "Order"
      WHERE "tenantId" = ${this.tenantId}
      GROUP BY DATE_TRUNC('month', "shopifyCreatedAt")
      ORDER BY month DESC
      LIMIT 12
    `;
    
    return orders;
  }
}
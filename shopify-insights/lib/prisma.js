import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Middleware for tenant isolation
prisma.$use(async (params, next) => {
  // Add tenant filtering for all queries
  if (params.model && params.args?.where) {
    const tenantId = params.args.where.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for all queries');
    }
  }
  return next(params);
});

export default prisma;
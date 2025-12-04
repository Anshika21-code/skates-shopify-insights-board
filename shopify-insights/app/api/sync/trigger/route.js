import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { IngestionService } from '@/lib/services/ingestion';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestedTenantId = body?.tenantId ? String(body.tenantId) : null;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user?.role === 'admin';
    const userTenantId = session.user?.tenantId ?? null;

    if (requestedTenantId && !isAdmin && requestedTenantId !== userTenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (requestedTenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: requestedTenantId } });
      if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

      const syncJob = await prisma.syncJob.create({
        data: {
          tenantId: tenant.id,
          status: 'started',
          triggeredBy: session.user?.id ? `user:${session.user.id}` : 'api',
          startedAt: new Date(),
          entityType: 'all',
          syncType: 'manual',
        },
      });

      const ingestion = new IngestionService(tenant.id, tenant.shopDomain, tenant.accessToken);

      ingestion
        .syncAll()
        .then(async () => {
          await prisma.syncJob.update({
            where: { id: syncJob.id },
            data: { status: 'success', completedAt: new Date() },
          });
        })
        .catch(async (err) => {
          await prisma.syncJob.update({
            where: { id: syncJob.id },
            data: { status: 'failed', errorMessage: String(err), completedAt: new Date() },
          });
        });

      return NextResponse.json({ message: 'Sync started', jobId: syncJob.id }, { status: 202 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can trigger full sync' }, { status: 403 });
    }

    const syncJob = await prisma.syncJob.create({
      data: {
        status: 'started',
        triggeredBy: session.user?.id ? `user:${session.user.id}` : 'api',
        startedAt: new Date(),
        entityType: 'all',
        syncType: 'manual',
      },
    });

    const tenants = await prisma.tenant.findMany({ where: { isActive: true } });

    tenants.forEach((tenant) => {
      (async () => {
        const child = await prisma.syncJob.create({
          data: {
            tenantId: tenant.id,
            parentJobId: syncJob.id,
            status: 'started',
            triggeredBy: session.user?.id ? `user:${session.user.id}` : 'api',
            startedAt: new Date(),
            entityType: 'all',
            syncType: 'manual',
          },
        });

        const ingestion = new IngestionService(tenant.id, tenant.shopDomain, tenant.accessToken);

        ingestion
          .syncAll()
          .then(async () => {
            await prisma.syncJob.update({
              where: { id: child.id },
              data: { status: 'success', completedAt: new Date() },
            });
          })
          .catch(async (err) => {
            await prisma.syncJob.update({
              where: { id: child.id },
              data: { status: 'failed', errorMessage: String(err), completedAt: new Date() },
            });
          });
      })();
    });

    return NextResponse.json({ message: 'Full sync started', jobId: syncJob.id }, { status: 202 });
  } catch (err) {
    console.error('Sync trigger error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

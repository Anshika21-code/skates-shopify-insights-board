import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { IngestionService } from '@/lib/services/ingestion';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = body?.name ? String(body.name).trim() : null;
    const shopDomain = body?.shopDomain ? String(body.shopDomain).toLowerCase().trim() : null;
    const accessToken = body?.accessToken ? String(body.accessToken).trim() : null;
    const scopes = Array.isArray(body?.scopes) ? body.scopes : [];

    if (!name || !shopDomain || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: name, shopDomain, accessToken' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9-]+\.myshopify\.com$/.test(shopDomain)) {
      return NextResponse.json({ error: 'Invalid shopDomain format' }, { status: 400 });
    }

    const existing = await prisma.tenant.findUnique({ where: { shopDomain } });
    if (existing) {
      return NextResponse.json(
        { error: 'Tenant already exists for this shopDomain', tenantId: existing.id },
        { status: 409 }
      );
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        shopDomain,
        accessToken,
        scopes: scopes.join(','),
        isActive: true,
        onboardedAt: new Date(),
      },
      select: { id: true, name: true, shopDomain: true, onboardedAt: true },
    });

    const syncJob = await prisma.syncJob.create({
      data: {
        tenantId: tenant.id,
        status: 'started',
        triggeredBy: 'onboard',
        startedAt: new Date(),
      },
      select: { id: true },
    });

    const ingestion = new IngestionService(tenant.id, tenant.shopDomain, accessToken);

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

    return NextResponse.json({ success: true, tenant }, { status: 201 });
  } catch (err) {
    console.error('Onboarding error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

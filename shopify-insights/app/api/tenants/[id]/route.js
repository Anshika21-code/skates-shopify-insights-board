export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncTenant } from '@/lib/services/ingestion';

/**
 * GET /api/tenants/[id] -> returns tenant info (safe fields)
 * PATCH/PUT /api/tenants/[id] -> update tenant (name, accessToken, plan, scopes)
 * DELETE /api/tenants/[id] -> soft-delete tenant
 */

// GET tenant details
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        shopDomain: true,
        plan: true,
        scopes: true,
        onboardedAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (err) {
    console.error('tenants/[id] GET error:', err);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}

// Update tenant
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { name, accessToken, plan, scopes } = body ?? {};

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const data = {};

    if (name) data.name = name;
    if (typeof accessToken === 'string' && accessToken.length > 0) {
      // encrypt in prod
      data.accessToken = accessToken;
    }
    if (plan) data.plan = plan;
    if (Array.isArray(scopes)) {
      data.scopes = scopes.join(',');
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No updatable fields provided' },
        { status: 400 }
      );
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        shopDomain: true,
        plan: true,
        scopes: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, tenant: updated });
  } catch (err) {
    console.error('tenants/[id] PATCH error:', err);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}

// Soft delete tenant
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Decide whether to cascade delete tenant data (customers, orders, products)
    // or soft-delete. Here we perform a soft-delete by default (set deletedAt).
    // If you prefer hard delete, replace this with prisma.tenant.delete(...)

    const deleted = await prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, deletedAt: true },
    });

    return NextResponse.json({ ok: true, deleted });
  } catch (err) {
    console.error('tenants/[id] DELETE error:', err);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Optional helper: manual re-sync trigger for a tenant via POST.
 * Calls syncTenant(...) and returns job id.
 */
export async function POST(req, { params }) {
  try {
    const { id } = params;

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const jobId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    try {
      await syncTenant(id, { jobId }).catch((err) => {
        console.error(
          'syncTenant error (started but failed immediately):',
          err
        );
      });
    } catch (err) {
      console.error('syncTenant thrown error:', err);
    }

    // record job
    await prisma.syncJob.create({
      data: {
        id: jobId,
        tenantId: id,
        status: 'started',
        startedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, jobId }, { status: 202 });
  } catch (err) {
    console.error('tenants/[id] POST error:', err);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}

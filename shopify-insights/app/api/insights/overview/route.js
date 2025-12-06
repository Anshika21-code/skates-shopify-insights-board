import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    orders: 123,
    customers: 456,
    revenue: 12345,
    avgOrderValue: 27.06,
  });
}

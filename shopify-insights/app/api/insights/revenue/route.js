import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    labels: ["04-11","04-12","04-13","04-14","04-15","04-16","04-17","04-18","04-19","04-20"],
    values: [2000, 4000, 3200, 5000, 6200, 5800, 7000, 7600, 8100, 7200],
  });
}

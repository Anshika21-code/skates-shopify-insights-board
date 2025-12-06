import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    labels: ["04-11","04-12","04-13","04-14","04-15","04-16","04-17","04-18","04-19","04-20"],
    values: [10, 20, 30, 15, 40, 50, 35, 45, 60, 55],
  });
}

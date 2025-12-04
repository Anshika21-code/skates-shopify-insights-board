import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clears the "token" cookie.
 */
export async function POST() {
  const res = NextResponse.json({ message: 'Logged out' });

  // clear cookie by setting maxAge=0
  res.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });

  return res;
}

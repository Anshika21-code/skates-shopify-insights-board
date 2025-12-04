import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Update this import path to where your prisma client is exported
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'replace_this_secret';
const TOKEN_EXPIRY = '7d'; // change if you want shorter/longer sessions

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Sets HttpOnly cookie "token" on success.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // create token (you can include less/more claims)
    const payload = { sub: String(user.id), email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    // Prepare response and set cookie
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      message: 'Logged in',
    });

    // Cookie options - adjust secure in production
    res.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

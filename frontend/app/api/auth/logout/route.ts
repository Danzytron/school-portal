import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });

  // Invalidate session cookies
  response.cookies.delete('auth_token');
  response.cookies.delete('auth_role');

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  console.info(`[SECURITY AUDIT] User logged out from IP: ${ip}`);

  return response;
}

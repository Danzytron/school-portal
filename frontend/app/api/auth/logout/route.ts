import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });

  const host = request.headers.get('host') || '';
  const isCustomDomain = host.includes('cebucecportal.site');
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieDomain = isProduction && isCustomDomain ? '.cebucecportal.site' : undefined;

  // Invalidate session cookies on current host
  response.cookies.delete('auth_token');
  response.cookies.delete('auth_role');

  // Invalidate session cookies across all subdomains if on production domain
  if (cookieDomain) {
    response.cookies.set({
      name: 'auth_token',
      value: '',
      domain: cookieDomain,
      path: '/',
      maxAge: 0,
    });
    response.cookies.set({
      name: 'auth_role',
      value: '',
      domain: cookieDomain,
      path: '/',
      maxAge: 0,
    });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  console.info(`[SECURITY AUDIT] User logged out from IP: ${ip}`);

  return response;
}

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://school-portal-production-23ee.up.railway.app/api';

function setSessionCookies(response: NextResponse, request: NextRequest, token: string, role: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  const host = request.headers.get('host') || '';
  const isCustomDomain = host.includes('cebucecportal.site');
  const cookieDomain = isProduction && isCustomDomain ? '.cebucecportal.site' : undefined;

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7200, // 2 hours
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };

  response.cookies.set({
    name: 'auth_token',
    value: token,
    ...cookieOptions,
  });

  response.cookies.set({
    name: 'auth_role',
    value: role,
    ...cookieOptions,
  });
}

export async function GET(request: NextRequest) {
  return handleAuthMe(request);
}

export async function POST(request: NextRequest) {
  return handleAuthMe(request);
}

async function handleAuthMe(request: NextRequest) {
  let token = request.cookies.get('auth_token')?.value;
  let role = request.cookies.get('auth_role')?.value;

  // If cookie is missing, check Authorization header from client localStorage
  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  if (!token && bearerToken) {
    token = bearerToken;
  }

  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  // If token is present but role cookie is missing, resolve role from backend
  if (!role && token) {
    try {
      const backendRes = await fetch(`${BACKEND_API_URL.replace(/\/+$/, '')}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (backendRes.ok) {
        const user = await backendRes.json().catch(() => null);
        if (user && user.role) {
          role = user.role;
        }
      }
    } catch {
      // Backend unreachable or token invalid
    }
  }

  if (!role) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  const response = NextResponse.json({
    authenticated: true,
    role,
  });

  // Re-sync cookies on response if they were missing or recovering
  setSessionCookies(response, request, token, role);

  return response;
}


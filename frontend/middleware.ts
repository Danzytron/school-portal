import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Canonicalize apex domain to www in production to prevent cookie mismatch & redirect loops
  if (host === 'cebucecportal.site') {
    const canonical = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://www.cebucecportal.site');
    return NextResponse.redirect(canonical, 308);
  }

  // Protected route paths
  const isStudentRoute = pathname.startsWith('/student');
  const isTeacherRoute = pathname.startsWith('/teacher');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isStudentRoute || isTeacherRoute || isAdminRoute) {
    const token = request.cookies.get('auth_token')?.value;
    const rawRole = request.cookies.get('auth_role')?.value;
    const role = (rawRole || '').toLowerCase();

    // 1. Check if user has an active session
    if (!token || !role) {
      const loginUrl = new URL('/login', request.nextUrl.origin);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Strict Role Verification
    if (isStudentRoute && role !== 'student') {
      return NextResponse.redirect(new URL('/unauthorized', request.nextUrl.origin));
    }
    if (isTeacherRoute && role !== 'teacher') {
      return NextResponse.redirect(new URL('/unauthorized', request.nextUrl.origin));
    }
    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.nextUrl.origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*',
    '/teacher/:path*',
    '/admin/:path*',
  ],
};

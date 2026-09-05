import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected route paths
  const isStudentRoute = pathname.startsWith('/student');
  const isTeacherRoute = pathname.startsWith('/teacher');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isStudentRoute || isTeacherRoute || isAdminRoute) {
    const token = request.cookies.get('auth_token')?.value;
    const role = request.cookies.get('auth_role')?.value;

    // 1. Check if user has an active session
    if (!token || !role) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Strict Role Verification
    if (isStudentRoute && role !== 'student') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (isTeacherRoute && role !== 'teacher') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
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

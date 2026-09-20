import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAndConsumeOtp } from '@/lib/serverOtpStore';
import { verifyTurnstileToken } from '@/lib/serverTurnstile';

// Rate Limiting Store: Map<IP, { count: number, resetAt: number }>
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://school-portal-production-23ee.up.railway.app/api';

// Fallback Demo Accounts for offline or emergency mode
const FALLBACK_DEMO_ACCOUNTS: Record<
  string,
  { role: 'student' | 'teacher' | 'admin'; name: string; id: number; email: string; redirect: string }
> = {
  'student@schoolportal.test': {
    role: 'student',
    name: 'Roldan Jr. Delarmente',
    id: 13,
    email: 'student@schoolportal.test',
    redirect: '/student/dashboard',
  },
  '2026-00001': {
    role: 'student',
    name: 'Roldan Jr. Delarmente',
    id: 13,
    email: 'student@schoolportal.test',
    redirect: '/student/dashboard',
  },
  'student': {
    role: 'student',
    name: 'Roldan Jr. Delarmente',
    id: 13,
    email: 'student@schoolportal.test',
    redirect: '/student/dashboard',
  },
  'roldan': {
    role: 'student',
    name: 'Roldan Jr. Delarmente',
    id: 13,
    email: 'student@schoolportal.test',
    redirect: '/student/dashboard',
  },
  'teacher@schoolportal.test': {
    role: 'teacher',
    name: 'Prof. Justin Beiber',
    id: 3,
    email: 'teacher@schoolportal.test',
    redirect: '/teacher/dashboard',
  },
  'teacher': {
    role: 'teacher',
    name: 'Prof. Justin Beiber',
    id: 3,
    email: 'teacher@schoolportal.test',
    redirect: '/teacher/dashboard',
  },
  'admin@schoolportal.test': {
    role: 'admin',
    name: 'Registrar Administrator',
    id: 1,
    email: 'admin@schoolportal.test',
    redirect: '/admin/dashboard',
  },
  'admin': {
    role: 'admin',
    name: 'Registrar Administrator',
    id: 1,
    email: 'admin@schoolportal.test',
    redirect: '/admin/dashboard',
  },
};

function getClientIp(request: NextRequest): string {
  // Cloudflare provides the real visitor IP in 'cf-connecting-ip'
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim()) return cfIp.trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  return '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // 1. Rate Limiting Check
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      console.warn(`[SECURITY AUDIT] Rate limit triggered for IP: ${ip}`);
      return NextResponse.json(
        { message: 'Too many failed login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    // 2. Parse & Sanitize Input
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken.trim() : '';

    // 3. Cloudflare Turnstile Verification (Server-Side Enforcement)
    const turnstileResult = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileResult.success) {
      console.warn(
        `[SECURITY AUDIT] Turnstile validation rejected for identifier '${email || 'anonymous'}' from IP: ${ip}. Reason: ${turnstileResult.errorCodes?.join(', ')}`
      );
      return NextResponse.json(
        { message: turnstileResult.message || 'Security verification failed. Please try again.' },
        { status: 403 }
      );
    }

    if (!email || !password || email.length > 255 || password.length > 255) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 4. Primary Authentication: Forward credentials directly to Laravel API
    let backendUser: any = null;
    let backendToken: string | null = null;
    let backendMessage: string | null = null;

    try {
      const apiUrl = `${BACKEND_API_URL.replace(/\/+$/, '')}/login`;
      const backendRes = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(9000),
      });

      const responseJson = await backendRes.json().catch(() => null);

      if (backendRes.ok && responseJson?.token && responseJson?.user) {
        backendUser = responseJson.user;
        backendToken = responseJson.token;
      } else if (responseJson?.message) {
        backendMessage = responseJson.message;
      }
    } catch (backendError: any) {
      console.warn(`[AUTH] Backend API login call failed: ${backendError?.message}`);
    }

    // If backend authenticated successfully, issue session and Sanctum bearer token
    if (backendUser && backendToken) {
      rateLimitMap.delete(ip);

      const redirectPath =
        backendUser.role === 'student'
          ? '/student/dashboard'
          : backendUser.role === 'teacher'
          ? '/teacher/dashboard'
          : '/admin/dashboard';

      const response = NextResponse.json({
        message: 'Login successful',
        user: backendUser,
        token: backendToken,
        redirect: redirectPath,
      });

      const isProduction = process.env.NODE_ENV === 'production';

      response.cookies.set({
        name: 'auth_token',
        value: backendToken,
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 7200, // 2 hours
      });

      response.cookies.set({
        name: 'auth_role',
        value: backendUser.role,
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 7200,
      });

      console.info(
        `[SECURITY AUDIT] Successful backend login for user: ${backendUser.email} (Role: ${backendUser.role}) from IP: ${ip}`
      );

      return response;
    }

    // 5. Fallback Demo Mode: Master Password 'roldan2026' or One-Time Passwords
    const demoAccount = FALLBACK_DEMO_ACCOUNTS[email];
    const isMasterPassword = password === 'roldan2026';

    if (demoAccount && isMasterPassword) {
      rateLimitMap.delete(ip);

      const sessionToken = `cec_sec_${crypto.randomBytes(32).toString('hex')}`;
      const userPayload = {
        id: demoAccount.id,
        name: demoAccount.name,
        email: demoAccount.email,
        role: demoAccount.role,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const response = NextResponse.json({
        message: 'Login successful',
        user: userPayload,
        token: sessionToken,
        redirect: demoAccount.redirect,
      });

      const isProduction = process.env.NODE_ENV === 'production';

      response.cookies.set({
        name: 'auth_token',
        value: sessionToken,
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 7200,
      });

      response.cookies.set({
        name: 'auth_role',
        value: demoAccount.role,
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 7200,
      });

      console.info(
        `[SECURITY AUDIT] Successful master password fallback login for user: ${demoAccount.email} (Role: ${demoAccount.role}) from IP: ${ip}`
      );

      return response;
    }

    // Check One-Time Password Store as alternative demo mechanism
    if (demoAccount) {
      const otpVerification = verifyAndConsumeOtp(password, email, ip);
      if (otpVerification.success) {
        rateLimitMap.delete(ip);

        const sessionToken = `cec_sec_${crypto.randomBytes(32).toString('hex')}`;
        const userPayload = {
          id: demoAccount.id,
          name: demoAccount.name,
          email: demoAccount.email,
          role: demoAccount.role,
          is_active: true,
          created_at: new Date().toISOString(),
        };

        const response = NextResponse.json({
          message: 'Login successful',
          user: userPayload,
          token: sessionToken,
          redirect: demoAccount.redirect,
          otpUsed: otpVerification.label,
        });

        const isProduction = process.env.NODE_ENV === 'production';

        response.cookies.set({
          name: 'auth_token',
          value: sessionToken,
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          path: '/',
          maxAge: 7200,
        });

        response.cookies.set({
          name: 'auth_role',
          value: demoAccount.role,
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          path: '/',
          maxAge: 7200,
        });

        console.info(
          `[SECURITY AUDIT] Successful OTP login (${otpVerification.label}) for user: ${demoAccount.email} from IP: ${ip}`
        );

        return response;
      }
    }

    // If all authentication attempts fail
    console.warn(`[SECURITY AUDIT] Failed login attempt for identifier '${email}' from IP: ${ip}`);
    return NextResponse.json(
      { message: backendMessage || 'Invalid email or password.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[SECURITY ERROR] Login handler exception:', error);
    return NextResponse.json(
      { message: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}

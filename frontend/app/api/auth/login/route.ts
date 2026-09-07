import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAndConsumeOtp } from '@/lib/serverOtpStore';
import { verifyTurnstileToken } from '@/lib/serverTurnstile';

// Rate Limiting Store: Map<IP, { count: number, resetAt: number }>
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Server-side Registered Accounts
const SERVER_ACCOUNTS: Record<
  string,
  { role: 'student' | 'teacher' | 'admin'; name: string; id: number; redirect: string }
> = {
  'student@schoolportal.test': {
    role: 'student',
    name: 'Roldan Jr. Delarmente',
    id: 3,
    redirect: '/student/dashboard',
  },
  '2026-00001': {
    role: 'student',
    name: 'Roldan Jr. Delarmente',
    id: 3,
    redirect: '/student/dashboard',
  },
  'teacher@schoolportal.test': {
    role: 'teacher',
    name: 'Prof. Justin Beiber',
    id: 2,
    redirect: '/teacher/dashboard',
  },
  'admin@schoolportal.test': {
    role: 'admin',
    name: 'Registrar Administrator',
    id: 1,
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

    // 4. Find Matching Account
    const account = SERVER_ACCOUNTS[email];
    if (!account) {
      console.warn(`[SECURITY AUDIT] Unknown identifier login attempt: ${email} from IP: ${ip}`);
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 5. Authenticate using One-Time Password Store
    const otpVerification = verifyAndConsumeOtp(password, email, ip);

    if (!otpVerification.success) {
      if (otpVerification.reason === 'ALREADY_USED') {
        console.warn(`[SECURITY AUDIT] Reused OTP attempt for ${email} from IP: ${ip}`);
        return NextResponse.json(
          { message: 'This one-time password has already been used.' },
          { status: 401 }
        );
      }

      console.warn(`[SECURITY AUDIT] Invalid password attempt for ${email} from IP: ${ip}`);
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Reset rate limit on successful authentication
    rateLimitMap.delete(ip);

    // 5. Generate Secure Session Token
    const sessionToken = `cec_sec_${crypto.randomBytes(32).toString('hex')}`;
    const userPayload = {
      id: account.id,
      name: account.name,
      email: email,
      role: account.role,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    console.info(
      `[SECURITY AUDIT] Successful OTP login (${otpVerification.label}) for user: ${email} (Role: ${account.role}) from IP: ${ip}`
    );

    // 6. Construct Response & Set Secure HttpOnly Cookies
    const response = NextResponse.json({
      message: 'Login successful',
      user: userPayload,
      token: sessionToken,
      redirect: account.redirect,
      otpUsed: otpVerification.label,
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // Cookie: auth_token (HttpOnly, Secure in prod, SameSite=Lax)
    response.cookies.set({
      name: 'auth_token',
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7200, // 2 hours
    });

    // Cookie: auth_role (Used by Edge Middleware for instant role validation)
    response.cookies.set({
      name: 'auth_role',
      value: account.role,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7200,
    });

    return response;
  } catch (error) {
    console.error('[SECURITY ERROR] Login handler exception:', error);
    return NextResponse.json(
      { message: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
